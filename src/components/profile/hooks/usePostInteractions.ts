
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UsePostInteractionsProps {
  postId: string;
  userId?: string;
}

export const usePostInteractions = ({ postId, userId }: UsePostInteractionsProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loadingLikes, setLoadingLikes] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loadingBookmark, setLoadingBookmark] = useState(false);
  const [isReposted, setIsReposted] = useState(false);

  // Initialize data
  useEffect(() => {
    if (userId) {
      checkIfLiked();
      fetchLikeCount();
      checkIfBookmarked();
    }
  }, [postId, userId]);

  // Check if the user has liked the post
  const checkIfLiked = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking if liked:', error.message);
        return;
      }
      
      setIsLiked(!!data);
    } catch (error: any) {
      console.error('Error checking if liked:', error.message);
    }
  };

  // Get the number of likes for the post
  const fetchLikeCount = async () => {
    setLoadingLikes(true);
    try {
      const { count, error } = await supabase
        .from('post_likes')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', postId);
        
      if (error) throw error;
      
      setLikeCount(count || 0);
    } catch (error: any) {
      console.error('Error fetching like count:', error.message);
    } finally {
      setLoadingLikes(false);
    }
  };

  // Like or unlike the post
  const toggleLike = async () => {
    if (!userId) return;

    setLoadingLikes(true);
    try {
      if (isLiked) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);
          
        if (error) throw error;
        
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert([
            { post_id: postId, user_id: userId }
          ]);
          
        if (error) throw error;
        
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error: any) {
      console.error('Error toggling like:', error.message);
      toast({
        title: 'Error toggling like',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoadingLikes(false);
    }
  };

  // Check if the user has bookmarked the post
  const checkIfBookmarked = async () => {
    if (!userId) return;

    setLoadingBookmark(true);
    try {
      setIsBookmarked(false);
    } catch (error: any) {
      console.error('Error checking if bookmarked:', error.message);
    } finally {
      setLoadingBookmark(false);
    }
  };

  // Bookmark or unbookmark the post
  const toggleBookmark = async () => {
    if (!userId) return;

    setLoadingBookmark(true);
    try {
      toast({
        title: 'Bookmarks feature coming soon',
        description: 'The ability to bookmark posts is not yet implemented.',
      });
      
      setIsBookmarked(!isBookmarked);
    } catch (error: any) {
      console.error('Error toggling bookmark:', error.message);
      toast({
        title: 'Error toggling bookmark',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoadingBookmark(false);
    }
  };

  // Handle repost action
  const handleRepost = () => {
    setIsReposted(!isReposted);
    toast({
      title: isReposted ? 'Repost removed' : 'Post reposted',
      description: isReposted 
        ? 'Your repost has been removed.'
        : 'You reposted this post to your profile.',
    });
  };

  // Handle share action
  const handleShare = () => {
    toast({
      title: 'Share options',
      description: 'Share feature will be implemented soon.',
    });
  };

  return {
    isLiked,
    likeCount,
    loadingLikes,
    toggleLike,
    isBookmarked,
    loadingBookmark,
    toggleBookmark,
    isReposted,
    handleRepost,
    handleShare
  };
};
