-- Migration 002: Create Accounts Table
-- Smart Hybrid Multi-Tenant Architecture - Wedding Planning SaaS  
-- Created: 2025-08-24

-- Accounts: Top level tenant isolation (Company/Personal level)
-- Handles billing, subscription, and global workspace limits
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Account identification
  type account_type NOT NULL DEFAULT 'personal',
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE, -- Optional: for custom URLs in future
  
  -- Billing information
  billing_email VARCHAR(255),
  subscription_status subscription_status DEFAULT 'trial',
  subscription_plan VARCHAR(50), -- 'trial', 'starter', 'pro', 'enterprise'
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  
  -- Usage limits (enforced at application level)
  workspace_limit INTEGER DEFAULT 1, -- v1: 1 workspace, v2+: N workspaces
  storage_limit_gb INTEGER DEFAULT 5,
  
  -- Metadata
  avatar_url TEXT,
  website_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Soft delete
  is_archived BOOLEAN DEFAULT false
);

-- Add automatic updated_at trigger
CREATE TRIGGER accounts_updated_at 
  BEFORE UPDATE ON accounts 
  FOR EACH ROW 
  EXECUTE FUNCTION moddatetime(updated_at);

-- Indexes for performance
CREATE INDEX idx_accounts_type ON accounts(type);
CREATE INDEX idx_accounts_subscription_status ON accounts(subscription_status);
CREATE INDEX idx_accounts_created_at ON accounts(created_at);
CREATE INDEX idx_accounts_not_archived ON accounts(is_archived) WHERE is_archived = false;

-- Comments for documentation
COMMENT ON TABLE accounts IS 'Top-level tenant accounts for multi-tenant isolation. Handles billing and global limits.';
COMMENT ON COLUMN accounts.type IS 'Account type: personal for couples, team for wedding planners';
COMMENT ON COLUMN accounts.workspace_limit IS 'Maximum workspaces allowed (1 in v1, N in v2+)';
COMMENT ON COLUMN accounts.slug IS 'Optional URL-friendly identifier for custom domains (future feature)';