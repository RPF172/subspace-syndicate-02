export interface Album {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  privacy: 'public' | 'private' | 'friends-only';
  created_at: string;
  updated_at: string;
  views: number;
  likes: number;
  cover_image_url: string | null;
}

export interface AlbumTag {
  id: string;
  album_id: string;
  tag: string;
  created_at: string;
}

export interface MediaItem {
  id: string;
  album_id: string;
  user_id: string;
  url: string;
  thumbnail_url: string | null;
  file_name: string;
  file_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  duration: number | null;
  description: string | null;
  likes: number;
  views: number;
  created_at: string;
  updated_at: string;
  album?: Album;
  profile?: {
    username: string;
    avatar_url: string | null;
    bdsm_role: string;
  };
  navigation?: {
    next: { id: string } | null;
    previous: { id: string } | null;
    isLast: boolean;
    isFirst: boolean;
  };
}

export interface MediaComment {
  id: string;
  media_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profile?: {
    username?: string;
    avatar_url?: string;
  };
}

export type AlbumPrivacy = 'public' | 'private' | 'friends-only';
