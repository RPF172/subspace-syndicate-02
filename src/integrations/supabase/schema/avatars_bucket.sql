
-- Create avatars storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for avatars bucket
-- Allow authenticated users to upload avatars
CREATE POLICY "Users can upload their avatars"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND storage.foldername(name)[1] != 'banners');

-- Allow anyone to view avatars
CREATE POLICY "Avatar images are publicly viewable"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatars"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'avatars' AND
         storage.foldername(name)[1] != 'banners' AND
         owner = auth.uid());

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'avatars' AND
         storage.foldername(name)[1] != 'banners' AND
         owner = auth.uid());
