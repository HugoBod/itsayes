-- Create storage bucket for moodboard images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'moodboard-images',
    'moodboard-images', 
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the moodboard-images bucket
CREATE POLICY "Users can view moodboard images" ON storage.objects
    FOR SELECT USING (bucket_id = 'moodboard-images');

CREATE POLICY "Users can upload their own workspace moodboard images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'moodboard-images' 
        AND (storage.foldername(name))[1] IN (
            SELECT w.id::text 
            FROM workspaces w 
            INNER JOIN workspace_members wm ON w.id = wm.workspace_id 
            WHERE wm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own workspace moodboard images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'moodboard-images' 
        AND (storage.foldername(name))[1] IN (
            SELECT w.id::text 
            FROM workspaces w 
            INNER JOIN workspace_members wm ON w.id = wm.workspace_id 
            WHERE wm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own workspace moodboard images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'moodboard-images' 
        AND (storage.foldername(name))[1] IN (
            SELECT w.id::text 
            FROM workspaces w 
            INNER JOIN workspace_members wm ON w.id = wm.workspace_id 
            WHERE wm.user_id = auth.uid()
        )
    );