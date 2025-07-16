-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Prisma schema tables
CREATE TABLE IF NOT EXISTS public."CreatorApplication" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  userId TEXT NOT NULL,
  status TEXT NOT NULL,
  isOver18 BOOLEAN NOT NULL,
  agreesToTerms BOOLEAN NOT NULL,
  dateSubmitted TIMESTAMPTZ NOT NULL,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public."Identity" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  applicationId TEXT UNIQUE NOT NULL,
  fullName TEXT NOT NULL,
  dateOfBirth TIMESTAMPTZ NOT NULL,
  countryOfResidence TEXT NOT NULL,
  governmentIdFrontUrl TEXT NOT NULL,
  governmentIdBackUrl TEXT NOT NULL,
  selfieUrl TEXT NOT NULL,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_identity_application FOREIGN KEY (applicationId) REFERENCES public."CreatorApplication"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public."TaxInfo" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  applicationId TEXT UNIQUE NOT NULL,
  isUSCitizen BOOLEAN NOT NULL,
  taxCountry TEXT NOT NULL,
  taxId TEXT NOT NULL,
  businessName TEXT,
  taxAddress TEXT NOT NULL,
  taxClassification TEXT NOT NULL,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_taxinfo_application FOREIGN KEY (applicationId) REFERENCES public."CreatorApplication"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public."PaymentInfo" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  applicationId TEXT UNIQUE NOT NULL,
  stripeConnectId TEXT NOT NULL,
  payoutCurrency TEXT NOT NULL,
  payoutSchedule TEXT NOT NULL,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_paymentinfo_application FOREIGN KEY (applicationId) REFERENCES public."CreatorApplication"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public."CreatorProfile" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  applicationId TEXT UNIQUE NOT NULL,
  displayName TEXT UNIQUE NOT NULL,
  profilePhotoUrl TEXT NOT NULL,
  bio TEXT NOT NULL,
  contentCategories TEXT[] NOT NULL,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_creatorprofile_application FOREIGN KEY (applicationId) REFERENCES public."CreatorApplication"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public."Agreement" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  applicationId TEXT UNIQUE NOT NULL,
  agreesToAllDocs BOOLEAN NOT NULL,
  signature TEXT NOT NULL,
  signatureDate TIMESTAMPTZ NOT NULL,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_agreement_application FOREIGN KEY (applicationId) REFERENCES public."CreatorApplication"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public."Message" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  userId TEXT NOT NULL,
  sender TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  isRead BOOLEAN NOT NULL DEFAULT false,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_message_userId ON public."Message"(userId);

CREATE TABLE IF NOT EXISTS public."TokenMetadata" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  tokenId TEXT UNIQUE NOT NULL,
  userId TEXT NOT NULL,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  expiresAt TIMESTAMPTZ NOT NULL,
  isRevoked BOOLEAN NOT NULL DEFAULT false,
  revokedAt TIMESTAMPTZ,
  revokedBy TEXT,
  lastUsedAt TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_tokenmetadata_userId ON public."TokenMetadata"(userId);
CREATE INDEX IF NOT EXISTS idx_tokenmetadata_tokenId ON public."TokenMetadata"(tokenId);

CREATE TABLE IF NOT EXISTS public."RevokedToken" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  tokenId TEXT UNIQUE NOT NULL,
  userId TEXT NOT NULL,
  revokedAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  revokedBy TEXT NOT NULL,
  reason TEXT,
  CONSTRAINT fk_revokedtoken_user FOREIGN KEY (userId) REFERENCES public."TokenMetadata"(userId)
);
CREATE INDEX IF NOT EXISTS idx_revokedtoken_userId ON public."RevokedToken"(userId);
CREATE INDEX IF NOT EXISTS idx_revokedtoken_tokenId ON public."RevokedToken"(tokenId);

CREATE TABLE IF NOT EXISTS public."UserRole" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  userId TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_userrole_userId ON public."UserRole"(userId);

CREATE TABLE IF NOT EXISTS public."FileAccessLog" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  applicationId TEXT NOT NULL,
  fileType TEXT NOT NULL,
  accessedBy TEXT NOT NULL,
  accessTime TIMESTAMPTZ NOT NULL DEFAULT now(),
  expiresAt TIMESTAMPTZ NOT NULL,
  ipAddress TEXT,
  userAgent TEXT,
  CONSTRAINT fk_fileaccesslog_application FOREIGN KEY (applicationId) REFERENCES public."CreatorApplication"(id)
);
CREATE INDEX IF NOT EXISTS idx_fileaccesslog_applicationId ON public."FileAccessLog"(applicationId);
CREATE INDEX IF NOT EXISTS idx_fileaccesslog_accessedBy ON public."FileAccessLog"(accessedBy);
CREATE INDEX IF NOT EXISTS idx_fileaccesslog_accessTime ON public."FileAccessLog"(accessTime);

