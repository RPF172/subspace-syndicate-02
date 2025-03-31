import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useInView } from '@/hooks/useInView';
import PostCard from '@/components/ui/PostCard';
import PostCreator from '@/components/feed/PostCreator';
import TrendingHashtags from '@/components/feed/TrendingHashtags';
import NotificationSettings from '@/components/feed/NotificationSettings';
import { toast } from '@/hooks/use-toast';

// Types for the database models
interface Post {
  id: string;
  content: string;
  media?: PostMedia[];
  hashtags?: string[];
  created_at: string;
  user_id: string;
  user: {
    username: string;
    name?: string;
    avatar_url?: string;
  };
  likes: number;
  comments: number;
  isLiked?: boolean;
}

interface PostMedia {
  id: string;
  url: string;
  type: 'image' | 'video' | 'gif';
  aspectRatio?: number;
  duration?: number;
}

interface ProfileData {
  username: string;
  avatar_url?: string;
}

const NewsFeed: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState<{
    allPosts: boolean;
    followedUsers: boolean;
    hashtags: string[];
  }>({
    allPosts: true,
    followedUsers: false,
    hashtags: [],
  });

  // State for the infinite scroll pagination
  const lastPostRef = useRef<string | null>(null);
  const loadingMoreRef = useRef<HTMLDivElement>(null);
  const isLoadingMoreVisible = useInView(loadingMoreRef);
  const scrollToTopRef = useRef<HTMLDivElement>(null);
  
  // Set up WebSocket for real-time updates
  useEffect(() => {
    // Initial fetch
    fetchPosts();
    
    // Set up WebSocket connection
    const channel = supabase
      .channel('feed-updates')
      .on('broadcast', { event: 'new-post' }, (payload) => {
        if (payload.new && shouldNotifyUser(payload.new)) {
          setNewPostsCount(prev => prev + 1);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  // Load more posts when user scrolls to the bottom
  useEffect(() => {
    if (isLoadingMoreVisible && !loading && !reachedEnd) {
      fetchMorePosts();
    }
  }, [isLoadingMoreVisible]);
  
  const shouldNotifyUser = (post: any) => {
    if (!post) return false;
    
    if (notificationPrefs.allPosts) return true;
    
    if (notificationPrefs.followedUsers && post.user_id) {
      // Check if this is a followed user
      // This requires a followed users table or implementation
      return false; // Placeholder
    }
    
    if (notificationPrefs.hashtags && notificationPrefs.hashtags.length > 0 && post.hashtags) {
      // Ensure hashtags on the post is an array
      const postHashtags = Array.isArray(post.hashtags) ? post.hashtags : [];
      
      // Check if any of the post's hashtags match the user's preferred hashtags
      return notificationPrefs.hashtags.some(tag => postHashtags.includes(tag));
    }
    
    return false;
  };
  
  const fetchPosts = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      // First fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (postsError) throw postsError;
      
      if (postsData && postsData.length > 0) {
        lastPostRef.current = postsData[postsData.length - 1].created_at;
        
        // For each post, fetch related data
        const transformedPosts = await Promise.all(postsData.map(async (post) => {
          // Fetch user profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', post.user_id)
            .single();
            
          // Fetch media
          const { data: mediaData } = await supabase
            .from('post_media')
            .select('*')
            .eq('post_id', post.id);
            
          // Fetch hashtags
          const { data: hashtagData } = await supabase
            .from('post_hashtags')
            .select('hashtag')
            .eq('post_id', post.id);
            
          // Fetch likes count
          const { count: likesCount } = await supabase
            .from('post_likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);
            
          // Transform media data to match PostMedia interface
          const media = mediaData ? mediaData.map(m => ({
            id: m.id,
            url: m.url,
            type: m.type as 'image' | 'video' | 'gif',
            aspectRatio: m.aspect_ratio,
            duration: m.duration
          })) : [];
            
          return {
            id: post.id,
            content: post.content,
            media,
            hashtags: hashtagData ? hashtagData.map(h => h.hashtag) : [],
            created_at: post.created_at,
            user_id: post.user_id,
            user: {
              username: profileData?.username || 'anonymous',
              avatar_url: profileData?.avatar_url
            },
            likes: likesCount || 0,
            comments: 0 // Implement comment count later
          };
        }));
        
        setPosts(transformedPosts);
      } else {
        setReachedEnd(true);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error loading feed",
        description: "Could not load posts at this time. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMorePosts = async () => {
    if (!lastPostRef.current || loading || reachedEnd) return;
    
    setLoading(true);
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          user_id
        `)
        .lt('created_at', lastPostRef.current)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (postsError) throw postsError;
      
      if (postsData && postsData.length > 0) {
        lastPostRef.current = postsData[postsData.length - 1].created_at;
        
        const transformedPosts = await Promise.all(postsData.map(async (post) => {
          // Fetch user profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', post.user_id)
            .single();
            
          // Fetch media
          const { data: mediaData } = await supabase
            .from('post_media')
            .select('*')
            .eq('post_id', post.id);
            
          // Fetch hashtags
          const { data: hashtagData } = await supabase
            .from('post_hashtags')
            .select('hashtag')
            .eq('post_id', post.id);
            
          // Fetch likes count
          const { count: likesCount } = await supabase
            .from('post_likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);
            
          // Transform media data to match PostMedia interface
          const media = mediaData ? mediaData.map(m => ({
            id: m.id,
            url: m.url,
            type: m.type as 'image' | 'video' | 'gif',
            aspectRatio: m.aspect_ratio,
            duration: m.duration
          })) : [];
            
          return {
            id: post.id,
            content: post.content,
            media,
            hashtags: hashtagData ? hashtagData.map(h => h.hashtag) : [],
            created_at: post.created_at,
            user_id: post.user_id,
            user: {
              username: profileData?.username || 'anonymous',
              avatar_url: profileData?.avatar_url
            },
            likes: likesCount || 0,
            comments: 0
          };
        }));
        
        setPosts(prev => [...prev, ...transformedPosts]);
      } else {
        setReachedEnd(true);
      }
    } catch (error) {
      console.error('Error fetching more posts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = () => {
    setNewPostsCount(0);
    fetchPosts();
  };
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  const handlePostCreated = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev]);
  };
  
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Main Feed Column */}
          <div className="w-full md:w-2/3 space-y-6">
            <h1 className="text-3xl font-bold text-white">News Feed</h1>
            
            {/* New posts notification banner */}
            {newPostsCount > 0 && (
              <Button 
                variant="outline" 
                className="w-full bg-blue-900/30 border-blue-500/30 hover:bg-blue-800/40 text-blue-300"
                onClick={handleRefresh}
              >
                <Loader2 className="mr-2 h-4 w-4" />
                {newPostsCount} New {newPostsCount === 1 ? 'Post' : 'Posts'} Available
              </Button>
            )}
            
            {/* Post Creator */}
            <PostCreator onPostCreated={handlePostCreated} />
            
            {/* Posts Feed */}
            <div className="space-y-4">
              {loading && posts.length === 0 ? (
                // Skeleton loading state
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-[200px] w-full rounded-md" />
                  </div>
                ))
              ) : posts.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-400">No posts yet. Be the first to post!</p>
                </div>
              ) : (
                posts.map(post => (
                  <PostCard
                    key={post.id}
                    id={post.id}
                    author={{
                      id: post.user_id,
                      name: post.user.name || post.user.username,
                      username: post.user.username,
                      avatarUrl: post.user.avatar_url,
                    }}
                    content={post.content}
                    media={post.media?.map(m => ({
                      url: m.url,
                      type: m.type,
                      aspectRatio: m.aspectRatio,
                      duration: m.duration
                    }))}
                    stats={{
                      likes: post.likes,
                      comments: post.comments,
                      reposts: 0,
                      views: 0
                    }}
                    timestamp={post.created_at}
                    isLiked={post.isLiked}
                  />
                ))
              )}
              
              {/* Loading more indicator */}
              {!reachedEnd && (
                <div ref={loadingMoreRef} className="py-4 text-center">
                  {loading && <Skeleton className="h-8 w-40 mx-auto" />}
                </div>
              )}
              
              {/* End of feed message */}
              {reachedEnd && posts.length > 0 && (
                <div className="text-center py-6">
                  <p className="text-gray-400">You've reached the end of your feed</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="w-full md:w-1/3 space-y-6">
            {/* Trending Hashtags */}
            <TrendingHashtags />
            
            {/* Notification Settings */}
            <NotificationSettings 
              preferences={notificationPrefs}
              onPreferencesChange={setNotificationPrefs}
            />
          </div>
        </div>
        
        {/* Scroll to top button */}
        <div 
          ref={scrollToTopRef} 
          className="fixed bottom-6 right-6 z-10"
        >
          <Button 
            variant="secondary" 
            size="icon" 
            className="rounded-full shadow-lg"
            onClick={scrollToTop}
          >
            <ChevronUp className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default NewsFeed;
