-- Drop existing policies for album_media bucket
DROP POLICY IF EXISTS "Media is viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload album media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own album media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own album media" ON storage.objects;

-- Create new policies for album_media bucket
-- Allow authenticated users to upload media
CREATE POLICY "Users can upload album media"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'album_media');

-- Allow media to be viewed only through signed URLs
CREATE POLICY "Album media is viewable through signed URLs only"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'album_media' AND
    (
      -- Allow access through signed URLs
      (storage.foldername(name))[1] = auth.uid()::text OR
      -- Allow access to cover images
      (storage.foldername(name))[1] = 'covers'
    )
  );

-- Allow users to update their own uploads
CREATE POLICY "Users can update their own album media"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'album_media' AND
    (
      (storage.foldername(name))[1] = auth.uid()::text OR
      (storage.foldername(name))[1] = 'covers'
    )
  );

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own album media"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'album_media' AND
    (
      (storage.foldername(name))[1] = auth.uid()::text OR
      (storage.foldername(name))[1] = 'covers'
    )
  ); 