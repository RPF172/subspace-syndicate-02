
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { MediaComment } from '@/types/albums';

interface CommentsSectionProps {
  comments: MediaComment[] | undefined;
  onAddComment: (comment: string) => Promise<boolean>;
  onDeleteComment: (commentId: string) => Promise<void>;
  getUsername: (profile: any) => string;
  getAvatarUrl: (profile: any) => string | undefined;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ 
  comments, 
  onAddComment, 
  onDeleteComment,
  getUsername,
  getAvatarUrl
}) => {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) return;
    
    const success = await onAddComment(comment);
    if (success) {
      setComment('');
    }
  };
  
  return (
    <Card className="bg-black/20 border-white/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">Comments</h3>
          <div className="flex items-center text-sm text-white/60">
            <MessageSquare className="h-4 w-4 mr-1" />
            {comments?.length || 0}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {user ? (
          <form onSubmit={handleCommentSubmit} className="mb-4 flex gap-2">
            <Input
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="bg-black/30 border-white/10 text-white"
            />
            <Button type="submit" size="sm" disabled={!comment.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        ) : (
          <p className="text-white/60 text-sm mb-4">
            <Link to="/login" className="text-crimson hover:underline">Login</Link> to add a comment
          </p>
        )}
        
        {comments && comments.length > 0 ? (
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={getAvatarUrl(comment.profile)} />
                  <AvatarFallback className="bg-crimson/20 text-white">
                    {getUsername(comment.profile).substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Link to={`/profile/${getUsername(comment.profile)}`} className="font-medium text-white hover:text-crimson">
                        {getUsername(comment.profile)}
                      </Link>
                      <span className="text-xs text-white/50">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    {(user?.id === comment.user_id) && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-white/50 hover:text-white"
                        onClick={() => onDeleteComment(comment.id)}
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <p className="text-white/80 text-sm mt-1">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/50 text-center py-4">No comments yet</p>
        )}
      </CardContent>
    </Card>
  );
};

export default CommentsSection;
