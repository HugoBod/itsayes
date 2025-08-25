-- Migration 012: Completely Fix RLS Recursion
-- Smart Hybrid Multi-Tenant Architecture - Wedding Planning SaaS
-- Created: 2025-08-24
-- FINAL FIX: Proper RLS without recursion

-- =============================================================================
-- DISABLE RLS TEMPORARILY FOR SETUP
-- =============================================================================

-- Temporarily disable RLS on membership tables to fix recursion
ALTER TABLE account_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on these tables
DROP POLICY IF EXISTS "account_members_select_own" ON account_members;
DROP POLICY IF EXISTS "account_members_select_admin" ON account_members;
DROP POLICY IF EXISTS "account_members_insert_policy" ON account_members;
DROP POLICY IF EXISTS "account_members_update_policy" ON account_members;
DROP POLICY IF EXISTS "workspace_members_select_own" ON workspace_members;
DROP POLICY IF EXISTS "workspace_members_select_members" ON workspace_members;
DROP POLICY IF EXISTS "workspace_members_insert_policy" ON workspace_members;
DROP POLICY IF EXISTS "workspace_members_update_policy" ON workspace_members;

-- =============================================================================
-- RE-ENABLE RLS WITH FIXED POLICIES
-- =============================================================================

-- Re-enable RLS
ALTER TABLE account_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- ACCOUNT MEMBERS - FIXED NON-RECURSIVE POLICIES
-- =============================================================================

-- Users can see their own memberships (no recursion)
CREATE POLICY "account_members_own" ON account_members
  FOR SELECT USING (user_id = auth.uid());

-- Users can see all members in accounts where they are already members
-- Uses a helper function to avoid recursion
CREATE POLICY "account_members_account_access" ON account_members
  FOR SELECT USING (user_has_account_access(account_id));

-- Allow service role (for triggers) and existing account owners to insert
CREATE POLICY "account_members_create" ON account_members
  FOR INSERT WITH CHECK (
    -- Service role bypasses (used by triggers during signup)
    (SELECT current_setting('role', true) = 'service_role')
    OR
    -- Existing account members with owner/admin role can add others
    (user_has_account_access(account_id) AND user_account_role(account_id) IN ('owner', 'admin'))
  );

-- Account owners/admins can update memberships
CREATE POLICY "account_members_modify" ON account_members
  FOR UPDATE USING (user_has_account_access(account_id) AND user_account_role(account_id) IN ('owner', 'admin'));

-- =============================================================================
-- WORKSPACE MEMBERS - FIXED NON-RECURSIVE POLICIES  
-- =============================================================================

-- Users can see their own workspace memberships (no recursion)
CREATE POLICY "workspace_members_own" ON workspace_members
  FOR SELECT USING (user_id = auth.uid());

-- Users can see members in workspaces they have access to
CREATE POLICY "workspace_members_workspace_access" ON workspace_members
  FOR SELECT USING (user_has_workspace_access(workspace_id));

-- Allow service role (for triggers) and existing workspace admins to insert
CREATE POLICY "workspace_members_create" ON workspace_members
  FOR INSERT WITH CHECK (
    -- Service role bypasses (used by triggers during signup)
    (SELECT current_setting('role', true) = 'service_role')
    OR
    -- Existing workspace members with admin privileges and invite permissions
    (user_has_workspace_access(workspace_id) AND user_workspace_role(workspace_id) IN ('owner', 'admin'))
  );

-- Workspace owners/admins can update memberships
CREATE POLICY "workspace_members_modify" ON workspace_members
  FOR UPDATE USING (user_has_workspace_access(workspace_id) AND user_workspace_role(workspace_id) IN ('owner', 'admin'));

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON POLICY "account_members_own" ON account_members IS 
  'Users can see their own account memberships';

COMMENT ON POLICY "account_members_account_access" ON account_members IS 
  'Users can see other members in accounts they belong to (uses helper function)';

COMMENT ON POLICY "account_members_create" ON account_members IS 
  'Service role (triggers) and account admins can create memberships';

COMMENT ON POLICY "workspace_members_own" ON workspace_members IS 
  'Users can see their own workspace memberships';

COMMENT ON POLICY "workspace_members_workspace_access" ON workspace_members IS 
  'Users can see members in workspaces they have access to (uses helper function)';

COMMENT ON POLICY "workspace_members_create" ON workspace_members IS 
  'Service role (triggers) and workspace admins can create memberships';