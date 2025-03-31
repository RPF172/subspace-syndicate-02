
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useProfileData } from '@/hooks/useProfileData';
import { useProfileMedia } from '@/hooks/useProfileMedia';

// Import individual section components
import AvatarSection from './profile/AvatarSection';
import BannerSection from './profile/BannerSection';
import BasicInfoSection from './profile/BasicInfoSection';
import TextAreaSection from './profile/TextAreaSection';

const ProfileSettings = () => {
  const { user } = useAuth();
  
  const {
    loading,
    profileData,
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
  } = useProfileData(user?.id);
  
  const {
    avatarLoading,
    bannerLoading,
    avatarFile,
    avatarPreview,
    bannerFile,
    bannerPreview,
    bucketError,
    handleAvatarChange,
    handleBannerChange,
    uploadAvatar,
    cancelAvatarUpload,
    uploadBanner,
    cancelBannerUpload
  } = useProfileMedia({ userId: user?.id });
  
  useEffect(() => {
    if (user?.id) {
      fetchProfileData();
    }
  }, [user]);

  const initials = username
    ? username.substring(0, 2).toUpperCase()
    : user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Profile Settings</h2>
        <p className="text-gray-400 mb-6">Manage your profile information and visibility</p>
      </div>
      
      {bucketError && (
        <Alert variant="destructive" className="bg-red-900/30 border-red-700">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {bucketError}
          </AlertDescription>
        </Alert>
      )}
      
      <AvatarSection 
        avatarUrl={profileData.avatar_url || null}
        username={username}
        initials={initials}
        avatarPreview={avatarPreview}
        avatarFile={avatarFile}
        avatarLoading={avatarLoading}
        onAvatarSelect={handleAvatarChange}
        onUploadAvatar={uploadAvatar}
        onCancelAvatarUpload={cancelAvatarUpload}
      />
      
      <BannerSection 
        bannerUrl={profileData.banner_url || null}
        bannerPreview={bannerPreview}
        bannerFile={bannerFile}
        bannerLoading={bannerLoading}
        onBannerSelect={handleBannerChange}
        onUploadBanner={uploadBanner}
        onCancelBannerUpload={cancelBannerUpload}
      />
      
      <BasicInfoSection 
        username={username}
        setUsername={setUsername}
        location={location}
        setLocation={setLocation}
        orientation={orientation}
        setOrientation={setOrientation}
        bdsmRole={bdsmRole}
        setBdsmRole={setBdsmRole}
        visibility={visibility}
        setVisibility={setVisibility}
      />
      
      <TextAreaSection 
        title="Bio"
        description="Tell others about yourself"
        value={bio}
        onChange={setBio}
        placeholder="Write a short bio about yourself..."
      />
      
      <TextAreaSection 
        title="Looking For"
        description="Describe what you're seeking in a connection"
        value={lookingFor}
        onChange={setLookingFor}
        placeholder="What are you looking for on this platform?"
      />
      
      <TextAreaSection 
        title="Kinks/Fetishes"
        description="List your interests, kinks, and fetishes"
        value={kinks}
        onChange={setKinks}
        placeholder="List your kinks and fetishes..."
      />
      
      <TextAreaSection 
        title="Soft Limits"
        description="Activities you may consider under specific circumstances"
        value={softLimits}
        onChange={setSoftLimits}
        placeholder="List your soft limits..."
      />
      
      <TextAreaSection 
        title="Hard Limits"
        description="Activities you absolutely will not engage in"
        value={hardLimits}
        onChange={setHardLimits}
        placeholder="List your hard limits..."
      />
      
      <div className="flex justify-end">
        <Button 
          onClick={updateProfile} 
          className="bg-crimson hover:bg-crimson/90 text-white"
          disabled={loading}
        >
          {loading ? "Saving Changes..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default ProfileSettings;
