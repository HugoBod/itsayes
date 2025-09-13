-- Add unique public ID field for community URLs
-- This replaces the slug-based system with a scalable numeric ID system

-- Add the new public_id column
ALTER TABLE workspaces
ADD COLUMN public_id VARCHAR(20) UNIQUE;

-- Create function to generate unique public ID (12-digit alphanumeric)
CREATE OR REPLACE FUNCTION generate_public_id()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789'; -- Removed confusing chars: 0, O, I, L
  result TEXT := '';
  i INTEGER;
  random_index INTEGER;
BEGIN
  -- Generate 12-character alphanumeric ID
  FOR i IN 1..12 LOOP
    random_index := floor(random() * length(chars) + 1);
    result := result || substr(chars, random_index, 1);
  END LOOP;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to ensure unique public ID
CREATE OR REPLACE FUNCTION generate_unique_public_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  max_attempts INTEGER := 100;
  attempt INTEGER := 0;
BEGIN
  LOOP
    new_id := generate_public_id();

    -- Check if this ID already exists
    IF NOT EXISTS (SELECT 1 FROM workspaces WHERE public_id = new_id) THEN
      RETURN new_id;
    END IF;

    -- Prevent infinite loop
    attempt := attempt + 1;
    IF attempt >= max_attempts THEN
      RAISE EXCEPTION 'Could not generate unique public ID after % attempts', max_attempts;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Update the trigger function to generate public_id instead of public_slug
CREATE OR REPLACE FUNCTION set_public_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate public_id when workspace becomes public and doesn't have one yet
  IF NEW.is_public = true AND (OLD.is_public = false OR OLD.is_public IS NULL) AND NEW.public_id IS NULL THEN
    NEW.public_id := generate_unique_public_id();
  END IF;

  -- Update last_activity when workspace is modified
  NEW.last_activity_at := now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the old trigger and create new one
DROP TRIGGER IF EXISTS workspaces_set_public_slug ON workspaces;

CREATE TRIGGER workspaces_set_public_id
  BEFORE UPDATE ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION set_public_id();

-- Update the community_projects view to use public_id
DROP VIEW IF EXISTS community_projects;

CREATE VIEW community_projects AS
SELECT
  w.id,
  w.name,
  w.description,
  w.public_id,  -- Changed from public_slug
  w.featured_image_url,
  w.is_public,
  w.wedding_date,
  w.created_at,
  w.updated_at as last_activity_at,

  -- Extract style preferences from onboarding data
  CASE
    WHEN w.onboarding_data_couple IS NOT NULL AND w.onboarding_data_couple->>'step_4' IS NOT NULL THEN
      COALESCE(
        ((w.onboarding_data_couple->>'step_4')::jsonb->>'themes')::text,
        '[]'
      )
    ELSE '[]'
  END as style_themes,

  -- Extract color palette from onboarding data
  CASE
    WHEN w.onboarding_data_couple IS NOT NULL AND w.onboarding_data_couple->>'step_4' IS NOT NULL THEN
      (w.onboarding_data_couple->>'step_4')::jsonb->>'colorPalette'
    ELSE NULL
  END as color_palette,

  -- Community stats
  COALESCE(likes.count, 0) as likes_count,
  COALESCE(views.count, 0) as views_count,
  0 as remix_count, -- Simplified for now

  -- Trending score (views + likes in last 7 days)
  COALESCE(recent_likes.count, 0) + COALESCE(recent_views.count, 0) as trending_score

FROM workspaces w

-- Left join for likes count
LEFT JOIN (
  SELECT workspace_id, COUNT(*) as count
  FROM project_likes
  GROUP BY workspace_id
) likes ON w.id = likes.workspace_id

-- Left join for views count
LEFT JOIN (
  SELECT workspace_id, COUNT(*) as count
  FROM project_views
  GROUP BY workspace_id
) views ON w.id = views.workspace_id

-- Left join for recent likes (last 7 days)
LEFT JOIN (
  SELECT workspace_id, COUNT(*) as count
  FROM project_likes
  WHERE created_at >= NOW() - INTERVAL '7 days'
  GROUP BY workspace_id
) recent_likes ON w.id = recent_likes.workspace_id

-- Left join for recent views (last 7 days)
LEFT JOIN (
  SELECT workspace_id, COUNT(*) as count
  FROM project_views
  WHERE created_at >= NOW() - INTERVAL '7 days'
  GROUP BY workspace_id
) recent_views ON w.id = recent_views.workspace_id

WHERE
  w.is_public = true
  AND w.public_id IS NOT NULL  -- Changed from public_slug
  AND w.featured_image_url IS NOT NULL -- Ensure projects have images
ORDER BY
  w.updated_at DESC;

-- Add index for the new public_id column
CREATE INDEX idx_workspaces_public_id ON workspaces(public_id) WHERE public_id IS NOT NULL;

-- Generate public_id for existing public workspaces
UPDATE workspaces
SET public_id = generate_unique_public_id()
WHERE is_public = true AND public_id IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN workspaces.public_id IS 'Unique 12-character alphanumeric ID for public community URLs (e.g., AB3X9M2K7PQ5)';
COMMENT ON FUNCTION generate_public_id() IS 'Generates a 12-character alphanumeric ID using safe characters (no 0, O, I, L)';
COMMENT ON FUNCTION generate_unique_public_id() IS 'Ensures the generated public ID is unique across all workspaces';