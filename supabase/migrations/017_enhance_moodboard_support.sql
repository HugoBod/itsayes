-- Migration 017: Enhance Moodboard Support for Multi-Image Generation
-- This migration adds support for the new multi-image moodboard system

-- First, let's add new columns to the items table to better support moodboard metadata
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS generation_metadata JSONB,
ADD COLUMN IF NOT EXISTS source_images JSONB[];

-- Create an index on generation_metadata for better query performance
CREATE INDEX IF NOT EXISTS idx_items_generation_metadata 
ON items USING GIN (generation_metadata);

-- Create an index on source_images for better query performance  
CREATE INDEX IF NOT EXISTS idx_items_source_images 
ON items USING GIN (source_images);

-- Add a constraint to ensure moodboard items have proper structure
CREATE OR REPLACE FUNCTION validate_moodboard_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Only validate moodboard type items
    IF NEW.type = 'moodboard' THEN
        -- Ensure required fields exist in data JSONB
        IF NOT (NEW.data ? 'wedding_summary' AND NEW.data ? 'ai_insights') THEN
            RAISE EXCEPTION 'Moodboard items must contain wedding_summary and ai_insights in data field';
        END IF;
        
        -- Validate generation_metadata if present
        IF NEW.generation_metadata IS NOT NULL THEN
            IF NOT (NEW.generation_metadata ? 'generated_at' AND NEW.generation_metadata ? 'model') THEN
                RAISE EXCEPTION 'generation_metadata must contain generated_at and model fields';
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate moodboard data structure
DROP TRIGGER IF EXISTS validate_moodboard_trigger ON items;
CREATE TRIGGER validate_moodboard_trigger
    BEFORE INSERT OR UPDATE ON items
    FOR EACH ROW
    EXECUTE FUNCTION validate_moodboard_data();

