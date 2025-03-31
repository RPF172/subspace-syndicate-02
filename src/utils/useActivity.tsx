import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const ACTIVITY_TIMEOUT = 60 * 1000; // 1 minute of inactivity will mark user as offline

export const useActivity = () => {
  const { user } = useAuth();
  
  const updateUserActivity = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      await supabase
        .from('profiles')
        .update({ last_active: new Date().toISOString() })
        .eq('id', user.id);
    } catch (error) {
      console.error('Error updating user activity:', error);
    }
  }, [user]);
  
  useEffect(() => {
    if (!user?.id) return;
    
    // Update user activity when component mounts
    updateUserActivity();
    
    // Add event listeners to track user activity
    const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    let activityTimeout: number | null = null;
    
    const handleActivity = () => {
      if (activityTimeout) {
        window.clearTimeout(activityTimeout);
      }
      
      activityTimeout = window.setTimeout(() => {
        updateUserActivity();
      }, ACTIVITY_TIMEOUT);
    };
    
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });
    
    // Set up interval to keep online status active
    const interval = setInterval(updateUserActivity, ACTIVITY_TIMEOUT);
    
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      
      if (activityTimeout) {
        window.clearTimeout(activityTimeout);
      }
      
      clearInterval(interval);
    };
  }, [user, updateUserActivity]);
};
