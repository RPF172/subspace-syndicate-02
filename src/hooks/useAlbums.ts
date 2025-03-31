import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, ensureBucketExists } from '@/integrations/supabase/client';
import { Album, AlbumPrivacy, AlbumTag } from '@/types/albums';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface CreateAlbumInput {
  title: string;
  description?: string;
  privacy: AlbumPrivacy;
  tags?: string[];
  coverImage?: File;
}

// Type for raw album data from Supabase
interface RawAlbumData {
  id: string;
  user_id: string;
  title: string;
  description: string;
  privacy: string;
  cover_image_url: string;
  likes: number;
  views: number;
  created_at: string;
  updated_at: string;
}

// Helper function to ensure album data matches Album type
const ensureAlbumType = (data: any): Album => {
  return {
    id: data.id,
    user_id: data.user_id,
    title: data.title,
    description: data.description,
    privacy: data.privacy as AlbumPrivacy,
    cover_image_url: data.cover_image_url,
    likes: data.likes,
    views: data.views,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

export const useAlbums = (userId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const targetUserId = userId || user?.id;

  const {
    data: albums,
    isLoading: isLoadingAlbums,
    error: albumsError,
    refetch: refetchAlbums
  } = useQuery({
    queryKey: ['albums', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];

      let query = supabase
        .from('albums')
        .select('*')
        .order('created_at', { ascending: false });

      if (targetUserId !== user?.id) {
        query = query.eq('privacy', 'public');
      }

      query = query.eq('user_id', targetUserId);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching albums:', error);
        throw error;
      }

      return data.map(album => ({
        ...album,
        privacy: album.privacy as AlbumPrivacy
      })) as Album[];
    },
    enabled: !!targetUserId
  });

  const createAlbum = async (input: CreateAlbumInput): Promise<Album | null> => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to create an album',
        variant: 'destructive'
      });
      return null;
    }

    setLoading(true);

    try {
      const bucketExists = await ensureBucketExists('album_media');
      if (!bucketExists) {
        throw new Error('Album media storage is not available. Please try again later.');
      }

      let coverImageUrl = null;

      if (input.coverImage) {
        const fileExt = input.coverImage.name.split('.').pop();
        const filePath = `covers/${user.id}/${uuidv4()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('album_media')
          .upload(filePath, input.coverImage);

        if (uploadError) throw uploadError;

        const { data: signedUrlData } = await supabase.storage
          .from('album_media')
          .createSignedUrl(filePath, 300); // 5 minutes

        if (!signedUrlData?.signedUrl) {
          throw new Error('Failed to get signed URL for cover image');
        }

        coverImageUrl = signedUrlData.signedUrl;
      }

      const { data: albumData, error: albumError } = await supabase
        .from('albums')
        .insert({
          user_id: user.id,
          title: input.title,
          description: input.description || null,
          privacy: input.privacy,
          cover_image_url: coverImageUrl
        })
        .select()
        .single();

      if (albumError) throw albumError;

      if (input.tags && input.tags.length > 0 && albumData) {
        const tagPromises = input.tags.map(tag =>
          supabase
            .from('album_tags')
            .insert({
              album_id: albumData.id,
              tag: tag.toLowerCase().trim()
            })
        );

        await Promise.all(tagPromises);
      }

      queryClient.invalidateQueries({ queryKey: ['albums', user.id] });

      toast({
        title: 'Album created',
        description: 'Your album has been created successfully'
      });

      return {
        ...albumData,
        privacy: albumData.privacy as AlbumPrivacy
      } as Album;
    } catch (error: any) {
      console.error('Error creating album:', error);
      toast({
        title: 'Failed to create album',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteAlbum = async (albumId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to delete an album',
        variant: 'destructive'
      });
      return false;
    }

    setLoading(true);

    try {
      const { data: mediaItems } = await supabase
        .from('media')
        .select('url')
        .eq('album_id', albumId);

      const { error: deleteError } = await supabase
        .from('albums')
        .delete()
        .eq('id', albumId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      if (mediaItems && mediaItems.length > 0) {
        const filePaths = mediaItems.map(item => {
          const url = new URL(item.url);
          return url.pathname.split('/').slice(-2).join('/');
        });

        if (filePaths.length > 0) {
          await supabase.storage
            .from('album_media')
            .remove(filePaths);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['albums', user.id] });

      toast({
        title: 'Album deleted',
        description: 'Your album has been deleted successfully'
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting album:', error);
      toast({
        title: 'Failed to delete album',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateAlbum = async (
    albumId: string,
    updates: Partial<Omit<CreateAlbumInput, 'tags'>> & { tags?: string[] }
  ): Promise<Album | null> => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to update an album',
        variant: 'destructive'
      });
      return null;
    }

    setLoading(true);

    try {
      let coverImageUrl;

      if (updates.coverImage) {
        const fileExt = updates.coverImage.name.split('.').pop();
        const filePath = `covers/${user.id}/${uuidv4()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('album_media')
          .upload(filePath, updates.coverImage);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('album_media')
          .getPublicUrl(filePath);

        coverImageUrl = urlData.publicUrl;
      }

      const updateData: Record<string, any> = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.privacy !== undefined) updateData.privacy = updates.privacy;
      if (coverImageUrl) updateData.cover_image_url = coverImageUrl;

      const { data: albumData, error: albumError } = await supabase
        .from('albums')
        .update(updateData)
        .eq('id', albumId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (albumError) throw albumError;

      if (updates.tags !== undefined) {
        await supabase
          .from('album_tags')
          .delete()
          .eq('album_id', albumId);

        if (updates.tags.length > 0) {
          const tagPromises = updates.tags.map(tag =>
            supabase
              .from('album_tags')
              .insert({
                album_id: albumId,
                tag: tag.toLowerCase().trim()
              })
          );

          await Promise.all(tagPromises);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['albums', user.id] });
      queryClient.invalidateQueries({ queryKey: ['album', albumId] });

      toast({
        title: 'Album updated',
        description: 'Your album has been updated successfully'
      });

      return {
        ...albumData,
        privacy: albumData.privacy as AlbumPrivacy
      } as Album;
    } catch (error: any) {
      console.error('Error updating album:', error);
      toast({
        title: 'Failed to update album',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const likeAlbumMutation = useMutation({
    mutationFn: async (albumId: string) => {
      if (!user) throw new Error('Authentication required');

      const { data: existingLike } = await supabase
        .from('album_likes')
        .select('id')
        .eq('album_id', albumId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        await supabase
          .from('album_likes')
          .delete()
          .eq('album_id', albumId)
          .eq('user_id', user.id);

        const { data } = await supabase.rpc('decrement_album_likes', { album_id: albumId });
        
        return { liked: false, likes: data as number };
      } else {
        await supabase
          .from('album_likes')
          .insert({
            album_id: albumId,
            user_id: user.id
          });

        const { data } = await supabase.rpc('increment_album_likes', { album_id: albumId });
        
        return { liked: true, likes: data as number };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      queryClient.invalidateQueries({ queryKey: ['album-likes'] });
    }
  });

  const useAlbumLiked = (albumId: string) => {
    return useQuery({
      queryKey: ['album-likes', albumId, user?.id],
      queryFn: async () => {
        if (!user) return false;
        
        const { data } = await supabase
          .from('album_likes')
          .select('id')
          .eq('album_id', albumId)
          .eq('user_id', user.id)
          .single();
          
        return !!data;
      },
      enabled: !!user && !!albumId
    });
  };

  const useAlbumTags = (albumId: string) => {
    return useQuery({
      queryKey: ['album-tags', albumId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('album_tags')
          .select('*')
          .eq('album_id', albumId);
          
        if (error) throw error;
        
        return data as AlbumTag[];
      },
      enabled: !!albumId
    });
  };

  return {
    albums,
    isLoadingAlbums,
    albumsError,
    loading,
    createAlbum,
    deleteAlbum,
    updateAlbum,
    likeAlbum: (albumId: string) => likeAlbumMutation.mutate(albumId),
    useAlbumLiked,
    useAlbumTags,
    refetchAlbums
  };
};

export const useAlbum = (albumId: string) => {
  const { user } = useAuth();
  
  const incrementView = async () => {
    if (!albumId) return;
    
    try {
      await supabase.rpc('increment_album_views', { album_id: albumId });
    } catch (error) {
      console.error('Error incrementing album views:', error);
    }
  };

  return useQuery({
    queryKey: ['album', albumId],
    queryFn: async () => {
      if (!albumId) throw new Error('Album ID is required');
      
      try {
        // First, get basic album info to check privacy
        const { data: basicAlbum, error: basicError } = await supabase
          .from('albums')
          .select('id, privacy, user_id')
          .eq('id', albumId)
          .single();

        if (basicError) {
          console.error('Error fetching basic album info:', basicError);
          if (basicError.code === 'PGRST116') {
            throw new Error('Album not found');
          }
          throw basicError;
        }

        // Check privacy permissions
        if (basicAlbum.privacy !== 'public' && basicAlbum.user_id !== user?.id) {
          throw new Error('You do not have permission to view this album');
        }

        // If we have permission, fetch the full album data
        // Modify this query to avoid the join that's causing issues
        const { data: albumData, error: albumError } = await supabase
          .from('albums')
          .select('*')
          .eq('id', albumId)
          .single();
          
        if (albumError) {
          console.error('Error fetching full album data:', albumError);
          throw albumError;
        }
        
        // Now fetch the user profile separately
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('username, avatar_url, bdsm_role')
          .eq('id', albumData.user_id)
          .single();
          
        if (profileError) {
          console.error('Error fetching profile data:', profileError);
          // Don't throw here, just continue with a null profile
        }
        
        // Only increment views for public albums that the user doesn't own
        if (albumData.privacy === 'public' && user?.id !== albumData.user_id) {
          incrementView();
        }
        
        return {
          ...albumData,
          privacy: albumData.privacy as AlbumPrivacy,
          profiles: profileData || {
            username: 'Unknown User',
            avatar_url: null,
            bdsm_role: 'Exploring'
          }
        } as unknown as Album & {
          profiles: {
            username: string;
            avatar_url: string | null;
            bdsm_role: string;
          }
        };
      } catch (error: any) {
        console.error('Error in album fetch function:', error);
        // Rethrow with a more specific error message
        throw new Error(error.message || 'Failed to fetch album');
      }
    },
    enabled: !!albumId
  });
};
