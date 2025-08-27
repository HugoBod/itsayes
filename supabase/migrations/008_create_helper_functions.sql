-- Migration 008: Create Helper Functions
-- Smart Hybrid Multi-Tenant Architecture - Wedding Planning SaaS
-- Created: 2025-08-24
-- Helper functions for access control and business logic

-- =============================================================================
-- ACCESS CONTROL FUNCTIONS
-- =============================================================================

-- Check if user has access to an account
CREATE OR REPLACE FUNCTION user_has_account_access(account_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM account_members
    WHERE account_id = account_uuid
    AND user_id = auth.uid()
    AND is_active = true
  );
END;
$$;

-- Check if user has access to a workspace
CREATE OR REPLACE FUNCTION user_has_workspace_access(workspace_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    -- Direct workspace membership
    SELECT 1 FROM workspace_members
    WHERE workspace_id = workspace_uuid
    AND user_id = auth.uid()
    AND is_active = true
  )
  OR EXISTS (
    -- Or access via account membership
    SELECT 1 FROM workspaces w
    JOIN account_members am ON w.account_id = am.account_id
    WHERE w.id = workspace_uuid
    AND am.user_id = auth.uid()
    AND am.is_active = true
  );
END;
$$;

-- Get user's role in a workspace
CREATE OR REPLACE FUNCTION user_workspace_role(workspace_uuid UUID)
RETURNS workspace_role
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role workspace_role;
BEGIN
  -- Check direct workspace membership first
  SELECT role INTO user_role
  FROM workspace_members
  WHERE workspace_id = workspace_uuid
  AND user_id = auth.uid()
  AND is_active = true;
  
  -- If direct membership exists, return it
  IF user_role IS NOT NULL THEN
    RETURN user_role;
  END IF;
  
  -- Check account-level access
  SELECT 
    CASE am.role
      WHEN 'owner' THEN 'owner'::workspace_role
      WHEN 'admin' THEN 'admin'::workspace_role
      ELSE 'viewer'::workspace_role
    END INTO user_role
  FROM workspaces w
  JOIN account_members am ON w.account_id = am.account_id
  WHERE w.id = workspace_uuid
  AND am.user_id = auth.uid()
  AND am.is_active = true;
  
  RETURN COALESCE(user_role, 'viewer'::workspace_role);
END;
$$;

-- Get user's role in an account
CREATE OR REPLACE FUNCTION user_account_role(account_uuid UUID)
RETURNS account_role
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role account_role;
BEGIN
  SELECT role INTO user_role
  FROM account_members
  WHERE account_id = account_uuid
  AND user_id = auth.uid()
  AND is_active = true;
  
  RETURN COALESCE(user_role, 'member'::account_role);
END;
$$;

-- =============================================================================
-- WORKSPACE MANAGEMENT FUNCTIONS
-- =============================================================================

-- Get user's default workspace (for v1 single workspace per account)
CREATE OR REPLACE FUNCTION get_user_default_workspace()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  workspace_uuid UUID;
BEGIN
  -- Get the first workspace the user has access to
  SELECT w.id INTO workspace_uuid
  FROM workspaces w
  LEFT JOIN workspace_members wm ON w.id = wm.workspace_id AND wm.user_id = auth.uid()
  LEFT JOIN account_members am ON w.account_id = am.account_id AND am.user_id = auth.uid()
  WHERE (wm.is_active = true OR am.is_active = true)
  AND w.is_archived = false
  ORDER BY w.created_at ASC
  LIMIT 1;
  
  RETURN workspace_uuid;
END;
$$;

