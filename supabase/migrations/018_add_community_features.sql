-- Migration 018: Add Community Features and Pricing Plans
-- Public projects sharing, pricing plans, and community analytics
-- Created: 2025-01-09

-- Add pricing plan and community fields to workspaces
ALTER TABLE workspaces 
ADD COLUMN pricing_plan VARCHAR(20) DEFAULT 'free' CHECK (pricing_plan IN ('free', 'pro', 'team')),
ADD COLUMN public_slug VARCHAR(100) UNIQUE, -- SEO-friendly URL slug
ADD COLUMN featured_at TIMESTAMPTZ, -- For highlighting trending projects
ADD COLUMN likes_count INTEGER DEFAULT 0,
ADD COLUMN views_count INTEGER DEFAULT 0,
ADD COLUMN remix_count INTEGER DEFAULT 0,
ADD COLUMN last_activity_at TIMESTAMPTZ DEFAULT now(); -- For trending calculation

-- Function to generate unique public slug from workspace name
CREATE OR REPLACE FUNCTION generate_public_slug(workspace_name TEXT, workspace_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug: lowercase, replace spaces/special chars with hyphens
  base_slug := lower(regexp_replace(workspace_name, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  -- Ensure minimum length
  IF length(base_slug) < 3 THEN
    base_slug := 'wedding-project';
  END IF;
  
  -- Check uniqueness and add counter if needed
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM workspaces WHERE public_slug = final_slug AND id != workspace_id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::TEXT;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate public_slug when workspace becomes public
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

CREATE TRIGGER workspaces_set_public_slug 
  BEFORE UPDATE ON workspaces 
  FOR EACH ROW 
  EXECUTE FUNCTION set_public_slug();

-- Table for tracking project likes (anonymous + authenticated)
CREATE TABLE project_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for anonymous likes
  ip_address INET, -- For anonymous like tracking (rate limiting)
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Prevent duplicate likes (either by user or by IP for anonymous)
  CONSTRAINT unique_user_like UNIQUE NULLS NOT DISTINCT (workspace_id, user_id),
  CONSTRAINT unique_ip_like EXCLUDE USING btree (workspace_id WITH =, ip_address WITH =) WHERE (user_id IS NULL)
);

-- Table for tracking project views (for analytics)
CREATE TABLE project_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Optimized view for public community projects
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

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_project_views(
  project_workspace_id UUID,
  viewer_ip INET,
  viewer_user_id UUID DEFAULT NULL,
  viewer_user_agent TEXT DEFAULT NULL,
  viewer_referrer TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Insert view record
  INSERT INTO project_views (workspace_id, user_id, ip_address, user_agent, referrer)
  VALUES (project_workspace_id, viewer_user_id, viewer_ip, viewer_user_agent, viewer_referrer);
  
  -- Update counter in workspace
  UPDATE workspaces 
  SET 
    views_count = views_count + 1,
    last_activity_at = now()
  WHERE id = project_workspace_id;
END;
$$ LANGUAGE plpgsql;

-- Function to toggle project like
CREATE OR REPLACE FUNCTION toggle_project_like(
  project_workspace_id UUID,
  liker_user_id UUID DEFAULT NULL,
  liker_ip INET DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  like_exists boolean;
  new_like_count integer;
BEGIN
  -- Check if like already exists
  IF liker_user_id IS NOT NULL THEN
    SELECT EXISTS(SELECT 1 FROM project_likes WHERE workspace_id = project_workspace_id AND user_id = liker_user_id) INTO like_exists;
  ELSE
    SELECT EXISTS(SELECT 1 FROM project_likes WHERE workspace_id = project_workspace_id AND ip_address = liker_ip AND user_id IS NULL) INTO like_exists;
  END IF;
  
  IF like_exists THEN
    -- Remove like
    IF liker_user_id IS NOT NULL THEN
      DELETE FROM project_likes WHERE workspace_id = project_workspace_id AND user_id = liker_user_id;
    ELSE
      DELETE FROM project_likes WHERE workspace_id = project_workspace_id AND ip_address = liker_ip AND user_id IS NULL;
    END IF;
  ELSE
    -- Add like
    INSERT INTO project_likes (workspace_id, user_id, ip_address)
    VALUES (project_workspace_id, liker_user_id, liker_ip)
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Update likes count in workspace
  SELECT COUNT(*) FROM project_likes WHERE workspace_id = project_workspace_id INTO new_like_count;
  
  UPDATE workspaces 
  SET 
    likes_count = new_like_count,
    last_activity_at = now()
  WHERE id = project_workspace_id;
  
  RETURN NOT like_exists; -- Return true if like was added, false if removed
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance
CREATE INDEX idx_workspaces_public_community ON workspaces(is_public, onboarding_completed_at, is_archived) WHERE is_public = true;
CREATE INDEX idx_workspaces_public_slug ON workspaces(public_slug) WHERE public_slug IS NOT NULL;
CREATE INDEX idx_workspaces_trending ON workspaces(last_activity_at DESC, likes_count DESC) WHERE is_public = true;
CREATE INDEX idx_workspaces_popular ON workspaces(likes_count DESC, created_at DESC) WHERE is_public = true;
CREATE INDEX idx_workspaces_recent ON workspaces(created_at DESC) WHERE is_public = true;

CREATE INDEX idx_project_likes_workspace ON project_likes(workspace_id);
CREATE INDEX idx_project_likes_recent ON project_likes(created_at DESC);
CREATE INDEX idx_project_views_workspace ON project_views(workspace_id);
CREATE INDEX idx_project_views_recent ON project_views(created_at DESC);
-- Trending views index - just on created_at since we can't use now() in WHERE clause
CREATE INDEX idx_project_views_trending ON project_views(workspace_id, created_at DESC);

-- RLS Policies for public access
ALTER TABLE project_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_views ENABLE ROW LEVEL SECURITY;

-- Anyone can read public project likes and views (for counters)
CREATE POLICY "Public projects likes are viewable by everyone" ON project_likes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_id AND w.is_public = true)
  );

CREATE POLICY "Anyone can like public projects" ON project_likes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_id AND w.is_public = true)
  );

CREATE POLICY "Users can remove their own likes" ON project_likes
  FOR DELETE USING (
    user_id = auth.uid() OR 
    (user_id IS NULL AND EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_id AND w.is_public = true))
  );

CREATE POLICY "Anyone can view public project views" ON project_views
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_id AND w.is_public = true)
  );

CREATE POLICY "Anyone can track views on public projects" ON project_views
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_id AND w.is_public = true)
  );

-- Comments for documentation
COMMENT ON TABLE project_likes IS 'Tracks likes on public wedding projects, supports both authenticated and anonymous users';
COMMENT ON TABLE project_views IS 'Analytics tracking for public project views and traffic sources';
COMMENT ON VIEW community_projects IS 'Optimized view for displaying public wedding projects in community pages';
COMMENT ON FUNCTION toggle_project_like IS 'Safely toggles likes on public projects with proper counting';
COMMENT ON FUNCTION increment_project_views IS 'Tracks project views for analytics and trending calculations';