-- Create a function to get moodboard with all related data
CREATE OR REPLACE FUNCTION get_moodboard_with_metadata(p_workspace_id UUID)
RETURNS TABLE (
    id UUID,
    title TEXT,
    data JSONB,
    generation_metadata JSONB,
    source_images JSONB[],
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.title,
        i.data,
        i.generation_metadata,
        i.source_images,
        i.created_at,
        i.updated_at,
        i.created_by
    FROM items i
    WHERE i.workspace_id = p_workspace_id 
    AND i.type = 'moodboard'
    AND i.status = 'active'
    ORDER BY i.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION get_moodboard_with_metadata(UUID) TO authenticated;

-- Create a function to store location context cache
CREATE TABLE IF NOT EXISTS location_context_cache (
    id SERIAL PRIMARY KEY,
    location_key TEXT NOT NULL UNIQUE,
    context_data JSONB NOT NULL,
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient location lookups
CREATE INDEX IF NOT EXISTS idx_location_context_key ON location_context_cache (location_key);
CREATE INDEX IF NOT EXISTS idx_location_context_expires ON location_context_cache (expires_at);

-- Function to clean up expired location cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_location_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM location_context_cache 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get or set location context
CREATE OR REPLACE FUNCTION get_location_context(p_location_key TEXT)
RETURNS JSONB AS $$
DECLARE
    context_record RECORD;
BEGIN
    -- Try to get from cache first
    SELECT context_data INTO context_record
    FROM location_context_cache
    WHERE location_key = p_location_key 
    AND expires_at > NOW();
    
    IF FOUND THEN
        RETURN context_record.context_data;
    ELSE
        RETURN NULL;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION set_location_context(
    p_location_key TEXT,
    p_context_data JSONB,
    p_expires_hours INTEGER DEFAULT 168 -- 7 days default
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO location_context_cache (
        location_key, 
        context_data, 
        expires_at
    )
    VALUES (
        p_location_key,
        p_context_data,
        NOW() + INTERVAL '1 hour' * p_expires_hours
    )
    ON CONFLICT (location_key) 
    DO UPDATE SET
        context_data = EXCLUDED.context_data,
        expires_at = EXCLUDED.expires_at,
        cached_at = NOW();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions for location functions
GRANT EXECUTE ON FUNCTION get_location_context(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION set_location_context(TEXT, JSONB, INTEGER) TO authenticated;

-- Create a view for moodboard statistics
CREATE OR REPLACE VIEW moodboard_stats AS
SELECT 
    w.id AS workspace_id,
    w.name AS workspace_name,
    COUNT(i.id) AS total_moodboards,
    COUNT(CASE WHEN i.generation_metadata->>'generation_type' = 'multi-image' THEN 1 END) AS multi_image_moodboards,
    COUNT(CASE WHEN i.generation_metadata->>'generation_type' = 'single' THEN 1 END) AS single_image_moodboards,
    MAX(i.created_at) AS latest_moodboard_created,
    COUNT(CASE WHEN i.source_images IS NOT NULL AND array_length(i.source_images, 1) > 1 THEN 1 END) AS composed_moodboards
FROM workspaces w
LEFT JOIN items i ON w.id = i.workspace_id AND i.type = 'moodboard' AND i.status = 'active'
GROUP BY w.id, w.name;

-- Grant select on the view
GRANT SELECT ON moodboard_stats TO authenticated;

-- Add RLS policy for location_context_cache (read-only for authenticated users)
ALTER TABLE location_context_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read location cache" ON location_context_cache
    FOR SELECT
    TO authenticated
    USING (true);

-- Only allow the service functions to write to location cache
CREATE POLICY "Only functions can modify location cache" ON location_context_cache
    FOR ALL
    TO authenticated
    USING (false);

-- Add a comment to document the enhancement
COMMENT ON TABLE location_context_cache IS 'Caches location context data from web searches to improve moodboard generation performance';
COMMENT ON FUNCTION get_moodboard_with_metadata(UUID) IS 'Retrieves complete moodboard data including metadata and source images for a workspace';
COMMENT ON FUNCTION get_location_context(TEXT) IS 'Gets cached location context data for a location key';
COMMENT ON FUNCTION set_location_context(TEXT, JSONB, INTEGER) IS 'Caches location context data with expiration';

-- Update the items table comment to reflect new moodboard capabilities
COMMENT ON COLUMN items.generation_metadata IS 'Stores AI generation metadata including model, prompts, location context, and generation type';
COMMENT ON COLUMN items.source_images IS 'Array of source images used in multi-image moodboard composition';

-- Create an example of how the enhanced moodboard data structure looks
-- (This is just documentation, not actual data)
/*
Example of enhanced moodboard item structure:

{
  "data": {
    "image_url": "https://storage.supabase.co/...",
    "wedding_summary": "Beautiful couple's wedding...",
    "ai_insights": ["Insight 1", "Insight 2"],
    "style_guide": {
      "color_palette": "Romantic pastels",
      "style_keywords": ["elegant", "romantic"],
      "themes": ["classic", "garden"]
    },
    "source_images": [
      {
        "type": "venue-ceremony",
        "url": "https://...",
        "prompt_used": "Wedding ceremony in Tuscany...",
        "generation_metadata": {...}
      }
    ],
    "composition_metadata": {
      "layout": {"type": "magazine", "width": 1200, "height": 800},
      "final_dimensions": {"width": 1200, "height": 800}
    }
  },
  "generation_metadata": {
    "prompt_used": "Enhanced prompt with location context...",
    "model": "dall-e-3-multi",
    "generated_at": "2024-01-01T10:00:00Z",
    "generation_type": "multi-image",
    "layout_type": "magazine",
    "location_context": {
      "name": "Tuscany, Italy",
      "architecture_style": "Renaissance villas...",
      "cultural_elements": ["Italian romance", "Wine culture"]
    }
  },
  "source_images": [
    {
      "type": "venue-ceremony",
      "url": "https://...",
      "prompt_used": "...",
      "generation_metadata": {...}
    },
    {
      "type": "style-decor", 
      "url": "https://...",
      "prompt_used": "...",
      "generation_metadata": {...}
    },
    {
      "type": "reception-dining",
      "url": "https://...", 
      "prompt_used": "...",
      "generation_metadata": {...}
    }
  ]
}
*/