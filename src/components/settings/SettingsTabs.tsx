
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import ProfileSettings from './ProfileSettings';
import AccountSettings from './AccountSettings';
import PrivacySettings from './PrivacySettings';
import CreatorApplication from './creator-application/CreatorApplication';

const SettingsTabs = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crimson"></div>
      </div>
    );
  }
  
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid grid-cols-4 mb-6 bg-black/20 border border-white/10">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="privacy">Privacy</TabsTrigger>
        <TabsTrigger value="creator">Become a Creator</TabsTrigger>
      </TabsList>
      
      <TabsContent value="profile">
        <Card className="bg-black/20 border-white/10 backdrop-blur-md p-6">
          <ProfileSettings />
        </Card>
      </TabsContent>
      
      <TabsContent value="account">
        <Card className="bg-black/20 border-white/10 backdrop-blur-md p-6">
          <AccountSettings />
        </Card>
      </TabsContent>
      
      <TabsContent value="privacy">
        <Card className="bg-black/20 border-white/10 backdrop-blur-md p-6">
          <PrivacySettings />
        </Card>
      </TabsContent>
      
      <TabsContent value="creator">
        <Card className="bg-black/20 border-white/10 backdrop-blur-md p-6">
          <CreatorApplication />
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default SettingsTabs;
