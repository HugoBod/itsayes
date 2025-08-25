-- Migration 007: Implement Row Level Security Policies
-- Smart Hybrid Multi-Tenant Architecture - Wedding Planning SaaS
-- Created: 2025-08-24
-- CRITICAL: This provides complete data isolation between tenants

-- Enable RLS on all tables
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE views ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- ACCOUNTS TABLE POLICIES
-- =============================================================================

-- Users can only see accounts they are members of
CREATE POLICY "accounts_select_policy" ON accounts
  FOR SELECT USING (
    id IN (
      SELECT account_id FROM account_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Only account owners can update account details
CREATE POLICY "accounts_update_policy" ON accounts
  FOR UPDATE USING (
    id IN (
      SELECT account_id FROM account_members 
      WHERE user_id = auth.uid() AND role = 'owner' AND is_active = true
    )
  );

-- Users can create new accounts (for signup flow)
CREATE POLICY "accounts_insert_policy" ON accounts
  FOR INSERT WITH CHECK (true);

-- =============================================================================
-- ACCOUNT MEMBERS TABLE POLICIES
-- =============================================================================

-- Users can see members of accounts they belong to
CREATE POLICY "account_members_select_policy" ON account_members
  FOR SELECT USING (
    account_id IN (
      SELECT account_id FROM account_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Account owners/admins can manage memberships
CREATE POLICY "account_members_insert_policy" ON account_members
  FOR INSERT WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true
    )
  );

CREATE POLICY "account_members_update_policy" ON account_members
  FOR UPDATE USING (
    account_id IN (
      SELECT account_id FROM account_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true
    )
  );

-- =============================================================================
-- WORKSPACES TABLE POLICIES
-- =============================================================================

-- Users can see workspaces they have access to
CREATE POLICY "workspaces_select_policy" ON workspaces
  FOR SELECT USING (
    -- Direct workspace access
    id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
    OR
    -- Or access via account membership
    account_id IN (
      SELECT account_id FROM account_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Account members can create workspaces (within limits)
CREATE POLICY "workspaces_insert_policy" ON workspaces
  FOR INSERT WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Workspace owners and account owners can update workspaces
CREATE POLICY "workspaces_update_policy" ON workspaces
  FOR UPDATE USING (
    id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true
    )
    OR
    account_id IN (
      SELECT account_id FROM account_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true
    )
  );

-- =============================================================================
-- WORKSPACE MEMBERS TABLE POLICIES
-- =============================================================================

-- Users can see members of workspaces they have access to
CREATE POLICY "workspace_members_select_policy" ON workspace_members
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Workspace owners/admins can manage memberships
CREATE POLICY "workspace_members_insert_policy" ON workspace_members
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true
      AND can_invite_others = true
    )
  );

CREATE POLICY "workspace_members_update_policy" ON workspace_members
  FOR UPDATE USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true
    )
  );

-- =============================================================================
-- BOARDS TABLE POLICIES
-- =============================================================================

-- Users can see boards in workspaces they have access to
CREATE POLICY "boards_select_policy" ON boards
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Members with edit permissions can create boards
CREATE POLICY "boards_insert_policy" ON boards
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'editor') AND is_active = true
    )
  );

-- Members with edit permissions can update boards
CREATE POLICY "boards_update_policy" ON boards
  FOR UPDATE USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'editor') AND is_active = true
    )
  );

-- =============================================================================
-- VIEWS TABLE POLICIES
-- =============================================================================

-- Users can see views in boards they have access to
CREATE POLICY "views_select_policy" ON views
  FOR SELECT USING (
    board_id IN (
      SELECT b.id FROM boards b
      JOIN workspace_members wm ON b.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.uid() AND wm.is_active = true
    )
  );

-- Members with edit permissions can create/update views
CREATE POLICY "views_insert_policy" ON views
  FOR INSERT WITH CHECK (
    board_id IN (
      SELECT b.id FROM boards b
      JOIN workspace_members wm ON b.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.uid() AND wm.role IN ('owner', 'admin', 'editor') AND wm.is_active = true
    )
  );

CREATE POLICY "views_update_policy" ON views
  FOR UPDATE USING (
    board_id IN (
      SELECT b.id FROM boards b
      JOIN workspace_members wm ON b.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.uid() AND wm.role IN ('owner', 'admin', 'editor') AND wm.is_active = true
    )
  );

-- =============================================================================
-- ITEMS TABLE POLICIES (CRITICAL - Core data access)
-- =============================================================================

-- Users can see items in workspaces they have access to
CREATE POLICY "items_select_policy" ON items
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Members with edit permissions can create items
CREATE POLICY "items_insert_policy" ON items
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'editor') AND is_active = true
    )
  );

-- Item creators and members with edit permissions can update items
CREATE POLICY "items_update_policy" ON items
  FOR UPDATE USING (
    created_by = auth.uid()
    OR
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'editor') AND is_active = true
    )
  );

-- Only item creators and workspace owners can delete items
CREATE POLICY "items_delete_policy" ON items
  FOR DELETE USING (
    created_by = auth.uid()
    OR
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true
    )
  );

-- =============================================================================
-- COMMENTS TABLE POLICIES
-- =============================================================================

-- Users can see comments on items they have access to
CREATE POLICY "comments_select_policy" ON comments
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Users can create comments on items they can see
CREATE POLICY "comments_insert_policy" ON comments
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Users can update their own comments
CREATE POLICY "comments_update_policy" ON comments
  FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own comments, or workspace admins can delete any
CREATE POLICY "comments_delete_policy" ON comments
  FOR DELETE USING (
    user_id = auth.uid()
    OR
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true
    )
  );

-- =============================================================================
-- ACTIVITY LOGS TABLE POLICIES
-- =============================================================================

-- Users can see activity logs in workspaces they have access to
CREATE POLICY "activity_logs_select_policy" ON activity_logs
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- System can insert activity logs (no user INSERT needed)
CREATE POLICY "activity_logs_insert_policy" ON activity_logs
  FOR INSERT WITH CHECK (true);

-- Activity logs are immutable (no UPDATE/DELETE policies)

-- =============================================================================
-- ATTACHMENTS TABLE POLICIES
-- =============================================================================

-- Users can see attachments in workspaces they have access to
CREATE POLICY "attachments_select_policy" ON attachments
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Users can upload attachments to workspaces they have access to
CREATE POLICY "attachments_insert_policy" ON attachments
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Users can update their own attachments
CREATE POLICY "attachments_update_policy" ON attachments
  FOR UPDATE USING (uploaded_by = auth.uid());

-- Users can delete their own attachments, or workspace admins can delete any
CREATE POLICY "attachments_delete_policy" ON attachments
  FOR DELETE USING (
    uploaded_by = auth.uid()
    OR
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true
    )
  );