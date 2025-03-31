import React, { useMemo } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import OnlineIndicator from '../OnlineIndicator';

interface OnlineUser {
  id: string;
  username?: string;
  avatar_url?: string;
  last_active: string;
}

interface OnlineUsersSidebarProps {
  onlineUsers: OnlineUser[];
}

const OnlineUsersSidebar: React.FC<OnlineUsersSidebarProps> = ({ onlineUsers }) => {
  // Use memo to prevent unnecessary re-renders
  const stableUsers = useMemo(() => {
    return onlineUsers;
  }, [onlineUsers]);
  
  return (
    <div className="w-16 bg-black/40 p-2 max-h-full overflow-auto" style={{ overscrollBehavior: 'contain' }}>
      <div className="flex flex-col gap-2">
        <TooltipProvider>
          {stableUsers.map(user => (
            <Tooltip key={user.id}>
              <TooltipTrigger asChild>
                <div className="relative" style={{ height: '2.75rem' }}>
                  <Avatar className="h-10 w-10 border-2 border-crimson/40">
                    <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-crimson text-white text-xs">
                      {(user.username || 'U').substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <OnlineIndicator 
                    lastActive={user.last_active} 
                    className="absolute -top-1 -right-1 ring-2 ring-black" 
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{user.username}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
};

export default OnlineUsersSidebar;
