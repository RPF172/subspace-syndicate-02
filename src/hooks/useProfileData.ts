
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ProfileData {
  id: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  bdsm_role: string;
  location: string | null;
  birthday: string | null;
  orientation: string | null;
  created_at: string | null;
  last_active: string | null;
  visibility: string | null;
  media_visibility: string | null;
  allow_messages: boolean | null;
  username_normalized?: string;
  user_role?: string;
  show_online_status?: boolean;
  looking_for: string | null;
  kinks: string | null;
  soft_limits: string | null;
  hard_limits: string | null;
}

export const useProfileData = (userId: string | undefined) => {
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<Partial<ProfileData>>({
    looking_for: '',
    kinks: '',
    soft_limits: '',
    hard_limits: '',
    banner_url: null,
  });
  
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [orientation, setOrientation] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [bdsmRole, setBdsmRole] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [kinks, setKinks] = useState('');
  const [softLimits, setSoftLimits] = useState('');
  const [hardLimits, setHardLimits] = useState('');
  
  const fetchProfileData = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        const safeData: ProfileData = {
          ...data,
          looking_for: data.looking_for ?? '',
          kinks: data.kinks ?? '',
          soft_limits: data.soft_limits ?? '',
          hard_limits: data.hard_limits ?? '',
          banner_url: data.banner_url ?? null,
        };
        
        setProfileData(safeData);
        setUsername(safeData.username || '');
        setBio(safeData.bio || '');
        setLocation(safeData.location || '');
        setOrientation(safeData.orientation || '');
        setVisibility(safeData.visibility || 'public');
        setBdsmRole(safeData.bdsm_role || '');
        setLookingFor(safeData.looking_for || '');
        setKinks(safeData.kinks || '');
        setSoftLimits(safeData.soft_limits || '');
        setHardLimits(safeData.hard_limits || '');
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error.message);
    }
  };
  
  const updateProfile = async () => {
    if (!userId) return;
    
    setLoading(true);
    
    try {
      const updates = {
        username,
        bio,
        location,
        orientation,
        visibility,
        bdsm_role: bdsmRole,
        looking_for: lookingFor,
        kinks: kinks,
        soft_limits: softLimits,
        hard_limits: hardLimits,
        banner_url: profileData.banner_url,
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
        
      if (error) throw error;
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      
      await fetchProfileData();
      
    } catch (error: any) {
      toast({
        title: 'Error updating profile',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return {
    loading,
    profileData,
    setProfileData,
    username,
    setUsername,
    bio,
    setBio,
    location,
    setLocation,
    orientation,
    setOrientation,
    visibility,
    setVisibility,
    bdsmRole,
    setBdsmRole,
    lookingFor,
    setLookingFor,
    kinks,
    setKinks,
    softLimits,
    setSoftLimits,
    hardLimits,
    setHardLimits,
    fetchProfileData,
    updateProfile
  };
};
