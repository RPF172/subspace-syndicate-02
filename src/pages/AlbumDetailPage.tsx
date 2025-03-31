import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAlbum, useAlbums } from '@/hooks/useAlbums';
import { useMediaItems } from '@/hooks/useMediaItems';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  Heart, 
  Eye, 
  Edit, 
  Trash2, 
  User, 
  Calendar, 
  MoreHorizontal 
} from 'lucide-react';
import MediaGrid from '@/components/albums/MediaGrid';
import MediaUploader from '@/components/albums/MediaUploader';
import AlbumForm from '@/components/albums/AlbumForm';
import { toast } from '@/hooks/use-toast';
import { AlbumPrivacy } from '@/types/albums';
import { format } from 'date-fns';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

const AlbumDetailPage: React.FC = () => {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: album, isLoading: isLoadingAlbum, error: albumError } = useAlbum(albumId || '');
  const { mediaItems, isLoadingMedia, uploadMedia, deleteMedia } = useMediaItems(albumId);
  const { likeAlbum, useAlbumLiked, useAlbumTags, deleteAlbum, updateAlbum } = useAlbums();
  const { data: isLiked } = useAlbumLiked(albumId || '');
  const { data: tags } = useAlbumTags(albumId || '');
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    if (albumError) {
      console.error('Album error details:', albumError);
      toast({
        title: 'Error',
        description: 'Failed to load album. It may have been deleted or you don\'t have permission to view it.',
        variant: 'destructive'
      });
      navigate('/albums');
    }
  }, [albumError, navigate]);
  
  if (isLoadingAlbum) {
    return (
      <AuthenticatedLayout pageTitle="Loading Album...">
        <div className="container py-6">
          <Card className="bg-black/20 border-white/10">
            <CardContent className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-crimson"></div>
            </CardContent>
          </Card>
        </div>
      </AuthenticatedLayout>
    );
  }
  
  if (!album || !albumId) {
    return (
      <AuthenticatedLayout pageTitle="Album Not Found">
        <div className="container py-6">
          <Card className="bg-black/20 border-white/10">
            <CardContent className="py-12 text-center">
              <h3 className="text-xl font-medium text-white mb-2">Album Not Found</h3>
              <p className="text-white/70 mb-6">This album doesn't exist or has been deleted</p>
              <Button onClick={() => navigate('/albums')}>Go Back to Albums</Button>
            </CardContent>
          </Card>
        </div>
      </AuthenticatedLayout>
    );
  }
  
  const isOwner = user?.id === album.user_id;
  
  const handleLike = () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to like this album',
        variant: 'destructive'
      });
      return;
    }
    
    likeAlbum(albumId);
  };
  
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this album? This action cannot be undone.')) {
      return;
    }
    
    const success = await deleteAlbum(albumId);
    if (success) {
      navigate('/albums');
    }
  };
  
  const handleUpdate = async (data: {
    title: string;
    description: string;
    privacy: AlbumPrivacy;
    tags: string[];
    coverImage?: File;
  }) => {
    const success = await updateAlbum(albumId, data);
    if (success) {
      setIsEditing(false);
    }
  };
  
  const getPrivacyLabel = (privacy: AlbumPrivacy) => {
    switch (privacy) {
      case 'public':
        return 'Public';
      case 'private':
        return 'Private';
      case 'friends-only':
        return 'Friends Only';
      default:
        return 'Unknown';
    }
  };

  const handleUploadMedia = async (file: File, description?: string) => {
    if (!albumId) return;
    
    await uploadMedia({
      albumId,
      file,
      description
    });
  };
  
  return (
    <AuthenticatedLayout pageTitle={album.title}>
      <div className="container py-6">
        {isEditing ? (
          <Card className="bg-black/20 border-white/10 mb-6">
            <CardContent className="py-4">
              <h2 className="text-xl font-semibold text-white mb-4">Edit Album</h2>
              <AlbumForm
                onSubmit={handleUpdate}
                isEditing={true}
                defaultValues={{
                  title: album.title,
                  description: album.description || '',
                  privacy: album.privacy,
                  tags: tags?.map(tag => tag.tag) || []
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white">{album.title}</h1>
                {isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-black/90 border-white/10">
                      <DropdownMenuItem onClick={() => setIsEditing(true)} className="cursor-pointer">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Album
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-red-500">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Album
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              
              {album.description && (
                <p className="text-white/70 mb-2 max-w-2xl">{album.description}</p>
              )}
              
              <div className="flex flex-wrap gap-2 mb-3">
                {tags?.map(tag => (
                  <span 
                    key={tag.id} 
                    className="px-2 py-1 text-xs bg-black/30 text-white/80 rounded-md border border-white/10"
                  >
                    #{tag.tag}
                  </span>
                ))}
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {album.profiles?.username || 'Unknown User'}
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {format(new Date(album.created_at), 'MMM d, yyyy')}
                </div>
                
                <div className="flex items-center">
                  <span className="font-medium mr-1">Privacy:</span>
                  {getPrivacyLabel(album.privacy)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <Button 
                variant={isLiked ? "default" : "outline"} 
                size="sm"
                onClick={handleLike}
                className={isLiked ? "bg-crimson hover:bg-crimson/90" : ""}
              >
                <Heart className={`mr-1 h-4 w-4 ${isLiked ? "fill-white" : ""}`} />
                {album.likes}
              </Button>
              
              <div className="flex items-center gap-1 text-white/70 px-3 py-1 rounded-md border border-white/10 bg-black/20">
                <Eye className="h-4 w-4" />
                <span>{album.views}</span>
              </div>
            </div>
          </div>
        )}
        
        <Tabs defaultValue="media" className="w-full">
          <TabsList className="bg-black/20 border border-white/10">
            <TabsTrigger value="media">Media</TabsTrigger>
            {isOwner && <TabsTrigger value="upload">Upload</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="media" className="mt-4">
            <MediaGrid mediaItems={mediaItems || []} albumId={albumId} />
          </TabsContent>
          
          {isOwner && (
            <TabsContent value="upload" className="mt-4">
              <MediaUploader 
                albumId={albumId} 
                onUpload={handleUploadMedia}
                uploadProgress={{}}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
};

export default AlbumDetailPage;
