
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageSquare, BookmarkIcon, Share } from 'lucide-react';

interface PostActionsProps {
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  loadingLikes: boolean;
  loadingBookmark: boolean;
  showComments?: boolean;
  onToggleLike: () => void;
  onToggleBookmark: () => void;
  onToggleComments: () => void;
}

const PostActions: React.FC<PostActionsProps> = ({
  likeCount,
  commentCount,
  isLiked,
  isBookmarked,
  loadingLikes,
  loadingBookmark,
  showComments,
  onToggleLike,
  onToggleBookmark,
  onToggleComments
}) => {
  return (
    <div className="flex justify-between px-4 pt-2 pb-3 border-t border-white/10">
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          className={`gap-2 text-sm ${isLiked ? 'text-crimson hover:text-crimson/80' : 'text-white/70 hover:text-white'}`}
          onClick={onToggleLike}
          disabled={loadingLikes}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-crimson' : ''}`} />
          {likeCount > 0 && <span>{likeCount}</span>}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className={`gap-2 text-sm text-white/70 hover:text-white ${showComments ? 'text-crimson' : ''}`}
          onClick={onToggleComments}
        >
          <MessageSquare className="h-4 w-4" />
          {commentCount > 0 && <span>{commentCount}</span>}
        </Button>
      </div>
      
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          className={`text-sm ${isBookmarked ? 'text-crimson hover:text-crimson/80' : 'text-white/70 hover:text-white'}`}
          onClick={onToggleBookmark}
          disabled={loadingBookmark}
        >
          <BookmarkIcon className={`h-4 w-4 ${isBookmarked ? 'fill-crimson' : ''}`} />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="text-sm text-white/70 hover:text-white"
        >
          <Share className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PostActions;
