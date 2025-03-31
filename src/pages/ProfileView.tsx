
import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import UserProfileView from '@/components/UserProfileView';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

const ProfileView = () => {
  const { username } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Query to get the profile by username
  const { data: profileData, isLoading: profileLoading, error } = useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      if (!username) throw new Error('Username is required');
      
      // Find the profile by username
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();
        
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }
      
      if (!profile) {
        throw new Error('Profile not found');
      }
      
      return profile;
    }
  });
  
  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Profile not found",
        description: "The user profile you're looking for doesn't exist or is private.",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-abyss via-abyss/95 to-abyss flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crimson"></div>
      </div>
    );
  }

  if (error || !profileData) {
    // Redirect to 404 if profile not found
    return <Navigate to="/not-found" />;
  }

  return (
    user ? (
      <AuthenticatedLayout>
        <UserProfileView profileId={profileData.id} profile={profileData} />
      </AuthenticatedLayout>
    ) : (
      <div className="min-h-screen bg-gradient-to-b from-abyss via-abyss/95 to-abyss">
        <div className="container mx-auto px-4 py-6">
          <UserProfileView profileId={profileData.id} profile={profileData} />
        </div>
      </div>
    )
  );
};

export default ProfileView;
