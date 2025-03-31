
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CardHeader } from '@/components/ui/card';

interface PostHeaderProps {
  post: {
    username?: string;
    avatar_url?: string;
    bdsm_role?: string;
    created_at: string | null;
  };
  isCurrentUser: boolean;
  onMenuToggle: () => void;
}

const PostHeader: React.FC<PostHeaderProps> = ({ post, isCurrentUser, onMenuToggle }) => {
  // Extract username or default to "Anonymous" for safety
  const username = post?.username || "Anonymous";
  
  return (
    <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
      <div className="flex items-center gap-3">
        <Link to={`/profile/${username}`}>
          <Avatar className="h-10 w-10 border-2 border-crimson/30">
            <AvatarImage src={post?.avatar_url || ""} alt={username} />
            <AvatarFallback className="bg-crimson/20 text-white">
              {username ? username.substring(0, 2).toUpperCase() : "AN"}
            </AvatarFallback>
          </Avatar>
        </Link>
        
        <div className="flex flex-col">
          <Link to={`/profile/${username}`} className="font-medium text-white hover:text-crimson">
            {username}
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-crimson/80">{post?.bdsm_role || "Exploring"}</span>
            <span className="text-xs text-white/50">
              {post?.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : "Recently"}
            </span>
          </div>
        </div>
      </div>
      
      {isCurrentUser && (
        <button 
          onClick={onMenuToggle}
          className="text-white/50 hover:text-white hover:bg-white/10 rounded-full p-1"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      )}
    </CardHeader>
  );
};

export default PostHeader;
