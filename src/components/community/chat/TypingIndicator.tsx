
import React from 'react';
import { TypingIndicator as TypingIndicatorType } from '../types/ChatTypes';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface TypingIndicatorProps {
  typingUsers: TypingIndicatorType[];
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers }) => {
  if (typingUsers.length === 0) return null;

  return (
    <div className="flex items-center p-2 text-sm text-white/70">
      <div className="flex -space-x-2 mr-2">
        {typingUsers.slice(0, 3).map((user) => (
          <Avatar key={user.user_id} className="h-6 w-6 border border-black">
            <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
            <AvatarFallback className="bg-crimson text-white text-xs">
              {(user.username || 'U').substring(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      
      <div className="flex items-center">
        <span>
          {typingUsers.length === 1
            ? `${typingUsers[0].username || 'Someone'} is typing`
            : typingUsers.length === 2
            ? `${typingUsers[0].username || 'Someone'} and ${typingUsers[1].username || 'someone'} are typing`
            : `${typingUsers.length} people are typing`}
        </span>
        <span className="ml-1 flex">
          <span className="animate-bounce">.</span>
          <span className="animate-bounce delay-75">.</span>
          <span className="animate-bounce delay-150">.</span>
        </span>
      </div>
    </div>
  );
};

export default TypingIndicator;
