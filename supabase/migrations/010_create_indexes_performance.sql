-- Migration 010: Create Performance Indexes
-- Smart Hybrid Multi-Tenant Architecture - Wedding Planning SaaS
-- Created: 2025-08-24
-- Additional performance indexes for optimal query performance

-- =============================================================================
-- COMPOSITE INDEXES FOR COMMON QUERY PATTERNS
-- =============================================================================

-- Multi-tenant access patterns (workspace_id + other filters)
CREATE INDEX idx_items_workspace_type_status 
  ON items(workspace_id, type, status) 
  WHERE is_archived = false;

CREATE INDEX idx_items_workspace_board_position 
  ON items(workspace_id, board_id, position) 
  WHERE is_archived = false;

CREATE INDEX idx_items_workspace_assigned_status 
  ON items(workspace_id, assigned_to, status) 
  WHERE is_archived = false AND assigned_to IS NOT NULL;

CREATE INDEX idx_items_workspace_due_date 
  ON items(workspace_id, due_date) 
  WHERE is_archived = false AND due_date IS NOT NULL;

-- Board and view access patterns
CREATE INDEX idx_views_board_default 
  ON views(board_id, is_default) 
  WHERE is_archived = false;

CREATE INDEX idx_boards_workspace_type_position 
  ON boards(workspace_id, type, position) 
  WHERE is_archived = false;

-- =============================================================================
-- JSONB SPECIFIC INDEXES FOR FLEXIBLE DATA QUERIES  
-- =============================================================================

-- Items data JSONB indexes for common query patterns
-- Budget queries (amount, category, paid status)
CREATE INDEX idx_items_budget_amount 
  ON items USING GIN ((data->'amount')) 
  WHERE type = 'expense' AND is_archived = false;

CREATE INDEX idx_items_budget_category 
  ON items USING GIN ((data->'category')) 
  WHERE type = 'expense' AND is_archived = false;

CREATE INDEX idx_items_budget_paid 
  ON items USING GIN ((data->'paid')) 
  WHERE type = 'expense' AND is_archived = false;

-- Task queries (priority, completed, category)
CREATE INDEX idx_items_task_priority 
  ON items USING GIN ((data->'priority')) 
  WHERE type = 'task' AND is_archived = false;

CREATE INDEX idx_items_task_completed 
  ON items USING GIN ((data->'completed')) 
  WHERE type = 'task' AND is_archived = false;

-- Onboarding data indexes for workspace queries
CREATE INDEX idx_workspaces_onboarding_couple_step 
  ON workspaces USING GIN ((onboarding_data_couple->'step_1')) 
  WHERE onboarding_completed_at IS NULL;

CREATE INDEX idx_workspaces_onboarding_planner_step 
  ON workspaces USING GIN ((onboarding_data_planner->'step_1')) 
  WHERE onboarding_completed_at IS NULL;

-- =============================================================================
-- MEMBERSHIP AND COLLABORATION INDEXES
-- =============================================================================

-- Workspace member activity tracking (additional composite indexes)
CREATE INDEX idx_workspace_members_permissions 
  ON workspace_members(workspace_id, role, can_edit_budget, can_edit_planning) 
  WHERE is_active = true;

-- Comment threading and workspace filtering
CREATE INDEX idx_comments_item_created 
  ON comments(item_id, created_at DESC) 
  WHERE is_archived = false;

CREATE INDEX idx_comments_workspace_created 
  ON comments(workspace_id, created_at DESC) 
  WHERE is_archived = false;

CREATE INDEX idx_comments_threads 
  ON comments(parent_comment_id, created_at ASC) 
  WHERE parent_comment_id IS NOT NULL AND is_archived = false;

-- =============================================================================
-- ACTIVITY AND AUDIT INDEXES
-- =============================================================================

-- Activity logs for dashboard feeds and audit trails
CREATE INDEX idx_activity_logs_workspace_recent 
  ON activity_logs(workspace_id, created_at DESC);

CREATE INDEX idx_activity_logs_user_recent 
  ON activity_logs(user_id, created_at DESC);

