import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Heart, MessageCircle, BookmarkIcon, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

// Types for the media content
type MediaType = 'image' | 'video' | 'gif';
interface MediaItem {
  url: string;
  type: MediaType;
  aspectRatio?: number;
  duration?: number;
}

// Interface for post statistics
interface PostStats {
  likes: number;
  comments: number;
  reposts: number;
  views: number;
}

// Main PostCard props
export interface PostCardProps {
  id: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
    verified?: boolean;
  };
  content: string;
  media?: MediaItem[];
  stats?: PostStats;
  timestamp: string | Date;
  isLiked?: boolean;
  isBookmarked?: boolean;
  isReposted?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onRepost?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  className?: string;
  showBorder?: boolean;
  showActions?: boolean;
  interactive?: boolean;
}
const PostCard: React.FC<PostCardProps> = ({
  id,
  author,
  content,
  media = [],
  stats = {
    likes: 0,
    comments: 0,
    reposts: 0,
    views: 0
  },
  timestamp,
  isLiked = false,
  isBookmarked = false,
  isReposted = false,
  onLike,
  onComment,
  onRepost,
  onShare,
  onBookmark,
  className,
  showBorder = true,
  showActions = true,
  interactive = true
}) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const hasMultipleMedia = media.length > 1;
  const formattedTime = timestamp instanceof Date ? formatDistanceToNow(timestamp, {
    addSuffix: true
  }) : formatDistanceToNow(new Date(timestamp), {
    addSuffix: true
  });

  // Media navigation handlers
  const goToPreviousMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex(prev => Math.max(0, prev - 1));
  };
  const goToNextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex(prev => Math.min(media.length - 1, prev + 1));
  };

  // Format numbers for display (e.g., 1200 -> 1.2K)
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  };
  return <Card variant="dark" elevated={interactive} interactive={interactive} className="rounded-lg bg-zinc-950">
      <div className="p-0.5 px-0 py-[4px]">
        {/* Post Header */}
        <div className="flex items-start gap-2 p-1">
          <Link to={`/profile/${author.username}`}>
            <Avatar className="h-9 w-9 rounded-full border border-white/10">
              <AvatarImage src={author.avatarUrl} alt={author.name} />
              <AvatarFallback className="bg-black/40 text-white">
                {author.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <Link to={`/profile/${author.username}`} className="font-bold text-white hover:underline">
                {author.name}
              </Link>
              {/* Removed the @username display */}
              {author.verified && <Badge variant="default" className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center p-0 ml-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </Badge>}
              <span className="text-white/50">·</span>
              <span className="text-white/50">{formattedTime}</span>
            </div>
            
            {/* Post Content */}
            <div className="mt-1 text-white whitespace-pre-wrap break-words">
              {content}
            </div>
          </div>
          
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-white/50 hover:text-white hover:bg-black/30">
            <MoreHorizontal size={16} />
          </Button>
        </div>
        
        {/* Media Content - Improved display */}
        {media.length > 0 && <div className="relative overflow-hidden bg-black/20 w-full">
            {media[currentMediaIndex].type === 'image' ? <div className="w-full flex justify-center">
                <img src={media[currentMediaIndex].url} alt="Post media" className="w-full object-contain max-h-[600px]" loading="lazy" />
              </div> : media[currentMediaIndex].type === 'video' ? <video src={media[currentMediaIndex].url} controls preload="metadata" className="w-full max-h-[600px] object-contain rounded-3xl bg-transparent" /> : <img src={media[currentMediaIndex].url} alt="GIF" className="w-full max-h-[600px] object-contain" loading="lazy" />}
            
            {/* Media Navigation with improved styling */}
            {hasMultipleMedia && <>
                <div className="absolute top-1/2 left-2 transform -translate-y-1/2 flex">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-black/70 text-white hover:bg-black/90 disabled:opacity-30 shadow-lg" onClick={goToPreviousMedia} disabled={currentMediaIndex === 0}>
                    <ArrowLeft size={18} />
                  </Button>
                </div>
                <div className="absolute top-1/2 right-2 transform -translate-y-1/2 flex">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-black/70 text-white hover:bg-black/90 disabled:opacity-30 shadow-lg" onClick={goToNextMedia} disabled={currentMediaIndex === media.length - 1}>
                    <ArrowRight size={18} />
                  </Button>
                </div>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 bg-black/50 px-2 py-1 rounded-full">
                  {media.map((_, i) => <div key={i} className={cn("h-1.5 rounded-full transition-all duration-300", i === currentMediaIndex ? "w-6 bg-white" : "w-1.5 bg-white/50")} />)}
                </div>
              </>}
          </div>}
        
        {/* Post Actions */}
        {showActions && <div className="mt-1 flex justify-between items-center pr-8 p-1">
            <Button variant="ghost" size="sm" className="gap-1 text-white/50 hover:text-blue-400 hover:bg-blue-400/10 rounded-full p-2" onClick={onComment}>
              <MessageCircle size={16} />
              {stats.comments > 0 && <span className="text-xs">{formatNumber(stats.comments)}</span>}
            </Button>
            
            <Button variant="ghost" size="sm" className={cn("gap-1 hover:text-green-400 hover:bg-green-400/10 rounded-full p-2", isReposted ? "text-green-400" : "text-white/50")} onClick={onRepost}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={isReposted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 4-4 4 4" />
                <path d="M7 5v14" />
                <path d="m21 15-4 4-4-4" />
                <path d="M17 19V5" />
              </svg>
              {stats.reposts > 0 && <span className="text-xs">{formatNumber(stats.reposts)}</span>}
            </Button>
            
            <Button variant="ghost" size="sm" className={cn("gap-1 hover:text-pink-500 hover:bg-pink-500/10 rounded-full p-2", isLiked ? "text-pink-500" : "text-white/50")} onClick={onLike}>
              <Heart size={16} className={isLiked ? "fill-pink-500" : ""} />
              {stats.likes > 0 && <span className="text-xs">{formatNumber(stats.likes)}</span>}
            </Button>
            
            <Button variant="ghost" size="sm" className={cn("gap-1 hover:text-blue-400 hover:bg-blue-400/10 rounded-full p-2", isBookmarked ? "text-blue-400" : "text-white/50")} onClick={onBookmark}>
              <BookmarkIcon size={16} className={isBookmarked ? "fill-blue-400" : ""} />
            </Button>
            
            <Button variant="ghost" size="sm" className="text-white/50 hover:text-blue-400 hover:bg-blue-400/10 rounded-full p-2" onClick={onShare}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </Button>
          </div>}
      </div>
    </Card>;
};
export default PostCard;