
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import PostItem from './PostItem';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, FileText } from 'lucide-react';

interface UserPostsListProps {
  userId: string;
}

const UserPostsList: React.FC<UserPostsListProps> = ({ userId }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        setLoading(true);
        
        // Fetch posts for specific user
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Get user profile for each post
        const postsWithUserInfo = await Promise.all(
          data.map(async (post) => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('username, bdsm_role, avatar_url')
              .eq('id', post.user_id)
              .single();
              
            return {
              ...post,
              username: profileData?.username,
              bdsm_role: profileData?.bdsm_role,
              avatar_url: profileData?.avatar_url,
            };
          })
        );
        
        setPosts(postsWithUserInfo);
      } catch (err: any) {
        console.error('Error fetching user posts:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserPosts();
    }

    // Set up real-time subscription for this user's posts
    const channel = supabase
      .channel(`user-posts-${userId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'posts',
          filter: `user_id=eq.${userId}`
        }, 
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // When a new post is inserted, fetch its profile data
            const { data: profileData } = await supabase
              .from('profiles')
              .select('username, bdsm_role, avatar_url')
              .eq('id', payload.new.user_id)
              .single();
                
            // Add the new post with profile data to the list
            setPosts(prevPosts => [{
              ...payload.new,
              username: profileData?.username,
              bdsm_role: profileData?.bdsm_role,
              avatar_url: profileData?.avatar_url,
            }, ...prevPosts]);
          } else if (payload.eventType === 'DELETE') {
            // Remove deleted post
            setPosts(prevPosts => prevPosts.filter(post => post.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            // Update modified post
            setPosts(prevPosts => prevPosts.map(post => 
              post.id === payload.new.id ? { ...post, ...payload.new } : post
            ));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (loading) {
    return (
      <Card className="bg-black/30 border-white/10 backdrop-blur-md shadow-lg shadow-crimson/5">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-10 w-10 text-crimson animate-spin mb-4" />
          <p className="text-white/70">Loading posts...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-black/30 border-white/10 backdrop-blur-md shadow-lg shadow-crimson/5">
        <CardContent className="flex flex-col items-center justify-center py-12 text-white/70">
          <p className="text-lg mb-2">😕 Something went wrong</p>
          <p className="text-sm text-white/50">Error loading posts: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="bg-black/30 border-white/10 backdrop-blur-md shadow-lg shadow-crimson/5">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-crimson/50" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Posts Yet</h3>
          <p className="text-white/70 text-center max-w-md">
            This user hasn't shared any posts yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <AnimatePresence>
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {posts.map((post) => (
          <PostItem key={post.id} post={post} />
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

export default UserPostsList;
