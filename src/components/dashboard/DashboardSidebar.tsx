
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  UserRound, 
  MessageSquare, 
  Users, 
  Compass, 
  Settings, 
  LogOut,
  ChevronDown,
  ChevronRight,
  Monitor,
  Upload,
  Search,
  TrendingUp,
  Shield
} from 'lucide-react';

const DashboardSidebar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [profileData, setProfileData] = useState<any>(null);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  
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

  useEffect(() => {
    if (location.pathname.includes('/subspacetv')) {
      setExpandedMenu('subspacetv');
    }
  }, [location.pathname]);
  
  const toggleMenu = (menu: string) => {
    setExpandedMenu(expandedMenu === menu ? null : menu);
  };
  
  const username = profileData?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';
  const bdsmRole = profileData?.bdsm_role || user?.user_metadata?.bdsm_role || 'Exploring';
  const avatarUrl = profileData?.avatar_url || user?.user_metadata?.avatar_url;
  const isAdmin = profileData?.is_admin || false;
  
  type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "dominant" | "submissive" | "switch" | "exploring" | "crimson";

  const getBadgeVariant = (role: string): BadgeVariant => {
    switch (role.toLowerCase()) {
      case 'dominant': return 'dominant';
      case 'submissive': return 'submissive';
      case 'switch': return 'switch';
      default: return 'exploring';
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <img src="/logo.svg" alt="SubSpace Logo" className="h-5 w-auto" />
          <span className="text-[#E9C846] font-semibold text-lg">SubSpace</span>
        </div>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-white/10">
            <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={username} />
            <AvatarFallback className="bg-[#E9C846] text-black">
              {username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-medium text-base text-white">{username}</span>
              <Badge variant={getBadgeVariant(bdsmRole)} className="text-xs">
                {bdsmRole}
              </Badge>
            </div>
            <Link 
              to={`/profile/${username}`}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              View Profile
            </Link>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarSeparator />
      
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname === '/dashboard'}>
              <Link to="/dashboard">
                <LayoutDashboard />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname === '/feed'}>
              <Link to="/feed">
                <TrendingUp />
                <span>News Feed</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname === '/profile'}>
              <Link to={`/profile/${username}`}>
                <UserRound />
                <span>My Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname === '/messages'}>
              <Link to="/messages">
                <MessageSquare />
                <span>Messages</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <Collapsible open={expandedMenu === 'subspacetv'} onOpenChange={() => toggleMenu('subspacetv')}>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton 
                  isActive={location.pathname.includes('/subspacetv')}
                  className="w-full justify-between"
                >
                  <div className="flex items-center">
                    <Monitor className="mr-2 h-4 w-4" />
                    <span>SubSpaceTV</span>
                  </div>
                  {expandedMenu === 'subspacetv' ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton 
                      asChild 
                      isActive={location.pathname === '/subspacetv/upload'}
                    >
                      <Link to="/subspacetv/upload">
                        <Upload className="h-4 w-4 mr-2" />
                        <span>Upload</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton 
                      asChild 
                      isActive={location.pathname === '/subspacetv'}
                    >
                      <Link to="/subspacetv">
                        <Search className="h-4 w-4 mr-2" />
                        <span>Browse</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname === '/community'}>
              <Link to="/community">
                <Users />
                <span>Community</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname === '/explore'}>
              <Link to="/explore">
                <Compass />
                <span>Explore</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {/* Admin Menu Item - Only visible for admins */}
          {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/admin'}>
                <Link to="/admin">
                  <Shield />
                  <span>Admin</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
        
        <SidebarSeparator className="my-2" />
        
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname === '/settings'}>
              <Link to="/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut}>
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;
