-- Migration 009: Create Safe Auth Triggers
-- Smart Hybrid Multi-Tenant Architecture - Wedding Planning SaaS
-- Created: 2025-08-24
-- CRITICAL: Safe triggers that don't block user creation on failure

-- =============================================================================
-- SAFE USER SETUP TRIGGER FUNCTION
-- =============================================================================

-- Handle new user signup with comprehensive error handling
-- Creates: Account → Workspace → Account Member → Workspace Member → Default Boards
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_account_id UUID;
  new_workspace_id UUID;
  budget_board_id UUID;
  planning_board_id UUID;
  error_details TEXT;
BEGIN
  -- Use TRY/CATCH equivalent in PostgreSQL (exception handling)
  BEGIN
    -- Step 1: Create personal account for the new user
    INSERT INTO accounts (
      type,
      name,
      billing_email,
      subscription_status,
      workspace_limit
    )
    VALUES (
      'personal',
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      NEW.email,
      'trial',
      1  -- v1 MVP constraint
    )
    RETURNING id INTO new_account_id;
    
    -- Step 2: Create account membership for the user
    INSERT INTO account_members (
      account_id,
      user_id,
      role,
      accepted_at
    )
    VALUES (
      new_account_id,
      NEW.id,
      'owner',
      now()
    );
    
    -- Step 3: Create default workspace
    INSERT INTO workspaces (
      account_id,
      name,
      description,
      timezone,
      currency
    )
    VALUES (
      new_account_id,
      'My Wedding Planning',
      'Your wedding planning workspace',
      COALESCE(NEW.raw_user_meta_data->>'timezone', 'UTC'),
      COALESCE(NEW.raw_user_meta_data->>'currency', 'EUR')
    )
    RETURNING id INTO new_workspace_id;
    
    -- Step 4: Create workspace membership for the user
    INSERT INTO workspace_members (
      workspace_id,
      user_id,
      role,
      accepted_at,
      can_view_budget,
      can_edit_budget,
      can_view_planning,
      can_edit_planning,
      can_invite_others
    )
    VALUES (
      new_workspace_id,
      NEW.id,
      'owner',
      now(),
      true,
      true,
      true,
      true,
      true
    );
    
    -- Step 5: Create default boards (Budget and Planning)
    INSERT INTO boards (workspace_id, name, type, position)
    VALUES 
      (new_workspace_id, 'Budget', 'budget', 0),
      (new_workspace_id, 'Planning', 'planning', 1)
    RETURNING id INTO budget_board_id;
    
    -- Get the planning board ID
    SELECT id INTO planning_board_id 
    FROM boards 
    WHERE workspace_id = new_workspace_id AND type = 'planning';
    
    -- Step 6: Create default views for each board
    INSERT INTO views (board_id, name, type, is_default)
    VALUES 
      (budget_board_id, 'Budget Overview', 'table', true),
      (planning_board_id, 'Task List', 'table', true),
      (planning_board_id, 'Timeline', 'timeline', false);
    
    -- Step 7: Log the successful account creation
    INSERT INTO activity_logs (
      workspace_id,
      user_id,
      action,
      resource_type,
      resource_id,
      details
    )
    VALUES (
      new_workspace_id,
      NEW.id,
      'created',
      'account',
      new_account_id,
      json_build_object(
        'action', 'user_signup',
        'email', NEW.email,
        'account_type', 'personal',
        'auto_created', true
      )
    );
    
    -- Success: Return the new record unchanged
    RETURN NEW;
    
  EXCEPTION WHEN OTHERS THEN
    -- CRITICAL: Log the error but DO NOT prevent user creation
    error_details := SQLERRM;
    
    -- Try to log the error (in a separate transaction)
    BEGIN
      -- Log to a simple error table or use RAISE NOTICE for debugging
      RAISE NOTICE 'User setup failed for %: %', NEW.email, error_details;
      
      -- If we have a workspace_id, try to log there
      IF new_workspace_id IS NOT NULL THEN
        INSERT INTO activity_logs (
          workspace_id,
          user_id,
          action,
          resource_type,
          resource_id,
          details
        )
        VALUES (
          new_workspace_id,
          NEW.id,
          'created',
          'error',
          NEW.id,
          json_build_object(
            'action', 'user_setup_failed',
            'error', error_details,
            'email', NEW.email
          )
        );
      END IF;
      
    EXCEPTION WHEN OTHERS THEN
      -- Even error logging failed, but we still don't want to block user creation
      RAISE NOTICE 'Error logging also failed for %', NEW.email;
    END;
    
    -- RETURN NEW to allow user creation to proceed
    RETURN NEW;
  END;
