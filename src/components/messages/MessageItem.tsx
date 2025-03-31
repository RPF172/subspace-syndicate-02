
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface MessageItemProps {
  id: string;
  content: string;
  created_at: string;
  isMine: boolean;
  sender: {
    username?: string;
    avatar_url?: string;
  } | null;
}

const MessageItem: React.FC<MessageItemProps> = ({
  content,
  created_at,
  isMine,
  sender
}) => {
  const messageDate = new Date(created_at);
  const timeAgo = formatDistanceToNow(messageDate, { addSuffix: true });
  
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div className="flex max-w-[75%]">
        {!isMine && (
          <Avatar className="h-8 w-8 mr-2 mt-1">
            <AvatarImage src={sender?.avatar_url || "/placeholder.svg"} />
            <AvatarFallback className="bg-crimson text-white text-xs">
              {(sender?.username || 'U').substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div>
          <div
            className={`rounded-2xl px-4 py-2 ${
              isMine 
                ? 'bg-crimson text-white' 
                : 'bg-gray-800 text-white'
            }`}
          >
            <p className="whitespace-pre-wrap break-words">{content}</p>
          </div>
          <div className="text-xs text-white/50 mt-1 px-2">
            {timeAgo}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
