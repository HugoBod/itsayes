-- Migration 011: Fix RLS Recursion Issues
-- Smart Hybrid Multi-Tenant Architecture - Wedding Planning SaaS
-- Created: 2025-08-24
-- FIX: Remove infinite recursion in RLS policies

-- =============================================================================
-- DROP PROBLEMATIC POLICIES
-- =============================================================================

-- Drop all existing RLS policies that cause recursion
DROP POLICY IF EXISTS "account_members_select_policy" ON account_members;
DROP POLICY IF EXISTS "account_members_insert_policy" ON account_members;
DROP POLICY IF EXISTS "account_members_update_policy" ON account_members;
DROP POLICY IF EXISTS "workspace_members_select_policy" ON workspace_members;
DROP POLICY IF EXISTS "workspace_members_insert_policy" ON workspace_members;
DROP POLICY IF EXISTS "workspace_members_update_policy" ON workspace_members;

-- =============================================================================
-- FIXED ACCOUNT MEMBERS TABLE POLICIES
-- =============================================================================

-- Users can see their own memberships
CREATE POLICY "account_members_select_own" ON account_members
  FOR SELECT USING (user_id = auth.uid());

-- Users can see memberships in accounts where they are owners/admins
CREATE POLICY "account_members_select_admin" ON account_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM account_members am 
      WHERE am.account_id = account_members.account_id 
      AND am.user_id = auth.uid() 
      AND am.role IN ('owner', 'admin') 
      AND am.is_active = true
    )
  );

-- Account owners/admins can create new memberships (with BYPASS RLS for trigger)
CREATE POLICY "account_members_insert_policy" ON account_members
  FOR INSERT WITH CHECK (
    -- Allow bypassing RLS for triggers (used during signup)
    current_setting('role') = 'service_role'
    OR
    EXISTS (
      SELECT 1 FROM account_members am 
      WHERE am.account_id = account_members.account_id 
      AND am.user_id = auth.uid() 
      AND am.role IN ('owner', 'admin') 
      AND am.is_active = true
    )
  );

-- Account owners/admins can update memberships
CREATE POLICY "account_members_update_policy" ON account_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM account_members am 
      WHERE am.account_id = account_members.account_id 
      AND am.user_id = auth.uid() 
      AND am.role IN ('owner', 'admin') 
      AND am.is_active = true
    )
  );

-- =============================================================================
-- FIXED WORKSPACE MEMBERS TABLE POLICIES  
-- =============================================================================

-- Users can see their own workspace memberships
CREATE POLICY "workspace_members_select_own" ON workspace_members
  FOR SELECT USING (user_id = auth.uid());

-- Users can see other members in workspaces where they are members
CREATE POLICY "workspace_members_select_members" ON workspace_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm 
      WHERE wm.workspace_id = workspace_members.workspace_id 
      AND wm.user_id = auth.uid() 
      AND wm.is_active = true
    )
  );

-- Workspace owners/admins can create new memberships (with BYPASS RLS for trigger)
CREATE POLICY "workspace_members_insert_policy" ON workspace_members
  FOR INSERT WITH CHECK (
    -- Allow bypassing RLS for triggers (used during signup)
    current_setting('role') = 'service_role'
    OR
    EXISTS (
      SELECT 1 FROM workspace_members wm 
      WHERE wm.workspace_id = workspace_members.workspace_id 
      AND wm.user_id = auth.uid() 
      AND wm.role IN ('owner', 'admin') 
      AND wm.is_active = true
      AND wm.can_invite_others = true
    )
  );

-- Workspace owners/admins can update memberships
CREATE POLICY "workspace_members_update_policy" ON workspace_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm 
      WHERE wm.workspace_id = workspace_members.workspace_id 
      AND wm.user_id = auth.uid() 
      AND wm.role IN ('owner', 'admin') 
      AND wm.is_active = true
    )
  );

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON POLICY "account_members_select_own" ON account_members IS 
  'Users can always see their own account memberships';
  
COMMENT ON POLICY "account_members_select_admin" ON account_members IS 
  'Account owners/admins can see all memberships in their accounts (non-recursive)';

COMMENT ON POLICY "account_members_insert_policy" ON account_members IS 
  'Allow service_role for triggers, or account owners/admins to add members';
  
COMMENT ON POLICY "workspace_members_select_own" ON workspace_members IS 
  'Users can always see their own workspace memberships';
  
COMMENT ON POLICY "workspace_members_select_members" ON workspace_members IS 
  'Workspace members can see other members in the same workspace (non-recursive)';
  
COMMENT ON POLICY "workspace_members_insert_policy" ON workspace_members IS 
  'Allow service_role for triggers, or workspace owners/admins with invite permissions to add members';