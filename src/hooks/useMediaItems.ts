import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, ensureBucketExists } from '@/integrations/supabase/client';
import { MediaItem, MediaComment, Album, AlbumPrivacy } from '@/types/albums';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface UploadMediaInput {
  albumId: string;
  file: File;
  description?: string;
}

interface UpdateMediaInput {
  description?: string;
}

export const useMediaItems = (albumId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const {
    data: mediaItems,
    isLoading: isLoadingMedia,
    error: mediaError,
    refetch: refetchMedia
  } = useQuery({
    queryKey: ['media', albumId],
    queryFn: async () => {
      if (!albumId) return [];
      
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('album_id', albumId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching media:', error);
        throw error;
      }
      
      return data as MediaItem[];
    },
    enabled: !!albumId
  });

  const uploadMedia = async (input: UploadMediaInput): Promise<MediaItem | null> => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to upload media',
        variant: 'destructive'
      });
      return null;
    }

    const tempId = uuidv4();
    setUploadProgress({ ...uploadProgress, [tempId]: 0 });

    try {
      const bucketExists = await ensureBucketExists('album_media');
      if (!bucketExists) {
        throw new Error('Media storage is not available. Please try again later.');
      }

      const fileExt = input.file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(prev => ({ ...prev, [tempId]: percentComplete }));
        }
      });
      
      const uploadPromise = new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
      });
      
      const { data: uploadData } = await supabase.storage
        .from('album_media')
        .createSignedUploadUrl(filePath);
      
      if (!uploadData?.signedUrl) {
        throw new Error('Failed to get upload URL');
      }
      
      xhr.open('PUT', uploadData.signedUrl);
      xhr.setRequestHeader('Content-Type', input.file.type);
      xhr.send(input.file);
      
      await uploadPromise;

      // Get signed URL for the uploaded file
      const { data: signedUrlData } = await supabase.storage
        .from('album_media')
        .createSignedUrl(filePath, 300); // 5 minutes

      if (!signedUrlData?.signedUrl) {
        throw new Error('Failed to get signed URL for uploaded file');
      }

      let thumbnailUrl = null;
      if (input.file.type.startsWith('image/')) {
        thumbnailUrl = signedUrlData.signedUrl;
      } else if (input.file.type.startsWith('video/')) {
        thumbnailUrl = null;
      }

      let width = null;
      let height = null;
      let duration = null;

      if (input.file.type.startsWith('image/')) {
        const img = new Image();
        const dimensionsPromise = new Promise<void>((resolve) => {
          img.onload = () => {
            width = img.width;
            height = img.height;
            resolve();
          };
          img.onerror = () => {
            resolve();
          };
        });
        img.src = URL.createObjectURL(input.file);
        await dimensionsPromise;
        URL.revokeObjectURL(img.src);
      } else if (input.file.type.startsWith('video/')) {
        const video = document.createElement('video');
        const dimensionsPromise = new Promise<void>((resolve) => {
          video.onloadedmetadata = () => {
            width = video.videoWidth;
            height = video.videoHeight;
            duration = Math.round(video.duration);
            resolve();
          };
          video.onerror = () => {
            resolve();
          };
        });
        video.src = URL.createObjectURL(input.file);
        await dimensionsPromise;
        URL.revokeObjectURL(video.src);
      }

      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .insert({
          album_id: input.albumId,
          user_id: user.id,
          url: filePath, // Store the file path instead of the full URL
          thumbnail_url: thumbnailUrl,
          file_name: input.file.name,
          file_type: input.file.type,
          file_size: input.file.size,
          width,
          height,
          duration,
          description: input.description || null
        })
        .select()
        .single();

      if (mediaError) throw mediaError;

      const { data: albumMedia } = await supabase
        .from('media')
        .select('id')
        .eq('album_id', input.albumId);

      if (albumMedia && albumMedia.length === 1) {
        await supabase
          .from('albums')
          .update({ cover_image_url: thumbnailUrl || signedUrlData.signedUrl })
          .eq('id', input.albumId);
      }

      queryClient.invalidateQueries({ queryKey: ['media', input.albumId] });
      queryClient.invalidateQueries({ queryKey: ['albums'] });

      setUploadProgress(prev => {
        const updated = { ...prev };
        delete updated[tempId];
        return updated;
      });

      return mediaData;
    } catch (error: any) {
      console.error('Error uploading media:', error);
      toast({
        title: 'Failed to upload media',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });

      setUploadProgress(prev => {
        const updated = { ...prev };
        delete updated[tempId];
        return updated;
      });

      return null;
    }
  };

  const deleteMedia = async (mediaId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to delete media',
        variant: 'destructive'
      });
      return false;
    }

    try {
      const { data: mediaItem, error: fetchError } = await supabase
        .from('media')
        .select('*')
        .eq('id', mediaId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;
      if (!mediaItem) throw new Error('Media not found');

      const { error: deleteError } = await supabase
        .from('media')
        .delete()
        .eq('id', mediaId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      if (mediaItem.url) {
        const url = new URL(mediaItem.url);
        const path = url.pathname.split('/').slice(-2).join('/');
        
        await supabase.storage
          .from('album_media')
          .remove([path]);
      }

      if (mediaItem.thumbnail_url && mediaItem.thumbnail_url !== mediaItem.url) {
        const thumbUrl = new URL(mediaItem.thumbnail_url);
        const thumbPath = thumbUrl.pathname.split('/').slice(-2).join('/');
        
        await supabase.storage
          .from('album_media')
          .remove([thumbPath]);
      }

      const { data: album } = await supabase
        .from('albums')
        .select('cover_image_url')
        .eq('id', mediaItem.album_id)
        .single();

      if (album && album.cover_image_url === mediaItem.url) {
        const { data: otherMedia } = await supabase
          .from('media')
          .select('url, thumbnail_url')
          .eq('album_id', mediaItem.album_id)
          .limit(1)
          .single();

        await supabase
          .from('albums')
          .update({
            cover_image_url: otherMedia
              ? (otherMedia.thumbnail_url || otherMedia.url)
              : null
          })
          .eq('id', mediaItem.album_id);
      }

      queryClient.invalidateQueries({ queryKey: ['media', mediaItem.album_id] });
      queryClient.invalidateQueries({ queryKey: ['albums'] });

      toast({
        title: 'Media deleted',
        description: 'The media item has been deleted successfully'
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting media:', error);
      toast({
        title: 'Failed to delete media',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
      return false;
    }
  };

  const updateMedia = async (mediaId: string, updates: UpdateMediaInput): Promise<MediaItem | null> => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to update media',
        variant: 'destructive'
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('media')
        .update(updates)
        .eq('id', mediaId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      if (albumId) {
        queryClient.invalidateQueries({ queryKey: ['media', albumId] });
      }
      queryClient.invalidateQueries({ queryKey: ['media-item', mediaId] });

      toast({
        title: 'Media updated',
        description: 'The media details have been updated successfully'
      });

      return data;
    } catch (error: any) {
      console.error('Error updating media:', error);
      toast({
        title: 'Failed to update media',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
      return null;
    }
  };

  const likeMediaMutation = useMutation({
    mutationFn: async (mediaId: string) => {
      if (!user) throw new Error('Authentication required');

      const { data: existingLike } = await supabase
        .from('media_likes')
        .select('id')
        .eq('media_id', mediaId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        await supabase
          .from('media_likes')
          .delete()
          .eq('media_id', mediaId)
          .eq('user_id', user.id);

        const { data } = await supabase.rpc('decrement_media_likes', { media_id: mediaId });
        
        return { liked: false, likes: data as number };
      } else {
        await supabase
          .from('media_likes')
          .insert({
            media_id: mediaId,
            user_id: user.id
          });

        const { data } = await supabase.rpc('increment_media_likes', { media_id: mediaId });
        
        return { liked: true, likes: data as number };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      queryClient.invalidateQueries({ queryKey: ['media-likes'] });
    }
  });

  const bookmarkMediaMutation = useMutation({
    mutationFn: async (mediaId: string) => {
      if (!user) throw new Error('Authentication required');

      const { data: existingBookmark } = await supabase
        .from('media_bookmarks')
        .select('id')
        .eq('media_id', mediaId)
        .eq('user_id', user.id)
        .single();

      if (existingBookmark) {
        await supabase
          .from('media_bookmarks')
          .delete()
          .eq('media_id', mediaId)
          .eq('user_id', user.id);
        
        return { bookmarked: false };
      } else {
        await supabase
          .from('media_bookmarks')
          .insert({
            media_id: mediaId,
            user_id: user.id
          });
        
        return { bookmarked: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-bookmarks'] });
    }
  });

  return {
    mediaItems,
    isLoadingMedia,
    mediaError,
    uploadProgress,
    uploadMedia,
    deleteMedia,
    updateMedia,
    likeMedia: (mediaId: string) => likeMediaMutation.mutate(mediaId),
    bookmarkMedia: (mediaId: string) => bookmarkMediaMutation.mutate(mediaId),
    refetchMedia
  };
};

export const useMediaItem = (mediaId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: isLiked } = useQuery({
    queryKey: ['media-likes', mediaId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data } = await supabase
        .from('media_likes')
        .select('id')
        .eq('media_id', mediaId)
        .eq('user_id', user.id)
        .single();
        
      return !!data;
    },
    enabled: !!user && !!mediaId
  });
  
  const { data: isBookmarked } = useQuery({
    queryKey: ['media-bookmarks', mediaId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data } = await supabase
        .from('media_bookmarks')
        .select('id')
        .eq('media_id', mediaId)
        .eq('user_id', user.id)
        .single();
        
      return !!data;
    },
    enabled: !!user && !!mediaId
  });

  const { data: comments } = useQuery({
    queryKey: ['media-comments', mediaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_comments')
        .select(`
          *,
          profile:profiles!media_comments_user_id_fkey(
            username,
            avatar_url
          )
        `)
        .eq('media_id', mediaId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      return data;
    },
    enabled: !!mediaId
  });
  
  const incrementView = async () => {
    if (!mediaId) return;
    
    try {
      await supabase.rpc('increment_media_views', { media_id: mediaId });
    } catch (error) {
      console.error('Error incrementing media views:', error);
    }
  };
  
  const { likeMedia, bookmarkMedia } = useMediaItems();

  const addComment = async (content: string) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to add a comment',
        variant: 'destructive'
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('media_comments')
        .insert({
          media_id: mediaId,
          user_id: user.id,
          content
        })
        .select()
        .single();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['media-comments', mediaId] });

      return data;
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Failed to add comment',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
      return null;
    }
  };
  
  const deleteComment = async (commentId: string) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to delete a comment',
        variant: 'destructive'
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('media_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['media-comments', mediaId] });

      return true;
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      toast({
        title: 'Failed to delete comment',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
      return false;
    }
  };

  const { data: mediaItem, isLoading, error } = useQuery({
    queryKey: ['media-item', mediaId],
    queryFn: async () => {
      if (!mediaId) throw new Error('Media ID is required');
      
      // First, get the media item
      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .select('*')
        .eq('id', mediaId)
        .single();
        
      if (mediaError) {
        if (mediaError.code === 'PGRST116') {
          throw new Error('Media not found');
        }
        throw mediaError;
      }

      // Then, get the album information
      const { data: albumData, error: albumError } = await supabase
        .from('albums')
        .select('id, title, privacy, user_id, description, created_at, updated_at, views, likes, cover_image_url')
        .eq('id', mediaData.album_id)
        .single();

      if (albumError) {
        if (albumError.code === 'PGRST116') {
          throw new Error('Album not found');
        }
        throw albumError;
      }

      // Get all media items in the album to find next/previous
      const { data: albumMedia, error: albumMediaError } = await supabase
        .from('media')
        .select('id, created_at')
        .eq('album_id', mediaData.album_id)
        .order('created_at', { ascending: true });

      if (albumMediaError) {
        console.error('Error fetching album media:', albumMediaError);
      }

      // Find current index and next/previous items
      const currentIndex = albumMedia?.findIndex(item => item.id === mediaId) ?? -1;
      const nextItem = currentIndex < (albumMedia?.length ?? 0) - 1 ? albumMedia?.[currentIndex + 1] : null;
      const prevItem = currentIndex > 0 ? albumMedia?.[currentIndex - 1] : null;

      // Get the user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username, avatar_url, bdsm_role')
        .eq('id', mediaData.user_id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        // Don't throw here, just use default values
      }

      // Check if the user has access to this media
      const hasAccess = 
        albumData.privacy === 'public' ||
        albumData.user_id === user?.id ||
        mediaData.user_id === user?.id;

      if (!hasAccess) {
        throw new Error('You do not have permission to view this media');
      }
      
      if (user?.id !== mediaData.user_id) {
        incrementView();
      }

      // Extract the file path from the URL
      const url = new URL(mediaData.url);
      const filePath = url.pathname.split('/').slice(-2).join('/');
      
      return {
        ...mediaData,
        url: filePath, // Store the file path instead of the full URL
        album: {
          ...albumData,
          privacy: albumData.privacy as AlbumPrivacy
        },
        profile: profileData || {
          username: 'Unknown user',
          avatar_url: null,
          bdsm_role: 'Exploring'
        },
        navigation: {
          next: nextItem ? { id: nextItem.id } : null,
          previous: prevItem ? { id: prevItem.id } : null,
          isLast: !nextItem,
          isFirst: !prevItem
        }
      };
    },
    enabled: !!mediaId
  });

  return {
    mediaItem,
    isLoading,
    error,
    isLiked,
    isBookmarked,
    comments,
    addComment,
    deleteComment,
    likeMedia,
    bookmarkMedia
  };
};