END;
$$;

-- =============================================================================
-- ACTIVITY LOGGING TRIGGERS
-- =============================================================================

-- Generic activity logging function for items
CREATE OR REPLACE FUNCTION log_item_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  action_type activity_type;
  old_data JSONB;
  new_data JSONB;
BEGIN
  -- Determine action type
  IF TG_OP = 'INSERT' THEN
    action_type := 'created';
    new_data := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'updated';
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'deleted';
    old_data := to_jsonb(OLD);
  END IF;
  
  -- Insert activity log (with error handling)
  BEGIN
    INSERT INTO activity_logs (
      workspace_id,
      user_id,
      action,
      resource_type,
      resource_id,
      details
    )
    VALUES (
      COALESCE(NEW.workspace_id, OLD.workspace_id),
      auth.uid(),
      action_type,
      'item',
      COALESCE(NEW.id, OLD.id),
      CASE 
        WHEN TG_OP = 'UPDATE' THEN 
          json_build_object(
            'old_data', old_data,
            'new_data', new_data,
            'changed_fields', (
              SELECT json_agg(key)
              FROM jsonb_each(old_data)
              WHERE key IN (SELECT jsonb_object_keys(new_data))
              AND old_data->key != new_data->key
            )
          )
        ELSE 
          COALESCE(new_data, old_data)
      END
    );
  EXCEPTION WHEN OTHERS THEN
    -- Don't let activity logging failures break the main operation
    RAISE NOTICE 'Activity logging failed: %', SQLERRM;
  END;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- =============================================================================
-- CREATE TRIGGERS
-- =============================================================================

-- User signup trigger (the critical one that was failing)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Activity logging triggers for items
CREATE TRIGGER items_activity_log
  AFTER INSERT OR UPDATE OR DELETE ON items
  FOR EACH ROW
  EXECUTE FUNCTION log_item_activity();

-- Workspace member access tracking
CREATE OR REPLACE FUNCTION update_member_last_accessed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update last_accessed_at when items are viewed/modified
  -- This runs after RLS checks, so user already has access
  UPDATE workspace_members
  SET last_accessed_at = now()
  WHERE workspace_id = NEW.workspace_id
  AND user_id = auth.uid();
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Don't let this break the main operation
  RETURN NEW;
END;
$$;

CREATE TRIGGER items_update_last_accessed
  AFTER INSERT OR UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_member_last_accessed();

-- =============================================================================
-- WORKSPACE CONSTRAINT VALIDATION
-- =============================================================================

-- Enforce v1 workspace limit (1 workspace per account)
CREATE OR REPLACE FUNCTION validate_workspace_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  current_count INTEGER;
  workspace_limit INTEGER;
BEGIN
  -- Get account's workspace limit
  SELECT a.workspace_limit INTO workspace_limit
  FROM accounts a
  WHERE a.id = NEW.account_id;
  
  -- Count existing workspaces for this account
  SELECT COUNT(*) INTO current_count
  FROM workspaces
  WHERE account_id = NEW.account_id
  AND is_archived = false;
  
  -- Check if limit would be exceeded (accounting for this new workspace)
  IF TG_OP = 'INSERT' AND current_count >= workspace_limit THEN
    RAISE EXCEPTION 'Workspace limit exceeded. Account allows % workspaces, but % already exist.', 
      workspace_limit, current_count;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER workspaces_validate_limit
  BEFORE INSERT ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION validate_workspace_limit();

-- Comments for documentation
COMMENT ON FUNCTION handle_new_user IS 'Safe user setup trigger that creates account, workspace, and default boards without blocking user creation';
COMMENT ON FUNCTION log_item_activity IS 'Automatic activity logging for all item operations with error handling';
COMMENT ON FUNCTION update_member_last_accessed IS 'Track member activity by updating last_accessed_at timestamp';
COMMENT ON FUNCTION validate_workspace_limit IS 'Enforce v1 workspace limits (1 per account) before allowing workspace creation';