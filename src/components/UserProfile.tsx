
import React from 'react';
import ProfileHeader from './ProfileHeader';
import ProfileTabs from './ProfileTabs';

const UserProfile = () => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <ProfileHeader />
      <ProfileTabs />
    </div>
  );
};

export default UserProfile;
