-- Migration 001: Create Base Types and Enums
-- Smart Hybrid Multi-Tenant Architecture - Wedding Planning SaaS
-- Created: 2025-08-24

-- Account types for B2C (couples) vs B2B (planners) 
CREATE TYPE account_type AS ENUM (
  'personal',  -- B2C: Individual couples
  'team'       -- B2B: Wedding planners/agencies
);

-- Subscription status for billing management
CREATE TYPE subscription_status AS ENUM (
  'trial',
  'active', 
  'past_due',
  'canceled',
  'unpaid'
);

-- Workspace member roles for granular access control
CREATE TYPE workspace_role AS ENUM (
  'owner',     -- Full access, billing management
  'admin',     -- Full workspace access, no billing
  'editor',    -- Can modify content
  'viewer'     -- Read-only access
);

-- Account member roles for organization-level permissions
CREATE TYPE account_role AS ENUM (
  'owner',     -- Account owner, billing access
  'admin',     -- Admin access across workspaces
  'member'     -- Regular member
);

-- Board types for different module categories
CREATE TYPE board_type AS ENUM (
  'budget',    -- Budget tracking and expense management
  'planning',  -- Task planning and timeline management
  'custom'     -- Future extensibility
);

-- View types for different data presentation modes
CREATE TYPE view_type AS ENUM (
  'table',     -- Tabular data view
  'kanban',    -- Kanban board view
  'calendar',  -- Calendar view for dates
  'timeline'   -- Gantt/timeline view
);

-- Item status for workflow management
CREATE TYPE item_status AS ENUM (
  'draft',
  'active',
  'completed',
  'archived'
);

-- Activity types for comprehensive logging
CREATE TYPE activity_type AS ENUM (
  'created',
  'updated', 
  'deleted',
  'commented',
  'status_changed',
  'assigned',
  'completed'
);

-- Enable UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable timestamp update extension
CREATE EXTENSION IF NOT EXISTS "moddatetime";