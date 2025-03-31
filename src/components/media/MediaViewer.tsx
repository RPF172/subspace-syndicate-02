import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardFooter } from '@/components/ui/card';
import { Heart, BookmarkIcon, Eye, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MediaItem } from '@/types/albums';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useSignedUrl } from '@/hooks/useSignedUrl';

interface MediaViewerProps {
  mediaItem: MediaItem;
  isLiked: boolean;
  isBookmarked: boolean;
  onLike: () => void;
  onBookmark: () => void;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ 
  mediaItem, 
  isLiked, 
  isBookmarked, 
  onLike, 
  onBookmark
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwner = user?.id === mediaItem.user_id;
  const signedUrl = useSignedUrl(mediaItem.url);

  const handleNavigation = (direction: 'next' | 'previous') => {
    const targetId = mediaItem.navigation?.[direction]?.id;
    if (targetId) {
      navigate(`/albums/${mediaItem.album.id}/media/${targetId}`);
    } else if (direction === 'next' && mediaItem.navigation?.isLast) {
      // If we're at the last item, navigate back to the album
      navigate(`/albums/${mediaItem.album.id}`);
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    if (mediaItem.file_type.startsWith('image/')) {
      handleNavigation('next');
    }
  };
  
  return (
    <Card className="bg-black/20 border-white/10 overflow-hidden">
      <div className="relative">
        {mediaItem.file_type.startsWith('image/') ? (
          <div className="relative">
            <img 
              src={signedUrl} 
              alt={mediaItem.description || 'Media preview'} 
              className="w-full h-auto select-none cursor-pointer"
              draggable="false"
              onContextMenu={(e) => e.preventDefault()}
              onClick={handleImageClick}
            />
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none'
              }}
            />
          </div>
        ) : mediaItem.file_type.startsWith('video/') ? (
          <video 
            src={signedUrl}
            controls
            className="w-full h-auto select-none"
            draggable="false"
            onContextMenu={(e) => e.preventDefault()}
          />
        ) : (
          <div className="w-full aspect-video flex items-center justify-center bg-black/40">
            <p className="text-white/60">Unsupported media type</p>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none">
          <Button
            variant="ghost"
            size="icon"
            className={`h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 text-white pointer-events-auto ${
              mediaItem.navigation?.isFirst ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => handleNavigation('previous')}
            disabled={mediaItem.navigation?.isFirst}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className={`h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 text-white pointer-events-auto ${
              mediaItem.navigation?.isLast ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => handleNavigation('next')}
            disabled={mediaItem.navigation?.isLast}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
      
      <CardFooter className="flex justify-between p-4">
        <div className="flex items-center gap-3">
          <Button 
            variant={isLiked ? "default" : "outline"} 
            size="sm"
            onClick={onLike}
            className={isLiked ? "bg-crimson hover:bg-crimson/90" : ""}
          >
            <Heart className={`mr-1 h-4 w-4 ${isLiked ? "fill-white" : ""}`} />
            {mediaItem.likes}
          </Button>
          
          <Button 
            variant={isBookmarked ? "default" : "outline"} 
            size="sm"
            onClick={onBookmark}
            className={isBookmarked ? "bg-crimson hover:bg-crimson/90" : ""}
          >
            <BookmarkIcon className={`mr-1 h-4 w-4 ${isBookmarked ? "fill-white" : ""}`} />
            Bookmark
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-white/70 px-3 py-1 rounded-md border border-white/10 bg-black/20">
            <Eye className="h-4 w-4" />
            <span>{mediaItem.views}</span>
          </div>
          
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-black/90 border-white/10">
                {/* Add owner-specific actions here */}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default MediaViewer;
