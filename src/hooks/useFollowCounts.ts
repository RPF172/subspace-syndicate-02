
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseFollowCountsResult {
  followerCount: number;
  followingCount: number;
  loading: boolean;
  error: string | null;
  refreshCounts: () => Promise<void>;
}

export const useFollowCounts = (profileId: string): UseFollowCountsResult => {
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCounts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get follower count (people following this profile)
      const { count: followers, error: followersError } = await supabase
        .from('followings')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profileId);
        
      if (followersError) throw followersError;
      
      // Get following count (profiles this user is following)
      const { count: following, error: followingError } = await supabase
        .from('followings')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profileId);
        
      if (followingError) throw followingError;
      
      setFollowerCount(followers || 0);
      setFollowingCount(following || 0);
    } catch (err: any) {
      console.error('Error fetching follow counts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (profileId) {
      fetchCounts();
    }
    
    // Setup real-time subscription for follow counts
    const channel = supabase
      .channel(`follow-counts-${profileId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'followings',
          filter: `follower_id=eq.${profileId}`,
        }, 
        () => fetchCounts()
      )
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'followings',
          filter: `following_id=eq.${profileId}`,
        }, 
        () => fetchCounts()
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId]);

  return {
    followerCount,
    followingCount,
    loading,
    error,
    refreshCounts: fetchCounts
  };
};
