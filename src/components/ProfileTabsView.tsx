
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserPostsList from '@/components/profile/UserPostsList';
import ActivityTab from '@/components/profile/ActivityTab';
import MediaTab from '@/components/profile/MediaTab';
import AboutTabView from '@/components/profile/AboutTabView';
import { FileText, Circle, Image, Info } from 'lucide-react';

interface ProfileTabsViewProps {
  profileId: string;
  profile: any;
}

const ProfileTabsView: React.FC<ProfileTabsViewProps> = ({ profileId, profile }) => {
  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="grid grid-cols-4 bg-black/20 border border-white/10 backdrop-blur-md">
        <TabsTrigger value="posts" className="data-[state=active]:bg-crimson/20">
          <FileText className="mr-2 h-4 w-4" />
          Posts
        </TabsTrigger>
        <TabsTrigger value="activity" className="data-[state=active]:bg-crimson/20">
          <Circle className="mr-2 h-4 w-4" />
          Activity
        </TabsTrigger>
        <TabsTrigger value="media" className="data-[state=active]:bg-crimson/20">
          <Image className="mr-2 h-4 w-4" />
          Media
        </TabsTrigger>
        <TabsTrigger value="about" className="data-[state=active]:bg-crimson/20">
          <Info className="mr-2 h-4 w-4" />
          About
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="posts" className="mt-6">
        <UserPostsList userId={profileId} />
      </TabsContent>
      
      <TabsContent value="activity" className="mt-6">
        <ActivityTab userId={profileId} />
      </TabsContent>
      
      <TabsContent value="media" className="mt-6">
        <MediaTab />
      </TabsContent>
      
      <TabsContent value="about" className="mt-6">
        <AboutTabView profile={profile} />
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabsView;
