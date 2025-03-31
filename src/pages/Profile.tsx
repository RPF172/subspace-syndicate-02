import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import UserProfile from '@/components/UserProfile';
import { supabase } from '@/integrations/supabase/client';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    
    if (user?.id) {
      // Fetch username to redirect to the new URL structure
      const fetchUsername = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
          
        if (!error && data && data.username) {
          setUsername(data.username);
          // Redirect to /profile/username
          navigate(`/profile/${data.username}`);
        } else {
          // If username not found, just render normally
          setIsLoaded(true);
        }
      };
      
      fetchUsername();
    } else {
      setIsLoaded(true);
    }
  }, [user, loading, navigate]);

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-abyss via-abyss/95 to-abyss flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crimson"></div>
      </div>
    );
  }

  return (
    <AuthenticatedLayout>
      <UserProfile />
    </AuthenticatedLayout>
  );
};

export default Profile;
