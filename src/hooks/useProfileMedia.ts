
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UseProfileMediaProps {
  userId: string | undefined;
}

export const useProfileMedia = ({ userId }: UseProfileMediaProps) => {
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [bannerLoading, setBannerLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [bucketError, setBucketError] = useState<string | null>(null);
  
  const handleAvatarChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setAvatarFile(file);
    
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
  };
  
  const handleBannerChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setBannerFile(file);
    
    const objectUrl = URL.createObjectURL(file);
    setBannerPreview(objectUrl);
  };
  
  const uploadAvatar = async () => {
    if (!avatarFile || !userId) return;
    
    setAvatarLoading(true);
    setBucketError(null);
    
    try {
      // Using the media bucket instead of avatars
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `avatars/${userId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, avatarFile);
        
      if (uploadError) throw uploadError;
      
      const { data: publicUrlData } = await supabase.storage
        .from('media')
        .getPublicUrl(fileName);
        
      const avatarUrl = publicUrlData.publicUrl;
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', userId);
        
      if (updateError) throw updateError;
      
      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been updated.',
      });
      
      setAvatarFile(null);
      
      return avatarUrl;
      
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      if (error.message.includes("bucket") || error.message.includes("storage")) {
        setBucketError(error.message);
      }
      toast({
        title: 'Error updating avatar',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setAvatarLoading(false);
    }
  };
  
  const cancelAvatarUpload = () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(null);
    setAvatarPreview('');
  };
  
  const uploadBanner = async () => {
    if (!bannerFile || !userId) return;
    
    setBannerLoading(true);
    setBucketError(null);
    
    try {
      // Using the media bucket instead of avatars
      const fileExt = bannerFile.name.split('.').pop();
      const fileName = `banners/${userId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, bannerFile);
        
      if (uploadError) throw uploadError;
      
      const { data: publicUrlData } = await supabase.storage
        .from('media')
        .getPublicUrl(fileName);
        
      const bannerUrl = publicUrlData.publicUrl;
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ banner_url: bannerUrl })
        .eq('id', userId);
        
      if (updateError) throw updateError;
      
      toast({
        title: 'Banner updated',
        description: 'Your profile banner has been updated.',
      });
      
      setBannerFile(null);
      
      return bannerUrl;
      
    } catch (error: any) {
      console.error('Banner upload error:', error);
      if (error.message.includes("bucket") || error.message.includes("storage")) {
        setBucketError(error.message);
      }
      toast({
        title: 'Error updating banner',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setBannerLoading(false);
    }
  };
  
  const cancelBannerUpload = () => {
    if (bannerPreview) {
      URL.revokeObjectURL(bannerPreview);
    }
    setBannerFile(null);
    setBannerPreview('');
  };
  
  return {
    avatarLoading,
    bannerLoading,
    avatarFile,
    setAvatarFile,
    avatarPreview,
    setAvatarPreview,
    bannerFile,
    setBannerFile,
    bannerPreview,
    setBannerPreview,
    bucketError,
    setBucketError,
    handleAvatarChange,
    handleBannerChange,
    uploadAvatar,
    cancelAvatarUpload,
    uploadBanner,
    cancelBannerUpload
  };
};
