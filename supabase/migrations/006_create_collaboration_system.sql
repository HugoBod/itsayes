-- Migration 006: Create Collaboration System  
-- Smart Hybrid Multi-Tenant Architecture - Wedding Planning SaaS
-- Created: 2025-08-24

-- Comments: Collaboration and discussion on items
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Comment content
  content TEXT NOT NULL,
  content_type VARCHAR(20) DEFAULT 'text', -- 'text', 'mention', 'attachment'
  
  -- Thread support
  parent_comment_id UUID REFERENCES comments(id),
  
  -- Metadata
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Soft delete
  is_archived BOOLEAN DEFAULT false
);

-- Activity Logs: Comprehensive audit trail for all user actions
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Activity details
  action activity_type NOT NULL,
  resource_type VARCHAR(50) NOT NULL, -- 'item', 'board', 'workspace', 'member'
  resource_id UUID NOT NULL, -- ID of the affected resource
  
  -- Activity context
  details JSONB DEFAULT '{}', -- Additional context (old/new values, etc.)
  metadata JSONB DEFAULT '{}', -- User agent, IP, etc.
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now()
  -- Note: No updated_at as activity logs are immutable
);

-- Attachments: File attachments for items and comments
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships (polymorphic - can attach to items or comments)
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  attachable_type VARCHAR(20) NOT NULL, -- 'item' or 'comment'
  attachable_id UUID NOT NULL, -- item_id or comment_id
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  
  -- File information
  filename VARCHAR(500) NOT NULL,
  original_filename VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL,
  file_path TEXT NOT NULL, -- Storage path (Supabase Storage)
  
  -- File metadata
  is_image BOOLEAN DEFAULT false,
  image_width INTEGER,
  image_height INTEGER,
  
  -- Processing status
  processing_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Soft delete
  is_archived BOOLEAN DEFAULT false
);

-- Add automatic updated_at triggers
CREATE TRIGGER comments_updated_at 
  BEFORE UPDATE ON comments 
  FOR EACH ROW 
  EXECUTE FUNCTION moddatetime(updated_at);

CREATE TRIGGER attachments_updated_at 
  BEFORE UPDATE ON attachments 
  FOR EACH ROW 
  EXECUTE FUNCTION moddatetime(updated_at);

-- Indexes for performance
-- Comments indexes
CREATE INDEX idx_comments_item_id ON comments(item_id);
CREATE INDEX idx_comments_workspace_id ON comments(workspace_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;
CREATE INDEX idx_comments_created_at ON comments(created_at);
CREATE INDEX idx_comments_not_archived ON comments(is_archived) WHERE is_archived = false;

-- Activity logs indexes
CREATE INDEX idx_activity_logs_workspace_id ON activity_logs(workspace_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_resource ON activity_logs(resource_type, resource_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- Activity logs JSONB indexes for searching
CREATE INDEX idx_activity_logs_details_gin ON activity_logs USING GIN (details);

-- Attachments indexes
CREATE INDEX idx_attachments_workspace_id ON attachments(workspace_id);
CREATE INDEX idx_attachments_attachable ON attachments(attachable_type, attachable_id);
CREATE INDEX idx_attachments_uploaded_by ON attachments(uploaded_by);
CREATE INDEX idx_attachments_mime_type ON attachments(mime_type);
CREATE INDEX idx_attachments_is_image ON attachments(is_image) WHERE is_image = true;
CREATE INDEX idx_attachments_not_archived ON attachments(is_archived) WHERE is_archived = false;

-- Comments for documentation
COMMENT ON TABLE comments IS 'Collaboration system for discussions on items with threading support.';
COMMENT ON TABLE activity_logs IS 'Immutable audit trail of all user actions across the system.';
COMMENT ON TABLE attachments IS 'File attachments that can be linked to items or comments.';
COMMENT ON COLUMN comments.parent_comment_id IS 'Enables threaded discussions and replies to comments.';
COMMENT ON COLUMN activity_logs.details IS 'JSONB field containing action-specific context like old/new values.';
COMMENT ON COLUMN attachments.attachable_type IS 'Polymorphic relationship - can be "item" or "comment".';
COMMENT ON COLUMN attachments.processing_status IS 'Status for async file processing (thumbnails, virus scanning, etc.).';