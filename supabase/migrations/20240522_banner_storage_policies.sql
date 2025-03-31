-- Create a banners folder in the avatars bucket
-- Add policies for banner images

-- Allow authenticated users to upload banners
CREATE POLICY "Users can upload their banners"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND storage.foldername(name)[1] = 'banners');

-- Allow anyone to view banners
CREATE POLICY "Banner images are publicly viewable"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars' AND storage.foldername(name)[1] = 'banners');

-- Allow users to update their own banners
CREATE POLICY "Users can update their own banners"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'avatars' AND 
         storage.foldername(name)[1] = 'banners' AND 
         owner = auth.uid());

-- Allow users to delete their own banners
CREATE POLICY "Users can delete their own banners"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'avatars' AND 
         storage.foldername(name)[1] = 'banners' AND 
         owner = auth.uid()); 