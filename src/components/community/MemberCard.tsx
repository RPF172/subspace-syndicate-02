import React from 'react';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import OnlineIndicator from './OnlineIndicator';

// Define the props interface
export interface MemberCardProps {
  member: {
    id: string;
    username: string;
    avatar?: string;
    role?: string;
    isOnline?: boolean;
    location?: string;
    last_active?: string;
  };
}

const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  const navigate = useNavigate();
  
  const goToProfile = () => {
    navigate(`/profile/${member.username}`);
  };
  
  return (
    <Card 
      variant="dark"
      size="sm"
      interactive={true}
      elevated={true}
      className="overflow-hidden cursor-pointer"
      onClick={goToProfile}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="h-10 w-10 border border-white/10">
            <AvatarImage src={member.avatar} />
            <AvatarFallback className="bg-crimson text-white">
              {member.username?.substring(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          {member.isOnline && <OnlineIndicator lastActive={member.last_active} className="absolute -bottom-1 -right-1" />}
        </div>
        
        <div>
          <div className="font-medium text-white">{member.username}</div>
          <div className="text-xs text-white/60 flex items-center gap-1">
            {member.role || 'Member'} {member.location && `• ${member.location}`}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MemberCard;
