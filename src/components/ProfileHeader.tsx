import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

const ProfileHeader: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<any>(null);
  
  useEffect(() => {
    if (user?.id) {
      const fetchProfileData = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }
        
        if (data) {
          setProfileData(data);
        }
      };
      
      fetchProfileData();
    }
  }, [user]);
  
  const username = profileData?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';
  const orientation = profileData?.orientation || user?.user_metadata?.orientation;
  const location = profileData?.location || user?.user_metadata?.location;
  const avatarUrl = profileData?.avatar_url || user?.user_metadata?.avatar_url;
  const bannerUrl = profileData?.banner_url;
  
  const navigateToSettings = () => {
    navigate('/settings');
  };
  
  return (
    <div className="relative">
      {/* Banner Image */}
      <div className="relative w-full h-48 md:h-64 bg-gradient-to-r from-gray-800 to-abyss rounded-b-lg overflow-hidden">
        {bannerUrl ? (
          <div className="absolute inset-0 bg-cover bg-center" 
               style={{ backgroundImage: `url('${bannerUrl}')` }}>
          </div>
        ) : (
          <div className="absolute inset-0 bg-cover bg-center" 
               style={{ backgroundImage: "url('/placeholder.svg')" }}>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {/* Settings button */}
        {user && (
          <Button 
            onClick={navigateToSettings}
            className="absolute top-2 right-2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2"
            size="icon"
            variant="ghost"
          >
            <Settings size={18} />
          </Button>
        )}
      </div>
      
      {/* Avatar and basic info */}
      <div className="relative px-4 sm:px-6 -mt-12 flex flex-col items-center sm:items-start">
        <Avatar className="w-24 h-24 border-4 border-background shadow-md">
          <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={username} />
          <AvatarFallback className="bg-crimson text-white text-xl">
            {username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        {/* User info */}
        <div className="mt-4 w-full text-center sm:text-left">
          <h2 className="text-2xl font-bold text-white">{username}</h2>
          <p className="text-gray-400 mt-1">
            {orientation || 'No orientation set'} • {location || 'No location set'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
