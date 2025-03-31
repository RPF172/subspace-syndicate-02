
-- Function to increment album likes
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

-- Function to decrement album likes
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

-- Function to increment media likes
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

-- Function to decrement media likes
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