-- Get workspace stats (item counts by type, etc.)
CREATE OR REPLACE FUNCTION get_workspace_stats(workspace_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats JSON;
BEGIN
  -- Check access first
  IF NOT user_has_workspace_access(workspace_uuid) THEN
    RETURN '{"error": "Access denied"}'::JSON;
  END IF;
  
  SELECT json_build_object(
    'total_items', COUNT(*),
    'expenses', COUNT(*) FILTER (WHERE type = 'expense'),
    'tasks', COUNT(*) FILTER (WHERE type = 'task'),
    'active_items', COUNT(*) FILTER (WHERE status = 'active'),
    'completed_items', COUNT(*) FILTER (WHERE status = 'completed'),
    'total_budget', COALESCE(SUM((data->>'amount')::numeric) FILTER (WHERE type = 'expense'), 0)
  ) INTO stats
  FROM items
  WHERE workspace_id = workspace_uuid
  AND is_archived = false;
  
  RETURN stats;
END;
$$;

-- =============================================================================
-- ONBOARDING FUNCTIONS
-- =============================================================================

-- Complete onboarding and migrate data to items
CREATE OR REPLACE FUNCTION complete_onboarding(workspace_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  workspace_rec workspaces%ROWTYPE;
  budget_board_id UUID;
  planning_board_id UUID;
  onboarding_data JSONB;
  budget_amount NUMERIC;
BEGIN
  -- Check access
  IF NOT user_has_workspace_access(workspace_uuid) THEN
    RETURN false;
  END IF;
  
  -- Get workspace record
  SELECT * INTO workspace_rec
  FROM workspaces
  WHERE id = workspace_uuid;
  
  -- Determine which onboarding data to use
  IF jsonb_typeof(workspace_rec.onboarding_data_couple) != 'null' 
     AND workspace_rec.onboarding_data_couple != '{}' THEN
    onboarding_data := workspace_rec.onboarding_data_couple;
  ELSE
    onboarding_data := workspace_rec.onboarding_data_planner;
  END IF;
  
  -- Create default boards if they don't exist
  INSERT INTO boards (workspace_id, name, type, position)
  VALUES 
    (workspace_uuid, 'Budget', 'budget', 0),
    (workspace_uuid, 'Planning', 'planning', 1)
  ON CONFLICT DO NOTHING
  RETURNING id INTO budget_board_id;
  
  -- Get board IDs
  SELECT id INTO budget_board_id FROM boards 
  WHERE workspace_id = workspace_uuid AND type = 'budget';
  
  SELECT id INTO planning_board_id FROM boards 
  WHERE workspace_id = workspace_uuid AND type = 'planning';
  
  -- Migrate budget data
  IF onboarding_data ? 'step_2' AND onboarding_data->'step_2' ? 'budget' THEN
    budget_amount := (onboarding_data->'step_2'->>'budget')::numeric;
    
    INSERT INTO items (workspace_id, board_id, title, type, data, created_by)
    VALUES (
      workspace_uuid,
      budget_board_id,
      'Total Wedding Budget',
      'expense',
      json_build_object(
        'amount', budget_amount,
        'category', 'total_budget',
        'description', 'Total budget set during onboarding'
      ),
      auth.uid()
    );
  END IF;
  
  -- Create initial planning tasks based on wedding date
  IF onboarding_data ? 'step_2' AND workspace_rec.wedding_date IS NOT NULL THEN
    INSERT INTO items (workspace_id, board_id, title, type, data, created_by, due_date)
    VALUES 
      (
        workspace_uuid,
        planning_board_id,
        'Finalize guest list',
        'task',
        json_build_object(
          'priority', 'high',
          'category', 'planning',
          'description', 'Complete and finalize the wedding guest list'
        ),
        auth.uid(),
        workspace_rec.wedding_date - interval '3 months'
      ),
      (
        workspace_uuid,
        planning_board_id,
        'Send invitations',
        'task',
        json_build_object(
          'priority', 'high',
          'category', 'communication',
          'description', 'Send wedding invitations to all guests'
        ),
        auth.uid(),
        workspace_rec.wedding_date - interval '2 months'
      );
  END IF;
  
  -- Mark onboarding as completed and migrated
  UPDATE workspaces
  SET 
    onboarding_completed_at = now(),
    onboarding_migrated_at = now()
  WHERE id = workspace_uuid;
  
  -- Log the completion
  INSERT INTO activity_logs (workspace_id, user_id, action, resource_type, resource_id, details)
  VALUES (
    workspace_uuid,
    auth.uid(),
    'completed',
    'workspace',
    workspace_uuid,
    json_build_object(
      'action', 'onboarding_completed',
      'migrated_items', true
    )
  );
  
  RETURN true;
END;
$$;

-- =============================================================================
-- ACTIVITY LOGGING FUNCTIONS
-- =============================================================================

-- Log user activity automatically
CREATE OR REPLACE FUNCTION log_activity(
  workspace_uuid UUID,
  action_type activity_type,
  resource_type_param VARCHAR(50),
  resource_id_param UUID,
  details_param JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
    workspace_uuid,
    auth.uid(),
    action_type,
    resource_type_param,
    resource_id_param,
    details_param
  );
END;
$$;

-- =============================================================================
-- UTILITY FUNCTIONS
-- =============================================================================

-- Generate unique invite code for workspace sharing
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS VARCHAR(20)
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result VARCHAR(20) := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Check if user can perform action on workspace
CREATE OR REPLACE FUNCTION can_user_perform_action(
  workspace_uuid UUID,
  required_role workspace_role
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role workspace_role;
BEGIN
  user_role := user_workspace_role(workspace_uuid);
  
  RETURN CASE
    WHEN required_role = 'viewer' THEN user_role IN ('viewer', 'editor', 'admin', 'owner')
    WHEN required_role = 'editor' THEN user_role IN ('editor', 'admin', 'owner')  
    WHEN required_role = 'admin' THEN user_role IN ('admin', 'owner')
    WHEN required_role = 'owner' THEN user_role = 'owner'
    ELSE false
  END;
END;
$$;

-- Comments for documentation
COMMENT ON FUNCTION user_has_account_access IS 'Check if current user has access to specified account';
COMMENT ON FUNCTION user_has_workspace_access IS 'Check if current user has access to specified workspace';
COMMENT ON FUNCTION user_workspace_role IS 'Get current users role in specified workspace';
COMMENT ON FUNCTION get_user_default_workspace IS 'Get users default workspace (v1 single workspace support)';
COMMENT ON FUNCTION complete_onboarding IS 'Complete onboarding process and migrate JSONB data to normalized items';
COMMENT ON FUNCTION log_activity IS 'Log user activity for audit trail';
COMMENT ON FUNCTION can_user_perform_action IS 'Check if user has sufficient permissions for action';