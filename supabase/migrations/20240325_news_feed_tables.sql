-- Create post_media table to store media attachments for posts
CREATE TABLE IF NOT EXISTS public.post_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'gif')),
  aspect_ratio FLOAT,
  duration INTEGER,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create post_hashtags table to store hashtags for posts
CREATE TABLE IF NOT EXISTS public.post_hashtags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE, 
  hashtag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (post_id, hashtag)
);

-- Create index on hashtag for faster searches
CREATE INDEX IF NOT EXISTS idx_post_hashtags_hashtag ON public.post_hashtags(hashtag);

-- Create view for trending hashtags
CREATE OR REPLACE VIEW public.trending_hashtags AS
SELECT 
  hashtag, 
  COUNT(*) as post_count,
  MAX(created_at) as latest_usage
FROM 
  public.post_hashtags
WHERE 
  created_at > NOW() - INTERVAL '7 days'
GROUP BY 
  hashtag
ORDER BY 
  COUNT(*) DESC, 
  MAX(created_at) DESC;

-- Create notification_preferences table to store user preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  all_posts BOOLEAN NOT NULL DEFAULT TRUE,
  followed_users BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id)
);

-- Create hashtag_notification_preferences table for hashtag-specific preferences
CREATE TABLE IF NOT EXISTS public.hashtag_notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hashtag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, hashtag)
);

-- Add triggers to handle real-time notifications for new posts

-- Function to handle new post notifications
CREATE OR REPLACE FUNCTION public.handle_new_post()
RETURNS TRIGGER AS $$
BEGIN
  -- Broadcast the new post event to relevant clients
  PERFORM pg_notify(
    'feed-updates',
    json_build_object(
      'type', 'broadcast',
      'event', 'new-post',
      'payload', json_build_object(
        'id', NEW.id,
        'user_id', NEW.user_id,
        'created_at', NEW.created_at
      )
    )::text
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new posts
DROP TRIGGER IF EXISTS on_new_post ON public.posts;
CREATE TRIGGER on_new_post
  AFTER INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_post(); 