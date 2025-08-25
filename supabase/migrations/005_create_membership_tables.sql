-- Migration 005: Create Membership Tables
-- Smart Hybrid Multi-Tenant Architecture - Wedding Planning SaaS
-- Created: 2025-08-24

-- Account Members: Who belongs to which account (organization-level)
-- Manages B2B team memberships for wedding planning agencies
CREATE TABLE account_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Member information
  role account_role NOT NULL DEFAULT 'member',
  
  -- Invitation system
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  
  -- Member status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  UNIQUE(account_id, user_id)
);

-- Workspace Members: Who has access to which workspace (project-level)
-- Granular permissions per wedding project
CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Member information
  role workspace_role NOT NULL DEFAULT 'viewer',
  
  -- Invitation system
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  
  -- Access control
  can_view_budget BOOLEAN DEFAULT true,
  can_edit_budget BOOLEAN DEFAULT false,
  can_view_planning BOOLEAN DEFAULT true,
  can_edit_planning BOOLEAN DEFAULT false,
  can_invite_others BOOLEAN DEFAULT false,
  
  -- Member status
  is_active BOOLEAN DEFAULT true,
  last_accessed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  UNIQUE(workspace_id, user_id)
);

-- Add automatic updated_at triggers
CREATE TRIGGER account_members_updated_at 
  BEFORE UPDATE ON account_members 
  FOR EACH ROW 
  EXECUTE FUNCTION moddatetime(updated_at);

CREATE TRIGGER workspace_members_updated_at 
  BEFORE UPDATE ON workspace_members 
  FOR EACH ROW 
  EXECUTE FUNCTION moddatetime(updated_at);

-- Indexes for performance
-- Account member indexes
CREATE INDEX idx_account_members_account_id ON account_members(account_id);
CREATE INDEX idx_account_members_user_id ON account_members(user_id);
CREATE INDEX idx_account_members_role ON account_members(role);
CREATE INDEX idx_account_members_active ON account_members(is_active) WHERE is_active = true;
CREATE INDEX idx_account_members_pending ON account_members(accepted_at) WHERE accepted_at IS NULL;

-- Workspace member indexes
CREATE INDEX idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX idx_workspace_members_role ON workspace_members(role);
CREATE INDEX idx_workspace_members_active ON workspace_members(is_active) WHERE is_active = true;
CREATE INDEX idx_workspace_members_last_accessed ON workspace_members(last_accessed_at);

-- Comments for documentation
COMMENT ON TABLE account_members IS 'Organization-level membership for B2B wedding planning agencies. Manages team access to accounts.';
COMMENT ON TABLE workspace_members IS 'Project-level membership with granular permissions per wedding workspace.';
COMMENT ON COLUMN workspace_members.can_view_budget IS 'Permission to view budget module data';
COMMENT ON COLUMN workspace_members.can_edit_budget IS 'Permission to modify budget module data';
COMMENT ON COLUMN workspace_members.can_view_planning IS 'Permission to view planning/task module data';
COMMENT ON COLUMN workspace_members.can_edit_planning IS 'Permission to modify planning/task module data';
COMMENT ON COLUMN workspace_members.last_accessed_at IS 'Timestamp for tracking workspace activity and engagement';