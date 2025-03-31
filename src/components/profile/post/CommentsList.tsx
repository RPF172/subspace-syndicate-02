
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { Loader2, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CommentForm from './CommentForm';

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  post_id: string;
  parent_id: string | null;
  username?: string;
  avatar_url?: string;
  bdsm_role?: string;
}

interface CommentsListProps {
  comments: Comment[];
  loading: boolean;
  showAllComments: boolean;
  toggleShowAllComments: () => void;
  onReply: (content: string, parentId: string | null) => Promise<void>;
}

const CommentItem = ({ 
  comment, 
  replies, 
  level = 0,
  onReply 
}: { 
  comment: Comment, 
  replies: Comment[], 
  level?: number,
  onReply: (content: string, parentId: string | null) => Promise<void>
}) => {
  const [showReplies, setShowReplies] = useState(true);
  const [replyFormVisible, setReplyFormVisible] = useState(false);
  const maxLevel = 3; // Maximum nesting level
  
  // Filter replies to this comment
  const commentReplies = replies.filter(reply => reply.parent_id === comment.id);
  
  const toggleReplies = () => setShowReplies(!showReplies);
  const toggleReplyForm = () => setReplyFormVisible(!replyFormVisible);
  
  const handleReply = async (content: string) => {
    await onReply(content, comment.id);
    setReplyFormVisible(false);
  };
  
  return (
    <div className={`pl-${level > 0 ? 4 : 0}`}>
      <div className="flex gap-2">
        <Link to={`/profile/${comment.username}`}>
          <Avatar className="h-7 w-7 border border-crimson/30">
            <AvatarImage src={comment.avatar_url || ""} alt={comment.username || "User"} />
            <AvatarFallback className="bg-crimson/20 text-white text-xs">
              {comment.username ? comment.username.substring(0, 2).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
        </Link>
        
        <div className="flex-1">
          <div className="bg-black/20 p-2 rounded-md">
            <div className="flex items-center gap-2">
              <Link to={`/profile/${comment.username}`} className="text-sm font-medium text-white hover:text-crimson">
                {comment.username || "Anonymous"}
              </Link>
              <span className="text-xs text-crimson/80">{comment.bdsm_role || "Exploring"}</span>
            </div>
            <p className="text-sm text-white/90 mt-1">{comment.content}</p>
          </div>
          <div className="flex items-center text-xs text-white/40 mt-1 gap-3">
            <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
            <button 
              onClick={toggleReplyForm} 
              className="text-crimson hover:underline flex items-center gap-1"
            >
              <MessageSquare size={12} />
              Reply
            </button>
            
            {commentReplies.length > 0 && (
              <button
                onClick={toggleReplies}
                className="flex items-center gap-1 text-white/50 hover:text-white"
              >
                {showReplies ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {commentReplies.length} {commentReplies.length === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>
          
          {replyFormVisible && (
            <div className="mt-2">
              <CommentForm onSubmit={handleReply} disabled={false} />
            </div>
          )}
        </div>
      </div>
      
      {/* Render replies with increased nesting level */}
      {showReplies && commentReplies.length > 0 && (
        <div className={`mt-3 space-y-3 border-l-2 border-crimson/10 pl-3 ml-3`}>
          {commentReplies.map(reply => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              replies={level < maxLevel ? replies : []} // Stop going deeper after max level
              level={level + 1}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentsList: React.FC<CommentsListProps> = ({ 
  comments, 
  loading, 
  showAllComments, 
  toggleShowAllComments,
  onReply
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 text-crimson animate-spin" />
      </div>
    );
  }
  
  if (comments.length === 0) {
    return <p className="text-white/50 text-sm p-4 text-center">No comments yet</p>;
  }
  
  // Get top-level comments
  const topLevelComments = comments.filter(comment => !comment.parent_id);
  
  // Display either all top level comments or just the most recent 2
  const displayComments = showAllComments ? topLevelComments : topLevelComments.slice(0, 2);
  
  return (
    <div className="px-4 py-2 space-y-4">
      {displayComments.map(comment => (
        <CommentItem 
          key={comment.id} 
          comment={comment} 
          replies={comments}
          onReply={onReply}
        />
      ))}
      
      {topLevelComments.length > 2 && (
        <Button
          onClick={toggleShowAllComments}
          variant="ghost"
          className="text-crimson hover:text-crimson hover:bg-crimson/10 w-full text-sm"
        >
          {showAllComments ? "Show fewer comments" : `Show all ${topLevelComments.length} comments`}
        </Button>
      )}
    </div>
  );
};

export default CommentsList;
