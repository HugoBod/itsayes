-- Migration 019: Add Featured Image Support for Community Projects
-- Adds featured image URL column for community project thumbnails
-- Created: 2025-01-09

-- Add featured image URL column to workspaces
ALTER TABLE workspaces
ADD COLUMN featured_image_url TEXT;

-- Update the trigger to also handle featured image URL when project becomes public
CREATE OR REPLACE FUNCTION set_public_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate slug if workspace is becoming public and doesn't have slug yet
  IF NEW.is_public = true AND (OLD.is_public = false OR OLD.is_public IS NULL) AND NEW.public_slug IS NULL THEN
    NEW.public_slug := generate_public_slug(NEW.name, NEW.id);
  END IF;

  -- Update last_activity when workspace is modified
  NEW.last_activity_at := now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update community_projects view to include featured image
DROP VIEW IF EXISTS community_projects;
CREATE VIEW community_projects AS
SELECT
  w.id,
  w.name,
  w.description,
  w.public_slug,
  w.wedding_date,
  w.pricing_plan,
  w.likes_count,
  w.views_count,
  w.remix_count,
  w.created_at,
  w.last_activity_at,
  w.featured_image_url,

  -- Extract style from onboarding data for filtering
  w.onboarding_data_couple->>'step_4' as style_preferences,
  w.onboarding_data_couple->'step_1'->>'partner1Name' as partner1_name,
  w.onboarding_data_couple->'step_1'->>'partner2Name' as partner2_name,

  -- Calculate trending score (views + likes in last 24h)
  COALESCE(
    (SELECT COUNT(*) FROM project_views pv WHERE pv.workspace_id = w.id AND pv.created_at > now() - interval '24 hours'), 0
  ) +
  COALESCE(
    (SELECT COUNT(*) FROM project_likes pl WHERE pl.workspace_id = w.id AND pl.created_at > now() - interval '24 hours'), 0
  ) as trending_score

FROM workspaces w
WHERE
  w.is_public = true
  AND w.onboarding_completed_at IS NOT NULL
  AND w.public_slug IS NOT NULL
  AND w.is_archived = false;

-- Add index for featured image queries
CREATE INDEX idx_workspaces_featured_image ON workspaces(featured_image_url) WHERE featured_image_url IS NOT NULL;

-- Comments
COMMENT ON COLUMN workspaces.featured_image_url IS 'URL of the featured image for community project thumbnails, extracted from moodboard';