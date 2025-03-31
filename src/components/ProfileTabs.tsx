
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import AboutTab from './profile/AboutTab';
import ActivityTab from './profile/ActivityTab';
import MediaTab from './profile/MediaTab';

const ProfileTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("about");
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
      <TabsList className="w-full justify-start bg-black/20 border-b border-white/10 rounded-none p-0">
        <TabsTrigger 
          value="about" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-crimson bg-transparent data-[state=active]:bg-transparent text-white/70 data-[state=active]:text-white"
        >
          About
        </TabsTrigger>
        <TabsTrigger 
          value="activity" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-crimson bg-transparent data-[state=active]:bg-transparent text-white/70 data-[state=active]:text-white"
        >
          Activity
        </TabsTrigger>
        <TabsTrigger 
          value="media" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-crimson bg-transparent data-[state=active]:bg-transparent text-white/70 data-[state=active]:text-white"
        >
          Media
        </TabsTrigger>
      </TabsList>
      
      <div className="pt-6">
        <TabsContent value="about" className="mt-0 bg-transparent data-[state=active]:animate-in data-[state=active]:fade-in-50">
          <AboutTab />
        </TabsContent>
        
        <TabsContent value="activity" className="mt-0 bg-transparent data-[state=active]:animate-in data-[state=active]:fade-in-50">
          <ActivityTab />
        </TabsContent>
        
        <TabsContent value="media" className="mt-0 bg-transparent data-[state=active]:animate-in data-[state=active]:fade-in-50">
          <MediaTab />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default ProfileTabs;
