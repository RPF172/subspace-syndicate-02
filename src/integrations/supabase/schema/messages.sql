-- Create Community Chats Table
CREATE TABLE IF NOT EXISTS public.community_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video') OR media_type IS NULL),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_community_chats_room_id ON public.community_chats(room_id);
CREATE INDEX IF NOT EXISTS idx_community_chats_user_id ON public.community_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_community_chats_created_at ON public.community_chats(created_at);

-- Row Level Security
ALTER TABLE public.community_chats ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all messages
CREATE POLICY "Community chats are viewable by authenticated users"
  ON public.community_chats
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow users to insert their own messages
CREATE POLICY "Users can insert their own community chats"
  ON public.community_chats
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own messages
CREATE POLICY "Users can update their own community chats"
  ON public.community_chats
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to delete their own messages
CREATE POLICY "Users can delete their own community chats"
  ON public.community_chats
  FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime for community chats
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_chats;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_community_chats_updated_at
BEFORE UPDATE ON public.community_chats
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for media files if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
-- Allow authenticated users to upload media
CREATE POLICY "Media uploads are available to authenticated users"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media' AND (storage.foldername(name))[1] = 'community');

-- Allow media to be viewed by anyone
CREATE POLICY "Media is viewable by everyone"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'media');

-- Allow users to update and delete their own uploads
CREATE POLICY "Users can update their own media uploads"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'media' AND owner = auth.uid());

CREATE POLICY "Users can delete their own media uploads"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'media' AND owner = auth.uid()); 