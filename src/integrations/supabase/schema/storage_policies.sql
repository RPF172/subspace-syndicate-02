-- Create post_media storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('post_media', 'post_media', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for post_media bucket
-- Allow authenticated users to upload media
CREATE POLICY "Users can upload to post_media"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'post_media');

-- Allow media to be viewed by anyone
CREATE POLICY "Post media is viewable by everyone"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'post_media');

-- Allow users to update their own uploads
CREATE POLICY "Users can update their own post media"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'post_media' AND owner = auth.uid());

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own post media"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'post_media' AND owner = auth.uid()); 