
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import OnlineIndicator from '@/components/community/OnlineIndicator';

interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
  last_active?: string;
}

interface UserSearchResultProps {
  profile: UserProfile;
  onSelect: (userId: string) => void;
}

const UserSearchResult: React.FC<UserSearchResultProps> = ({ profile, onSelect }) => {
  return (
    <div
      className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-md cursor-pointer"
      onClick={() => onSelect(profile.id)}
    >
      <div className="relative">
        <Avatar>
          <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.username} />
          <AvatarFallback className="bg-crimson text-white">
            {profile.username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {profile.last_active && (
          <OnlineIndicator 
            lastActive={profile.last_active} 
            className="absolute -bottom-1 -right-1 border-2 border-gray-900" 
            showTooltip={false}
          />
        )}
      </div>
      <span className="font-medium">{profile.username}</span>
    </div>
  );
};

export default UserSearchResult;
