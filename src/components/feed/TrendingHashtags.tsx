import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Hash, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface TrendingHashtag {
  hashtag: string;
  count: number;
}

export default function TrendingHashtags() {
  const [hashtags, setHashtags] = useState<TrendingHashtag[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchTrendingHashtags();
    
    // Refresh trending hashtags every 5 minutes
    const interval = setInterval(() => {
      fetchTrendingHashtags();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const fetchTrendingHashtags = async () => {
    setLoading(true);
    try {
      // Query to get hashtag counts - use SQL query instead of group()
      const { data, error } = await supabase
        .from('trending_hashtags')
        .select('hashtag, post_count')
        .order('post_count', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      // Transform data for our component
      const formattedHashtags = data.map(item => ({
        hashtag: item.hashtag,
        count: item.post_count
      }));
      
      setHashtags(formattedHashtags);
    } catch (error) {
      console.error('Error fetching trending hashtags:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="bg-black/30 border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-blue-400" />
          Trending Hashtags
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-10" />
              </div>
            ))}
          </div>
        ) : hashtags.length === 0 ? (
          <div className="text-gray-400 text-sm py-2">
            No trending hashtags yet.
          </div>
        ) : (
          <div className="space-y-3">
            {hashtags.map((tag) => (
              <div key={tag.hashtag} className="flex items-center justify-between group">
                <Link 
                  to={`/hashtag/${tag.hashtag}`}
                  className="flex items-center hover:text-blue-400 transition-colors"
                >
                  <Hash className="h-4 w-4 mr-1.5 text-blue-400" />
                  <span className="text-sm font-medium">{tag.hashtag}</span>
                </Link>
                <Badge 
                  variant="outline" 
                  className="bg-blue-900/20 text-blue-300 border-blue-800/30 text-xs"
                >
                  {tag.count} {tag.count === 1 ? 'post' : 'posts'}
                </Badge>
              </div>
            ))}
            
            <div className="pt-2">
              <Link 
                to="/explore/hashtags" 
                className="text-xs text-blue-400 hover:underline"
              >
                View all hashtags
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
