
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Heart, Image, Film } from 'lucide-react';

interface Activity {
  id: string;
  type: 'post' | 'comment' | 'like' | 'media' | 'video';
  content?: string;
  created_at: string;
  reference_id?: string;
}

const ActivityTab: React.FC<{ userId?: string }> = ({ userId }) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  
  const profileId = userId || user?.id;
  
  useEffect(() => {
    if (profileId) {
      const fetchActivities = async () => {
        setLoading(true);
        
        // For now, we'll fetch posts as activities
        // In a real app, you'd have a dedicated activities table
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', profileId)
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (error) {
          console.error('Error fetching activities:', error);
          setLoading(false);
          return;
        }
        
        // Convert posts to activity format
        const formattedActivities: Activity[] = data.map(post => ({
          id: post.id,
          type: post.media_url ? (post.media_type === 'video' ? 'video' : 'media') : 'post',
          content: post.content,
          created_at: post.created_at,
          reference_id: post.id
        }));
        
        setActivities(formattedActivities);
        setLoading(false);
      };
      
      fetchActivities();
    }
  }, [profileId]);
  
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'post':
        return <MessageCircle className="h-5 w-5 text-crimson" />;
      case 'like':
        return <Heart className="h-5 w-5 text-crimson" />;
      case 'media':
        return <Image className="h-5 w-5 text-crimson" />;
      case 'video':
        return <Film className="h-5 w-5 text-crimson" />;
      default:
        return <MessageCircle className="h-5 w-5 text-crimson" />;
    }
  };
  
  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'post':
        return 'posted an update';
      case 'comment':
        return 'commented on a post';
      case 'like':
        return 'liked a post';
      case 'media':
        return 'shared a photo';
      case 'video':
        return 'shared a video';
      default:
        return 'did something';
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crimson"></div>
      </div>
    );
  }
  
  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60">No recent activity to display.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {activities.map(activity => (
        <Card key={activity.id} className="bg-black/20 border-white/10 backdrop-blur-md p-4">
          <div className="flex items-start gap-4">
            <div className="mt-1">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium text-white">
                  {getActivityText(activity)}
                </p>
                <p className="text-sm text-white/50">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>
              </div>
              
              {activity.content && (
                <p className="mt-2 text-white/80 break-words">
                  {activity.content.length > 150 
                    ? `${activity.content.substring(0, 150)}...` 
                    : activity.content}
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ActivityTab;
