-- Migration 004: Create Flexible Items System
-- Smart Hybrid Multi-Tenant Architecture - Wedding Planning SaaS
-- Created: 2025-08-24

-- Boards: Organize items into modules (Budget, Planning, etc.)
-- Acts as containers for different types of content
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationship to workspace
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Board identification
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type board_type NOT NULL,
  
  -- Board configuration
  settings JSONB DEFAULT '{}', -- Board-specific settings (colors, layouts, etc.)
  position INTEGER DEFAULT 0, -- Display order
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Soft delete
  is_archived BOOLEAN DEFAULT false
);

-- Views: Different ways to display board data (table, kanban, calendar)
CREATE TABLE views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationship to board
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  
  -- View identification
  name VARCHAR(255) NOT NULL,
  type view_type NOT NULL DEFAULT 'table',
  
  -- View configuration
  filters JSONB DEFAULT '{}', -- Filtering criteria
  sort_config JSONB DEFAULT '{}', -- Sorting configuration
  column_config JSONB DEFAULT '{}', -- Column visibility and width
  display_settings JSONB DEFAULT '{}', -- View-specific display settings
  
  -- View state
  is_default BOOLEAN DEFAULT false,
  position INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Soft delete
  is_archived BOOLEAN DEFAULT false
);

-- Items: The core flexible content table with JSONB data
-- Stores ALL content types (expenses, tasks, guests, etc.) in a flexible schema
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationship to workspace and board
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  
  -- Item identification
  title VARCHAR(500) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'expense', 'task', 'guest', 'vendor', etc.
  
  -- Flexible data storage (the heart of the system)
  -- Examples:
  -- Expense: {"amount": 3000, "vendor": "Photographer", "category": "photography", "paid": false}
  -- Task: {"due_date": "2025-12-01", "priority": "high", "assignee": "Alice", "completed": false}
  -- Guest: {"email": "guest@example.com", "dietary_restrictions": ["vegetarian"], "rsvp_status": "pending"}
  data JSONB NOT NULL DEFAULT '{}',
  
  -- Item status and organization
  status item_status DEFAULT 'active',
  position REAL DEFAULT 0, -- Allows fractional positioning for drag-and-drop
  parent_id UUID REFERENCES items(id), -- For hierarchical items (sub-tasks, etc.)
  
  -- Assignment and ownership
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  due_date TIMESTAMPTZ, -- Extracted for performance (also stored in data JSONB)
  
  -- Soft delete
  is_archived BOOLEAN DEFAULT false
);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER boards_updated_at 
  BEFORE UPDATE ON boards 
  FOR EACH ROW 
  EXECUTE FUNCTION moddatetime(updated_at);

CREATE TRIGGER views_updated_at 
  BEFORE UPDATE ON views 
  FOR EACH ROW 
  EXECUTE FUNCTION moddatetime(updated_at);

CREATE TRIGGER items_updated_at 
  BEFORE UPDATE ON items 
  FOR EACH ROW 
  EXECUTE FUNCTION moddatetime(updated_at);

-- Indexes for performance
-- Board indexes
CREATE INDEX idx_boards_workspace_id ON boards(workspace_id);
CREATE INDEX idx_boards_type ON boards(type);
CREATE INDEX idx_boards_position ON boards(position);
CREATE INDEX idx_boards_not_archived ON boards(is_archived) WHERE is_archived = false;

-- View indexes  
CREATE INDEX idx_views_board_id ON views(board_id);
CREATE INDEX idx_views_type ON views(type);
CREATE INDEX idx_views_is_default ON views(is_default) WHERE is_default = true;

-- Item indexes (critical for performance)
CREATE INDEX idx_items_workspace_id ON items(workspace_id);
CREATE INDEX idx_items_board_id ON items(board_id);
CREATE INDEX idx_items_type ON items(type);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_created_by ON items(created_by);
CREATE INDEX idx_items_assigned_to ON items(assigned_to);
CREATE INDEX idx_items_due_date ON items(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_items_parent_id ON items(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_items_position ON items(position);
CREATE INDEX idx_items_not_archived ON items(is_archived) WHERE is_archived = false;

-- JSONB indexes for flexible querying
CREATE INDEX idx_items_data_gin ON items USING GIN (data);

-- Comments for documentation
COMMENT ON TABLE boards IS 'Organize items into modules (Budget, Planning, etc.). Acts as containers for different content types.';
COMMENT ON TABLE views IS 'Different ways to display board data (table, kanban, calendar) with custom filters and sorting.';
COMMENT ON TABLE items IS 'Core flexible content storage using JSONB. Stores expenses, tasks, guests, vendors, etc.';
COMMENT ON COLUMN items.data IS 'Flexible JSONB storage for all item data. Schema varies by type.';
COMMENT ON COLUMN items.position IS 'REAL type allows fractional positioning for smooth drag-and-drop reordering.';
COMMENT ON COLUMN items.due_date IS 'Extracted from data JSONB for performance. Keep in sync with data.due_date.';