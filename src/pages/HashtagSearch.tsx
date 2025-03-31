import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import PostItem from '@/components/profile/PostItem';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Users, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

interface ProfileData {
  username?: string;
  avatar_url?: string;
  bdsm_role?: string;
}

interface PostWithProfile {
  id: string;
  content: string;
  created_at: string | null;
  user_id: string;
  media_url: string | null;
  media_type: string | null;
  profiles?: ProfileData;
  username?: string;
  avatar_url?: string;
  bdsm_role?: string;
}

// Define the structure of what Supabase returns
interface SupabasePost {
  id: string;
  content: string;
  created_at: string | null;
  user_id: string;
  media_url: string | null;
  media_type: string | null;
  profiles?: {
    username?: string;
    avatar_url?: string;
    bdsm_role?: string;
  };
}

const HashtagSearch = () => {
  const { tag } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const decodedTag = tag ? decodeURIComponent(tag) : '';
  
  // Query to find posts with the hashtag
  const { 
    data: posts, 
    isLoading: postsLoading, 
    error: postsError 
  } = useQuery({
    queryKey: ['hashtag-posts', decodedTag],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            username, 
            avatar_url,
            bdsm_role
          )
        `)
        .ilike('content', `%#${decodedTag}%`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SupabasePost[] || [];
    },
    enabled: !!decodedTag
  });
  
  // Query to find users with the hashtag in their bio
  const { 
    data: users, 
    isLoading: usersLoading, 
    error: usersError 
  } = useQuery({
    queryKey: ['hashtag-users', decodedTag],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`bio.ilike.%#${decodedTag}%`)
        .order('username');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!decodedTag
  });
  
  // Handle errors
  useEffect(() => {
    if (postsError || usersError) {
      toast({
        title: "Error",
        description: "Failed to fetch hashtag results",
        variant: "destructive",
      });
    }
  }, [postsError, usersError, toast]);

  const hashtagContent = (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Badge variant="outline" className="bg-white/5 px-3 py-1 text-xl">
              #{decodedTag}
            </Badge>
          </h1>
          <p className="text-white/70 mt-2">Results for posts and users tagged with #{decodedTag}</p>
        </div>
        
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <MessageSquare size={16} /> Posts
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users size={16} /> Users
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="space-y-6">
            {postsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-white/70" />
              </div>
            ) : posts && posts.length > 0 ? (
              posts.map((post) => (
                <PostItem 
                  key={post.id} 
                  post={{
                    ...post,
                    username: post.profiles?.username || 'User',
                    avatar_url: post.profiles?.avatar_url,
                    bdsm_role: post.profiles?.bdsm_role,
                  }} 
                />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-white/70">No posts found with #{decodedTag}</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            {usersLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-white/70" />
              </div>
            ) : users && users.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user) => (
                  <Card 
                    key={user.id} 
                    className="bg-black/20 border-white/10 backdrop-blur-md p-4 hover:bg-black/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/profile/${user.username}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-crimson flex items-center justify-center text-white font-bold">
                        {user.username ? user.username.substring(0, 2).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.username}</p>
                        <p className="text-white/60 text-sm">{user.bdsm_role}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-white/70">No users found with #{decodedTag} in their bio</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </>
  );

  if (!decodedTag) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-abyss via-abyss/95 to-abyss">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-white mb-4">Invalid Hashtag</h1>
            <p className="text-white/70 mb-6">No hashtag was specified</p>
          </div>
        </div>
      </div>
    );
  }

  return user ? (
    <AuthenticatedLayout pageTitle={`#${decodedTag}`}>
      {hashtagContent}
    </AuthenticatedLayout>
  ) : (
    <div className="min-h-screen bg-gradient-to-b from-abyss via-abyss/95 to-abyss">
      <div className="container mx-auto px-4 py-6">
        {hashtagContent}
      </div>
    </div>
  );
};

export default HashtagSearch;