-- Supabase social features tables
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_post_likes_post FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_post_likes_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT unique_post_like UNIQUE (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  parent_id UUID NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_parent FOREIGN KEY (parent_id) REFERENCES public.comments(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);

CREATE TABLE IF NOT EXISTS public.post_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'gif')),
  aspect_ratio FLOAT,
  duration INTEGER,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.post_hashtags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  hashtag TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, hashtag)
);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_hashtag ON public.post_hashtags(hashtag);

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  all_posts BOOLEAN NOT NULL DEFAULT TRUE,
  followed_users BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS public.hashtag_notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hashtag TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, hashtag)
);

-- Community chats table
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
CREATE INDEX IF NOT EXISTS idx_community_chats_room_id ON public.community_chats(room_id);
CREATE INDEX IF NOT EXISTS idx_community_chats_user_id ON public.community_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_community_chats_created_at ON public.community_chats(created_at);

-- Add banner_url to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Views
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

-- RLS and policies for all relevant tables
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all post likes" 
  ON public.post_likes FOR SELECT 
  USING (true);
CREATE POLICY "Users can create their own likes" 
  ON public.post_likes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes" 
  ON public.post_likes FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view all comments" 
  ON public.comments FOR SELECT 
  USING (true);
CREATE POLICY "Users can create their own comments" 
  ON public.comments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" 
  ON public.comments FOR UPDATE 
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" 
  ON public.comments FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Community chats are viewable by authenticated users"
  ON public.community_chats
  FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert their own community chats"
  ON public.community_chats
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own community chats"
  ON public.community_chats
  FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own community chats"
  ON public.community_chats
  FOR DELETE
  USING (auth.uid() = user_id);

-- Functions and triggers
CREATE OR REPLACE FUNCTION public.handle_new_comment()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'new_comment',
    json_build_object(
      'id', NEW.id,
      'post_id', NEW.post_id,
      'user_id', NEW.user_id,
      'parent_id', NEW.parent_id
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_comment
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_comment();

CREATE OR REPLACE FUNCTION public.handle_new_post()
RETURNS TRIGGER AS $$
BEGIN
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

DROP TRIGGER IF EXISTS on_new_post ON public.posts;
CREATE TRIGGER on_new_post
  AFTER INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_post();

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_community_chats_updated_at
BEFORE UPDATE ON public.community_chats
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Album/media like functions
CREATE OR REPLACE FUNCTION public.increment_album_likes(album_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_likes INTEGER;
BEGIN
  UPDATE public.albums
  SET likes = likes + 1
  WHERE id = album_id
  RETURNING likes INTO new_likes;
  RETURN new_likes;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_album_likes(album_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_likes INTEGER;
BEGIN
  UPDATE public.albums
  SET likes = GREATEST(0, likes - 1)
  WHERE id = album_id
  RETURNING likes INTO new_likes;
  RETURN new_likes;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_media_likes(media_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_likes INTEGER;
BEGIN
  UPDATE public.media
  SET likes = likes + 1
  WHERE id = media_id
  RETURNING likes INTO new_likes;
  RETURN new_likes;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_media_likes(media_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_likes INTEGER;
BEGIN
  UPDATE public.media
  SET likes = GREATEST(0, likes - 1)
  WHERE id = media_id
  RETURNING likes INTO new_likes;
  RETURN new_likes;
END;
$$;

-- Storage buckets and policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Media storage policies
CREATE POLICY "Media uploads are available to authenticated users"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media' AND (storage.foldername(name))[1] = 'community');
CREATE POLICY "Media is viewable by everyone"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'media');
CREATE POLICY "Users can update their own media uploads"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'media' AND owner = auth.uid());
CREATE POLICY "Users can delete their own media uploads"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'media' AND owner = auth.uid());

-- Album media storage policies
CREATE POLICY "Users can upload album media"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'album_media');
CREATE POLICY "Album media is viewable through signed URLs only"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'album_media' AND
    ((storage.foldername(name))[1] = auth.uid()::text OR (storage.foldername(name))[1] = 'covers')
  );
CREATE POLICY "Users can update their own album media"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'album_media' AND
    ((storage.foldername(name))[1] = auth.uid()::text OR (storage.foldername(name))[1] = 'covers')
  );
CREATE POLICY "Users can delete their own album media"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'album_media' AND
    ((storage.foldername(name))[1] = auth.uid()::text OR (storage.foldername(name))[1] = 'covers')
  );

-- Banner storage policies
CREATE POLICY "Users can upload their banners"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND storage.foldername(name)[1] = 'banners');
CREATE POLICY "Banner images are publicly viewable"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars' AND storage.foldername(name)[1] = 'banners');
CREATE POLICY "Users can update their own banners"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'avatars' AND storage.foldername(name)[1] = 'banners' AND owner = auth.uid());
CREATE POLICY "Users can delete their own banners"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'avatars' AND storage.foldername(name)[1] = 'banners' AND owner = auth.uid());

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_chats;