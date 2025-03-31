import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MediaComment } from '@/types/albums';
import { formatDistanceToNow } from 'date-fns';
import { Send, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface MediaCommentsSectionProps {
  comments: MediaComment[];
  onAddComment: (content: string) => Promise<MediaComment | null>;
  onDeleteComment: (commentId: string) => Promise<boolean>;
  isLoading?: boolean;
}

interface UserMetadata {
  username?: string;
  avatar_url?: string;
}

const MAX_COMMENT_LENGTH = 1000;
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_COMMENTS_PER_WINDOW = 5;

const MediaCommentsSection: React.FC<MediaCommentsSectionProps> = ({
  comments,
  onAddComment,
  onDeleteComment,
  isLoading = false
}) => {
  const { user } = useAuth();
  const userMetadata = user?.user_metadata as UserMetadata | undefined;
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimisticComments, setOptimisticComments] = useState<MediaComment[]>(comments);
  const [commentCount, setCommentCount] = useState(0);
  const [lastCommentTime, setLastCommentTime] = useState<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update optimistic comments when real comments change
  useEffect(() => {
    setOptimisticComments(comments);
  }, [comments]);

  // Reset comment count when window expires
  useEffect(() => {
    const now = Date.now();
    if (now - lastCommentTime > RATE_LIMIT_WINDOW) {
      setCommentCount(0);
    }
  }, [lastCommentTime]);

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_COMMENT_LENGTH) {
      setNewComment(value);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || isSubmitting) return;

    // Check rate limit
    const now = Date.now();
    if (now - lastCommentTime <= RATE_LIMIT_WINDOW && commentCount >= MAX_COMMENTS_PER_WINDOW) {
      setError(`Please wait ${Math.ceil((RATE_LIMIT_WINDOW - (now - lastCommentTime)) / 1000)} seconds before posting another comment.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Create optimistic comment
    const optimisticComment: MediaComment = {
      id: `temp-${Date.now()}`,
      media_id: '', // This will be set by the server
      user_id: user.id,
      content: newComment.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profile: {
        username: userMetadata?.username || 'User',
        avatar_url: userMetadata?.avatar_url
      }
    };

    // Add optimistic comment
    setOptimisticComments(prev => [optimisticComment, ...prev]);
    setNewComment('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }

    try {
      const result = await onAddComment(newComment.trim());
      if (!result) {
        throw new Error('Failed to add comment');
      }

      // Update last comment time and count
      setLastCommentTime(now);
      setCommentCount(prev => prev + 1);
    } catch (err) {
      // Remove optimistic comment on error
      setOptimisticComments(prev => prev.filter(c => c.id !== optimisticComment.id));
      setError(err instanceof Error ? err.message : 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const success = await onDeleteComment(commentId);
      if (!success) {
        throw new Error('Failed to delete comment');
      }

      // Remove comment from optimistic state
      setOptimisticComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Comments</h3>
      
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="h-4 w-4" />
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-white/30" />
          </div>
        ) : optimisticComments.length === 0 ? (
          <p className="text-white/60 text-center py-4">No comments yet</p>
        ) : (
          optimisticComments.map((comment, index) => (
            <div key={comment.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <Avatar className="h-12 w-12 mb-1">
                  <AvatarImage src={comment.profile?.avatar_url} />
                  <AvatarFallback>
                    {comment.profile?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-white/60 max-w-[100px] truncate">
                  {comment.profile?.username || 'User'}
                </span>
              </div>
              
              <div className="flex-1">
                <div 
                  className={`relative p-4 rounded-2xl ${
                    index % 2 === 0 ? 'bg-black/20' : 'bg-black/30'
                  }`}
                >
                  {/* Chat bubble tail */}
                  <div 
                    className={`absolute left-0 top-4 -translate-x-2 w-4 h-4 ${
                      index % 2 === 0 ? 'bg-black/20' : 'bg-black/30'
                    }`}
                    style={{
                      clipPath: 'polygon(0 0, 100% 0, 0 100%)'
                    }}
                  />
                  
                  <div className="space-y-2">
                    <p className="text-sm">{comment.content}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/60">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                      
                      {user && user.id === comment.user_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={isSubmitting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {user && (
        <form onSubmit={handleSubmit} className="space-y-2 mt-6">
          <Textarea
            ref={textareaRef}
            value={newComment}
            onChange={handleCommentChange}
            placeholder="Add a comment..."
            className="bg-black/30 border-white/20 min-h-[100px]"
            disabled={isSubmitting}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-white/60">
              {newComment.length}/{MAX_COMMENT_LENGTH} characters
            </span>
            <Button 
              type="submit" 
              disabled={!newComment.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Post Comment
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default MediaCommentsSection;
