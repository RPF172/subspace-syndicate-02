
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Eye, Clock, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type VideoCardProps = {
  video: {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string | null;
    video_url: string;
    user_id: string;
    created_at: string;
    views: number;
    likes: number;
    category: string;
    tags: string;
    duration: number;
    profile?: {
      username?: string;
      avatar_url?: string;
      bdsm_role?: string;
    };
  };
};

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const username = video.profile?.username || 'User';
  const avatarUrl = video.profile?.avatar_url;
  const bdsmRole = video.profile?.bdsm_role || 'Exploring';
  const formattedDate = formatDistanceToNow(new Date(video.created_at), { addSuffix: true });
  
  // Format duration (seconds to MM:SS)
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Extract tags from comma-separated string
  const tagsList = video.tags ? video.tags.split(',').slice(0, 3) : [];
  
  // Get category badge variant
  const getCategoryBadgeVariant = () => {
    switch(video.category) {
      case 'tutorial': return "secondary";
      case 'scene': return "destructive";
      case 'event': return "default";
      default: return "outline";
    }
  };

  return (
    <Link to={`/subspacetv/watch/${video.id}`}>
      <Card className="bg-black/20 border-white/10 backdrop-blur-md overflow-hidden hover:border-crimson/50 transition-all hover:shadow-lg hover:shadow-crimson/10">
        <div className="relative aspect-video">
          {video.thumbnail_url ? (
            <img
              src={video.thumbnail_url}
              alt={video.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-black/50 flex items-center justify-center">
              <span className="text-white/30">No thumbnail</span>
            </div>
          )}
          
          {/* Duration badge */}
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            <Clock className="inline-block h-3 w-3 mr-1" />
            {formatDuration(video.duration || 0)}
          </div>
          
          {/* Category badge */}
          <Badge 
            className="absolute top-2 left-2" 
            variant={getCategoryBadgeVariant()}
          >
            {video.category.charAt(0).toUpperCase() + video.category.slice(1)}
          </Badge>
        </div>
        
        <CardContent className="p-3">
          <h3 className="font-medium text-white line-clamp-1">{video.title}</h3>
          <div className="flex items-center gap-2 mt-2">
            <Avatar className="h-6 w-6 border border-crimson/30">
              <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={username} />
              <AvatarFallback className="bg-crimson/20 text-white text-xs">
                {username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-white/60 text-sm">{username}</span>
          </div>
        </CardContent>
        
        <CardFooter className="p-3 pt-0 flex justify-between items-center">
          <div className="flex gap-3 text-white/50 text-xs">
            <span><Eye className="inline-block h-3 w-3 mr-1" />{video.views}</span>
            <span><Heart className="inline-block h-3 w-3 mr-1" />{video.likes}</span>
          </div>
          <span className="text-white/50 text-xs">{formattedDate}</span>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default VideoCard;