CREATE INDEX idx_activity_logs_resource_recent 
  ON activity_logs(resource_type, resource_id, created_at DESC);

-- Activity details JSONB search
CREATE INDEX idx_activity_logs_action_details 
  ON activity_logs USING GIN (details) 
  WHERE action IN ('created', 'updated', 'completed');

-- =============================================================================
-- FILE ATTACHMENT INDEXES
-- =============================================================================

-- Attachment access patterns
CREATE INDEX idx_attachments_workspace_type 
  ON attachments(workspace_id, attachable_type, attachable_id) 
  WHERE is_archived = false;

CREATE INDEX idx_attachments_images 
  ON attachments(workspace_id, is_image, created_at DESC) 
  WHERE is_image = true AND is_archived = false;

CREATE INDEX idx_attachments_processing 
  ON attachments(processing_status, created_at) 
  WHERE processing_status IN ('pending', 'processing');

-- =============================================================================
-- SEARCH AND FILTERING INDEXES
-- =============================================================================

-- Full-text search preparation (for future search functionality)
CREATE INDEX idx_items_title_search 
  ON items USING GIN (to_tsvector('english', title)) 
  WHERE is_archived = false;

CREATE INDEX idx_workspaces_name_search 
  ON workspaces USING GIN (to_tsvector('english', name)) 
  WHERE is_archived = false;

-- Date range queries for planning and reporting
CREATE INDEX idx_items_created_date_range 
  ON items(workspace_id, created_at) 
  WHERE is_archived = false;

CREATE INDEX idx_items_due_date_range 
  ON items(workspace_id, due_date) 
  WHERE is_archived = false AND due_date IS NOT NULL;

-- =============================================================================
-- BILLING AND SUBSCRIPTION INDEXES
-- =============================================================================

-- Account billing and subscription queries
CREATE INDEX idx_accounts_subscription_status_date 
  ON accounts(subscription_status, subscription_end_date) 
  WHERE is_archived = false;

CREATE INDEX idx_accounts_trial_expiry 
  ON accounts(subscription_end_date) 
  WHERE subscription_status = 'trial' AND is_archived = false;

-- =============================================================================
-- STATISTICS FOR QUERY PLANNER
-- =============================================================================

-- Update table statistics for better query planning
ANALYZE accounts;
ANALYZE account_members;
ANALYZE workspaces;
ANALYZE workspace_members;
ANALYZE boards;
ANALYZE views;
ANALYZE items;
ANALYZE comments;
ANALYZE activity_logs;
ANALYZE attachments;

-- =============================================================================
-- PARTIAL INDEXES FOR SPECIFIC SCENARIOS
-- =============================================================================

-- Active items only (most common queries exclude archived)
CREATE INDEX idx_items_active_workspace_type 
  ON items(workspace_id, type, updated_at DESC) 
  WHERE is_archived = false AND status != 'archived';

-- Recent activity for dashboard performance (no time filter in index)
CREATE INDEX idx_activity_logs_recent 
  ON activity_logs(workspace_id, created_at DESC);

-- Additional pending invitation filters (basic indexes already exist)
-- CREATE INDEX idx_workspace_members_pending - already exists in migration 005
-- CREATE INDEX idx_account_members_pending - already exists in migration 005

-- Comments for documentation
COMMENT ON INDEX idx_items_workspace_type_status IS 'Composite index for filtered item queries by workspace, type, and status';
COMMENT ON INDEX idx_items_budget_amount IS 'GIN index for JSONB amount queries in expense items';
COMMENT ON INDEX idx_workspaces_onboarding_couple_step IS 'GIN index for querying onboarding progress in couple data';
COMMENT ON INDEX idx_activity_logs_workspace_recent IS 'Index for recent activity feeds per workspace';
COMMENT ON INDEX idx_items_title_search IS 'Full-text search index for item titles (future search feature)';
COMMENT ON INDEX idx_accounts_subscription_status_date IS 'Index for subscription management and billing queries';