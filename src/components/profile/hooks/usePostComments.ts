
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Comment } from '../post/CommentsList';

interface UsePostCommentsProps {
  postId: string;
  userId?: string;
}

export const usePostComments = ({ postId, userId }: UsePostCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);

  // Load comments on initial render
  useEffect(() => {
    loadComments();
  }, [postId, userId]);

  // Load comments safely handling missing tables
  const loadComments = async () => {
    if (!userId) return;
    
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          post_id,
          parent_id,
          profiles(username, avatar_url, bdsm_role)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
        
      if (error) {
        console.error('Error loading comments:', error.message);
        setComments([]);
        return;
      }
      
      const transformedComments = data.map((comment: any) => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        user_id: comment.user_id,
        post_id: comment.post_id,
        parent_id: comment.parent_id,
        username: comment.profiles?.username,
        avatar_url: comment.profiles?.avatar_url,
        bdsm_role: comment.profiles?.bdsm_role
      }));
      
      setComments(transformedComments);
    } catch (error: any) {
      console.error('Error loading comments:', error.message);
      toast({
        title: 'Error loading comments',
        description: error.message,
        variant: 'destructive',
      });
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  // Submit a new comment
  const submitComment = async (content: string) => {
    if (!userId) return;

    try {
      const { data: newComment, error } = await supabase
        .from('comments')
        .insert([
          { 
            content,
            user_id: userId,
            post_id: postId,
            parent_id: null 
          }
        ])
        .select()
        .single();
        
      if (error) throw error;
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username, avatar_url, bdsm_role')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        console.error('Error fetching profile:', profileError.message);
      }
      
      const commentWithProfile = {
        ...newComment,
        username: profileData?.username,
        avatar_url: profileData?.avatar_url,
        bdsm_role: profileData?.bdsm_role
      };
      
      setComments(prev => [...prev, commentWithProfile]);
      
      toast({
        title: 'Comment added',
        description: 'Your comment has been posted successfully.',
      });
    } catch (error: any) {
      console.error('Error submitting comment:', error.message);
      toast({
        title: 'Error submitting comment',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Reply to a comment (adding a nested comment)
  const replyToComment = async (content: string, parentId: string | null) => {
    if (!userId) return;

    try {
      const { data: newReply, error } = await supabase
        .from('comments')
        .insert([
          { 
            content,
            user_id: userId,
            post_id: postId,
            parent_id: parentId 
          }
        ])
        .select()
        .single();
        
      if (error) throw error;
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username, avatar_url, bdsm_role')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        console.error('Error fetching profile:', profileError.message);
      }
      
      const replyWithProfile = {
        ...newReply,
        username: profileData?.username,
        avatar_url: profileData?.avatar_url,
        bdsm_role: profileData?.bdsm_role
      };
      
      setComments(prev => [...prev, replyWithProfile]);
      
      toast({
        title: 'Reply added',
        description: 'Your reply has been posted successfully.',
      });
    } catch (error: any) {
      console.error('Error submitting reply:', error.message);
      toast({
        title: 'Error submitting reply',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Toggle showing all comments
  const toggleShowAllComments = () => {
    setShowAllComments(!showAllComments);
  };

  return {
    comments,
    loadingComments,
    showAllComments,
    toggleShowAllComments,
    submitComment,
    replyToComment
  };
};
