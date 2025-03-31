
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface FollowButtonProps {
  profileId: string;
  onFollowChange?: (isFollowing: boolean) => void;
}

const FollowButton: React.FC<FollowButtonProps> = ({ profileId, onFollowChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.id === profileId) return;
    
    const checkFollowStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('followings')
          .select('*')
          .eq('follower_id', user.id)
          .eq('following_id', profileId)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          console.error('Error checking follow status:', error);
        }
        
        setIsFollowing(!!data);
      } catch (error) {
        console.error('Error in follow check:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkFollowStatus();
  }, [user, profileId]);

  const handleFollow = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to follow users',
        variant: 'destructive'
      });
      navigate('/auth');
      return;
    }
    
    if (user.id === profileId) {
      toast({
        title: 'Action not allowed',
        description: 'You cannot follow yourself',
        variant: 'destructive'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('followings')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profileId);
          
        if (error) throw error;
        
        setIsFollowing(false);
        toast({
          title: 'Unfollowed',
          description: 'You are no longer following this user',
        });
      } else {
        // Follow
        const { error } = await supabase
          .from('followings')
          .insert({
            follower_id: user.id,
            following_id: profileId
          });
          
        if (error) throw error;
        
        setIsFollowing(true);
        toast({
          title: 'Following',
          description: 'You are now following this user',
        });
      }
      
      if (onFollowChange) {
        onFollowChange(!isFollowing);
      }
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update follow status',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (user?.id === profileId) return null;
  
  return (
    <Button
      onClick={handleFollow}
      disabled={loading}
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      className={isFollowing ? "border-crimson text-crimson hover:bg-crimson/10" : "bg-crimson text-white hover:bg-crimson/90"}
    >
      {isFollowing ? (
        <>
          <X className="h-4 w-4 mr-2" />
          Unfollow
        </>
      ) : (
        <>
          <Plus className="h-4 w-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
};

export default FollowButton;
