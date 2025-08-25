-- Migration 013: Simple RLS Fix - Remove Recursion Completely
-- Smart Hybrid Multi-Tenant Architecture - Wedding Planning SaaS
-- Created: 2025-08-24
-- SIMPLE FIX: Allow authenticated users to see data they need, service role does everything

-- =============================================================================
-- DROP ALL PROBLEMATIC POLICIES
-- =============================================================================

-- Disable RLS temporarily
ALTER TABLE account_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "account_members_own" ON account_members;
DROP POLICY IF EXISTS "account_members_account_access" ON account_members;
DROP POLICY IF EXISTS "account_members_create" ON account_members;
DROP POLICY IF EXISTS "account_members_modify" ON account_members;
DROP POLICY IF EXISTS "workspace_members_own" ON workspace_members;
DROP POLICY IF EXISTS "workspace_members_workspace_access" ON workspace_members;
DROP POLICY IF EXISTS "workspace_members_create" ON workspace_members;
DROP POLICY IF EXISTS "workspace_members_modify" ON workspace_members;

-- =============================================================================
-- SIMPLE, NON-RECURSIVE POLICIES
-- =============================================================================

-- Re-enable RLS
ALTER TABLE account_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- ACCOUNT MEMBERS: Simple policies without recursion
-- Allow all authenticated users to see account memberships (they'll filter in app)
CREATE POLICY "account_members_read" ON account_members
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Allow service role and users to create memberships  
CREATE POLICY "account_members_write" ON account_members
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

-- Allow users to update their own memberships or service role to do anything
CREATE POLICY "account_members_update" ON account_members
  FOR UPDATE USING (auth.role() = 'service_role' OR auth.uid() = user_id);

-- WORKSPACE MEMBERS: Simple policies without recursion  
-- Allow all authenticated users to see workspace memberships (they'll filter in app)
CREATE POLICY "workspace_members_read" ON workspace_members
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Allow service role and users to create memberships
CREATE POLICY "workspace_members_write" ON workspace_members
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

-- Allow users to update their own memberships or service role to do anything
CREATE POLICY "workspace_members_update" ON workspace_members
  FOR UPDATE USING (auth.role() = 'service_role' OR auth.uid() = user_id);

-- =============================================================================
-- UPDATE TRIGGER TO USE SERVICE ROLE PROPERLY
-- =============================================================================

-- Update the trigger function to set role properly
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_account_id UUID;
  new_workspace_id UUID;
  budget_board_id UUID;
  planning_board_id UUID;
  error_details TEXT;
BEGIN
  -- CRITICAL: Set role to service_role to bypass RLS
  PERFORM set_config('role', 'service_role', true);
  
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

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON POLICY "account_members_read" ON account_members IS 
  'Allow authenticated users to read account memberships (app will filter appropriately)';
  
COMMENT ON POLICY "workspace_members_read" ON workspace_members IS 
  'Allow authenticated users to read workspace memberships (app will filter appropriately)';

COMMENT ON FUNCTION handle_new_user IS 
  'Updated user setup trigger that properly uses service_role to bypass RLS during user creation';