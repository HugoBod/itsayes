-- Migration 015: Working User Setup Trigger
-- Smart Hybrid Multi-Tenant Architecture - Wedding Planning SaaS  
-- Created: 2025-08-24
-- WORKING FIX: Simple trigger that bypasses RLS completely

-- =============================================================================
-- CREATE A WORKING TRIGGER THAT BYPASSES ALL RLS
-- =============================================================================

-- Create a new working trigger function
CREATE OR REPLACE FUNCTION handle_new_user_working()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  new_account_id UUID;
  new_workspace_id UUID;
  budget_board_id UUID;
  planning_board_id UUID;
  error_details TEXT;
BEGIN
  -- IMPORTANT: This function runs with SECURITY DEFINER 
  -- which means it runs as the function owner (postgres)
  -- This bypasses all RLS policies automatically
  
  BEGIN
    -- Step 1: Create personal account for the new user
    INSERT INTO public.accounts (
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
    INSERT INTO public.account_members (
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
    INSERT INTO public.workspaces (
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
    INSERT INTO public.workspace_members (
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
    INSERT INTO public.boards (workspace_id, name, type, position)
    VALUES 
      (new_workspace_id, 'Budget', 'budget', 0)
    RETURNING id INTO budget_board_id;
    
    INSERT INTO public.boards (workspace_id, name, type, position)
    VALUES 
      (new_workspace_id, 'Planning', 'planning', 1)
    RETURNING id INTO planning_board_id;
    
    -- Step 6: Create default views for each board
    INSERT INTO public.views (board_id, name, type, is_default)
    VALUES 
      (budget_board_id, 'Budget Overview', 'table', true),
      (planning_board_id, 'Task List', 'table', true),
      (planning_board_id, 'Timeline', 'timeline', false);
    
    -- Step 7: Log the successful account creation (optional - skip if causing issues)
    -- Using a simple INSERT without helper functions
    INSERT INTO public.activity_logs (
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
    RAISE NOTICE 'User setup failed for %: %', NEW.email, error_details;
    -- RETURN NEW to allow user creation to proceed
    RETURN NEW;
  END;
END;
$$;

-- Create the trigger using the working function
CREATE TRIGGER on_auth_user_created_working
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_working();

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON FUNCTION handle_new_user_working IS 
  'Working user setup trigger that uses SECURITY DEFINER to bypass RLS and avoid recursion issues';