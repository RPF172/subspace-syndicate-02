import React from 'react';
import { useParams } from 'react-router-dom';
import { useMediaItem } from '@/hooks/useMediaItems';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { AlbumPrivacy } from '@/types/albums';

// Import refactored components
import MediaHeader from '@/components/media/MediaHeader';
import MediaViewer from '@/components/media/MediaViewer';
import MediaCommentsSection from '@/components/albums/MediaCommentsSection';
import LoadingState from '@/components/media/LoadingState';
import ErrorState from '@/components/media/ErrorState';

const MediaDetailPage: React.FC = () => {
  const { albumId, mediaId } = useParams();
  const { user } = useAuth();
  const { 
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
  } = useMediaItem(mediaId || '');
  
  const getUsername = (profile: any) => {
    if (!profile) return 'Unknown user';
    if (typeof profile === 'string') return 'Unknown user';
    if (!profile.username) return 'Unknown user';
    return profile.username;
  };
  
  const getAvatarUrl = (profile: any) => {
    if (!profile) return undefined;
    if (typeof profile === 'string') return undefined;
    return profile.avatar_url;
  };

  const getBdsmRole = (profile: any) => {
    if (!profile) return 'Exploring';
    if (typeof profile === 'string') return 'Exploring';
    return profile.bdsm_role || 'Exploring';
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <LoadingState />
      </AuthenticatedLayout>
    );
  }
  
  if (error || !mediaItem) {
    return (
      <AuthenticatedLayout>
        <ErrorState albumId={albumId} />
      </AuthenticatedLayout>
    );
  }
  
  // Make a copy of the mediaItem with corrected profile and album properties
  // to ensure type compatibility
  const processedMediaItem = {
    ...mediaItem,
    profile: mediaItem.profile && typeof mediaItem.profile === 'object' ? {
      username: getUsername(mediaItem.profile),
      avatar_url: getAvatarUrl(mediaItem.profile),
      bdsm_role: getBdsmRole(mediaItem.profile)
    } : undefined,
    album: mediaItem.album && typeof mediaItem.album === 'object' ? {
      id: mediaItem.album.id,
      title: mediaItem.album.title,
      privacy: mediaItem.album.privacy as AlbumPrivacy,
      user_id: mediaItem.album.user_id,
      description: mediaItem.album.description || null,
      created_at: mediaItem.album.created_at,
      updated_at: mediaItem.album.updated_at,
      views: mediaItem.album.views || 0,
      likes: mediaItem.album.likes || 0,
      cover_image_url: mediaItem.album.cover_image_url || null
    } : undefined
  };
  
  const isOwner = user?.id === processedMediaItem.user_id;
  
  const handleLike = () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to like this media',
        variant: 'destructive'
      });
      return;
    }
    
    likeMedia(mediaId || '');
  };
  
  const handleBookmark = () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to bookmark this media',
        variant: 'destructive'
      });
      return;
    }
    
    bookmarkMedia(mediaId || '');
  };
  
  // Transform the comments data to make it compatible with the MediaComment type
  const processedComments = comments?.map(comment => ({
    ...comment,
    profile: comment.profile && typeof comment.profile === 'object' ? {
      username: getUsername(comment.profile),
      avatar_url: getAvatarUrl(comment.profile)
    } : { username: 'Unknown user', avatar_url: undefined }
  })) || [];
  
  return (
    <AuthenticatedLayout>
      <div className="container py-6">
        <MediaHeader albumId={albumId || ''} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MediaViewer 
              mediaItem={{
                ...processedMediaItem,
                album: processedMediaItem.album ? {
                  id: processedMediaItem.album.id,
                  title: processedMediaItem.album.title,
                  privacy: processedMediaItem.album.privacy,
                  user_id: processedMediaItem.album.user_id,
                  description: processedMediaItem.album.description,
                  created_at: processedMediaItem.album.created_at,
                  updated_at: processedMediaItem.album.updated_at,
                  views: processedMediaItem.album.views,
                  likes: processedMediaItem.album.likes,
                  cover_image_url: processedMediaItem.album.cover_image_url
                } : undefined
              }}
              isLiked={isLiked}
              isBookmarked={isBookmarked}
              onLike={handleLike}
              onBookmark={handleBookmark}
            />
          </div>
          
          <div>
            <MediaCommentsSection 
              comments={processedComments}
              onAddComment={addComment}
              onDeleteComment={deleteComment}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default MediaDetailPage;
