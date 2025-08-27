-- Migration 003: Create Workspaces Structure
-- Smart Hybrid Multi-Tenant Architecture - Wedding Planning SaaS
-- Created: 2025-08-24

-- Workspaces: Individual wedding projects
-- Contains onboarding data in JSONB and workspace-specific settings
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationship to account (tenant isolation)
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  
  -- Workspace identification
  name VARCHAR(255) NOT NULL,
  description TEXT,
  slug VARCHAR(100), -- Optional: URL-friendly identifier
  
  -- Wedding-specific information
  wedding_date DATE,
  venue_name VARCHAR(255),
  venue_location VARCHAR(255),
  
  -- Onboarding data storage (JSONB for maximum flexibility)
  -- Stores temporary onboarding data before migration to normalized tables
  onboarding_data_couple JSONB DEFAULT '{}', -- B2C couple onboarding data
  onboarding_data_planner JSONB DEFAULT '{}', -- B2B planner onboarding data
  onboarding_completed_at TIMESTAMPTZ, -- When onboarding was finished
  onboarding_migrated_at TIMESTAMPTZ, -- When data was migrated to items table
  
  -- Workspace settings
  timezone VARCHAR(50) DEFAULT 'UTC',
  currency VARCHAR(3) DEFAULT 'EUR',
  locale VARCHAR(10) DEFAULT 'en-US',
  
  -- Visual customization
  avatar_url TEXT,
  cover_image_url TEXT,
  color_scheme VARCHAR(50) DEFAULT 'default',
  
  -- Privacy and sharing
  is_public BOOLEAN DEFAULT false,
  invite_code VARCHAR(20) UNIQUE, -- For sharing workspace access
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Soft delete
  is_archived BOOLEAN DEFAULT false
);

-- v1 MVP constraint: 1 workspace per account (remove for v2 multi-workspace)
-- This allows the Smart Hybrid architecture to evolve from 1:1 to 1:N
ALTER TABLE workspaces 
ADD CONSTRAINT one_workspace_per_account_v1 UNIQUE (account_id);

-- Add automatic updated_at trigger
CREATE TRIGGER workspaces_updated_at 
  BEFORE UPDATE ON workspaces 
  FOR EACH ROW 
  EXECUTE FUNCTION moddatetime(updated_at);

-- Indexes for performance
CREATE INDEX idx_workspaces_account_id ON workspaces(account_id);
CREATE INDEX idx_workspaces_wedding_date ON workspaces(wedding_date);
CREATE INDEX idx_workspaces_created_at ON workspaces(created_at);
CREATE INDEX idx_workspaces_not_archived ON workspaces(is_archived) WHERE is_archived = false;
CREATE INDEX idx_workspaces_invite_code ON workspaces(invite_code) WHERE invite_code IS NOT NULL;

-- JSONB indexes for onboarding data queries
CREATE INDEX idx_workspaces_onboarding_couple_gin ON workspaces USING GIN (onboarding_data_couple);
CREATE INDEX idx_workspaces_onboarding_planner_gin ON workspaces USING GIN (onboarding_data_planner);

-- Comments for documentation  
COMMENT ON TABLE workspaces IS 'Individual wedding projects within accounts. Contains onboarding data in JSONB format.';
COMMENT ON COLUMN workspaces.onboarding_data_couple IS 'B2C onboarding data for couples (step_1 to step_8 structure)';
COMMENT ON COLUMN workspaces.onboarding_data_planner IS 'B2B onboarding data for wedding planners';
COMMENT ON COLUMN workspaces.onboarding_migrated_at IS 'Timestamp when onboarding data was migrated to normalized items table';
COMMENT ON CONSTRAINT one_workspace_per_account_v1 ON workspaces IS 'v1 MVP constraint - remove for v2 multi-workspace support';