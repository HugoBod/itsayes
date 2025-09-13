-- Test script to create and verify public_id generation

-- Insert test account
INSERT INTO accounts (id, subscription_plan, subscription_status)
VALUES ('01234567-89ab-cdef-0123-456789abcdef'::UUID, 'free', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert test workspace with is_public = true to trigger public_id generation
INSERT INTO workspaces (
  id,
  account_id,
  name,
  description,
  is_public,
  featured_image_url,
  onboarding_data_couple
) VALUES (
  '11111111-2222-3333-4444-555555555555'::UUID,
  '01234567-89ab-cdef-0123-456789abcdef'::UUID,
  'Beautiful Beach Wedding',
  'A stunning beach ceremony with modern touches',
  true,
  'https://via.placeholder.com/800x600',
  '{"step_4": {"themes": ["Beach", "Modern"], "colorPalette": "Ocean Blue & Coral"}}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_public = EXCLUDED.is_public,
  featured_image_url = EXCLUDED.featured_image_url,
  onboarding_data_couple = EXCLUDED.onboarding_data_couple;

-- Check if public_id was generated
SELECT
  id,
  name,
  public_id,
  public_slug,
  is_public
FROM workspaces
WHERE id = '11111111-2222-3333-4444-555555555555'::UUID;

-- Check if workspace appears in community_projects view
SELECT
  id,
  name,
  public_id,
  style_themes,
  color_palette
FROM community_projects
WHERE id = '11111111-2222-3333-4444-555555555555'::UUID;