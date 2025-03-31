
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Search, User, Shield, SwitchCamera, HelpCircle } from 'lucide-react';
import MemberCard from '@/components/community/MemberCard';
import OnlineIndicator from '@/components/community/OnlineIndicator';
import GroupChatButton from '@/components/community/GroupChatButton';

interface CommunityMember {
  id: string;
  username: string;
  user_role: string;
  bdsm_role: string;
  last_active: string;
  avatar_url: string;
  location?: string;
}

const Community: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [allMembers, setAllMembers] = useState<CommunityMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<CommunityMember[]>([]);
  const [onlineMembers, setOnlineMembers] = useState<CommunityMember[]>([]);
  const [dominants, setDominants] = useState<CommunityMember[]>([]);
  const [submissives, setSubmissives] = useState<CommunityMember[]>([]);
  const [switches, setSwitches] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchMembers();
    
    if (user) {
      updateUserActivity();
    }
    
    const channel = supabase.channel('online-users');
    
    channel.on('presence', { event: 'sync' }, () => {
      fetchOnlineUsers();
    }).subscribe();
    
    const interval = setInterval(() => {
      if (user) {
        updateUserActivity();
      }
    }, 60000);
    
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  const updateUserActivity = async () => {
    if (!user) return;
    
    await supabase
      .from('profiles')
      .update({ last_active: new Date().toISOString() })
      .eq('id', user.id);
  };
  
  const fetchOnlineUsers = async () => {
    try {
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .gt('last_active', fiveMinutesAgo.toISOString());
        
      if (error) throw error;
      
      if (data) {
        setOnlineMembers(data as CommunityMember[]);
      }
    } catch (error) {
      console.error('Error fetching online users:', error);
    }
  };
  
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('username');
        
      if (error) throw error;
      
      const members = data as CommunityMember[];
      setAllMembers(members);
      setFilteredMembers(members);
      
      setDominants(members.filter(m => m.bdsm_role?.toLowerCase() === 'dominant'));
      setSubmissives(members.filter(m => m.bdsm_role?.toLowerCase() === 'submissive'));
      setSwitches(members.filter(m => m.bdsm_role?.toLowerCase() === 'switch'));
      
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredMembers(allMembers);
      return;
    }
    
    const filtered = allMembers.filter(member => 
      member.username?.toLowerCase().includes(query) ||
      member.bdsm_role?.toLowerCase().includes(query) ||
      member.location?.toLowerCase().includes(query)
    );
    
    setFilteredMembers(filtered);
  };
  
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Community</h1>
            <p className="text-gray-300">
              Connect with other members of the community
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={handleSearch}
                className="pl-10 bg-black/30 border-white/10 w-full sm:w-64"
              />
            </div>
            
            <Button className="bg-crimson hover:bg-crimson/90">
              <User className="mr-2 h-4 w-4" /> Find New Connections
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-black/30 border-white/10">
            <TabsTrigger value="all">All Members</TabsTrigger>
            <TabsTrigger value="online">
              Online Now <Badge className="ml-1 bg-green-500 text-white">{onlineMembers.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="dominants">Dominants</TabsTrigger>
            <TabsTrigger value="submissives">Submissives</TabsTrigger>
            <TabsTrigger value="switches">Switches</TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="bg-black/30 border-white/10 h-24 animate-pulse" />
                  ))
                ) : filteredMembers.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-400">No members found matching your search criteria.</p>
                  </div>
                ) : (
                  filteredMembers.map(member => (
                    <MemberCard 
                      key={member.id} 
                      member={{
                        id: member.id,
                        username: member.username,
                        avatar: member.avatar_url,
                        role: member.bdsm_role,
                        location: member.location,
                        last_active: member.last_active,
                        isOnline: new Date(member.last_active).getTime() > Date.now() - 5 * 60 * 1000
                      }} 
                    />
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="online" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="bg-black/30 border-white/10 h-24 animate-pulse" />
                  ))
                ) : onlineMembers.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-400">No members are currently online.</p>
                  </div>
                ) : (
                  onlineMembers.map(member => (
                    <MemberCard 
                      key={member.id} 
                      member={{
                        id: member.id,
                        username: member.username,
                        avatar: member.avatar_url,
                        role: member.bdsm_role,
                        location: member.location,
                        last_active: member.last_active,
                        isOnline: true
                      }} 
                    />
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="dominants" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="bg-black/30 border-white/10 h-24 animate-pulse" />
                  ))
                ) : dominants.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-400">No dominant members found.</p>
                  </div>
                ) : (
                  dominants.map(member => (
                    <MemberCard 
                      key={member.id} 
                      member={{
                        id: member.id,
                        username: member.username,
                        avatar: member.avatar_url,
                        role: member.bdsm_role,
                        location: member.location,
                        last_active: member.last_active,
                        isOnline: new Date(member.last_active).getTime() > Date.now() - 5 * 60 * 1000
                      }} 
                    />
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="submissives" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {submissives.map(member => (
                  <MemberCard 
                    key={member.id} 
                    member={{
                      id: member.id,
                      username: member.username,
                      avatar: member.avatar_url,
                      role: member.bdsm_role,
                      location: member.location,
                      last_active: member.last_active,
                      isOnline: new Date(member.last_active).getTime() > Date.now() - 5 * 60 * 1000
                    }} 
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="switches" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {switches.map(member => (
                  <MemberCard 
                    key={member.id} 
                    member={{
                      id: member.id,
                      username: member.username,
                      avatar: member.avatar_url,
                      role: member.bdsm_role,
                      location: member.location,
                      last_active: member.last_active,
                      isOnline: new Date(member.last_active).getTime() > Date.now() - 5 * 60 * 1000
                    }} 
                  />
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
        
        <Separator className="my-8 bg-white/10" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-black/30 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-crimson" /> Community Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Respect boundaries and consent at all times</li>
                <li>Maintain confidentiality and privacy</li>
                <li>No harassment, bullying, or discrimination</li>
                <li>Be supportive and constructive in your interactions</li>
                <li>Report any concerns to moderators</li>
              </ul>
              <Button variant="link" className="text-crimson mt-2 p-0">Read Full Guidelines</Button>
            </CardContent>
          </Card>
          
          <Card className="bg-black/30 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center">
                <SwitchCamera className="mr-2 h-5 w-5 text-crimson" /> Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-white">Virtual Munch</p>
                  <p className="text-sm text-gray-300">Friday, 8:00 PM - Community Video Chat</p>
                </div>
                <div>
                  <p className="font-medium text-white">Newcomers Q&A</p>
                  <p className="text-sm text-gray-300">Sunday, 3:00 PM - Orientation for new members</p>
                </div>
                <Button variant="outline" className="w-full mt-2 border-white/20">View All Events</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/30 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center">
                <HelpCircle className="mr-2 h-5 w-5 text-crimson" /> Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start border-white/20">
                  BDSM 101 Guide
                </Button>
                <Button variant="outline" className="w-full justify-start border-white/20">
                  Safety Information
                </Button>
                <Button variant="outline" className="w-full justify-start border-white/20">
                  Communication Tools
                </Button>
                <Button variant="outline" className="w-full justify-start border-white/20">
                  Glossary of Terms
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <GroupChatButton onlineCount={onlineMembers.length} />
    </AuthenticatedLayout>
  );
};

export default Community;
