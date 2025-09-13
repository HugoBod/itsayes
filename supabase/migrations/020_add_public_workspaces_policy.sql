-- Migration 020: Add Public Access Policy for Workspaces
-- Allows anonymous users to read public workspaces for community features
-- Created: 2025-09-13

-- Add public read policy for workspaces
-- This allows anyone (including anonymous users) to read public workspaces
CREATE POLICY "Anyone can view public workspaces" ON workspaces
  FOR SELECT USING (
    is_public = true
    AND is_archived = false
    AND public_slug IS NOT NULL
    AND onboarding_completed_at IS NOT NULL
  );

-- Update the existing workspaces_select_policy to include public access
-- We need to drop and recreate it to include the OR condition
DROP POLICY "workspaces_select_policy" ON workspaces;

CREATE POLICY "workspaces_select_policy" ON workspaces
  FOR SELECT USING (
    -- Public workspaces are viewable by everyone
    (is_public = true
     AND is_archived = false
     AND public_slug IS NOT NULL
     AND onboarding_completed_at IS NOT NULL)
    OR
    -- Direct workspace access for members
    id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND is_active = true
    )
    OR
    -- Or access via account membership for private workspaces
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Comments for documentation
COMMENT ON POLICY "workspaces_select_policy" ON workspaces IS
  'Allows reading public workspaces by anyone, plus member access to private workspaces';