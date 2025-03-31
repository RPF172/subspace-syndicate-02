
import React from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ChatMessage } from '../types/ChatTypes';
import MessageMedia from './MessageMedia';
import { Check } from 'lucide-react';

interface MessageItemProps {
  message: ChatMessage;
  currentUserId?: string;
  onlineUsers: any[];
}

const MessageItem: React.FC<MessageItemProps> = ({ message, currentUserId, onlineUsers }) => {
  const isOwnMessage = message.user_id === currentUserId;
  const hasBeenRead = message.read_by && message.read_by.length > 0;
  const readByOthers = message.read_by?.filter(id => id !== currentUserId).length || 0;

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className="flex max-w-[85%]">
        {!isOwnMessage && (
          <Avatar className="h-8 w-8 mr-2 mt-1">
            <AvatarImage src={message.avatar_url || "/placeholder.svg"} />
            <AvatarFallback className="bg-crimson text-white text-xs">
              {(message.username || 'U').substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div>
          {!isOwnMessage && (
            <div className="text-xs text-white/70 ml-1 mb-1">
              {message.username || 'Anonymous'}
            </div>
          )}
          
          <div
            className={`rounded-2xl px-4 py-2 ${
              isOwnMessage 
                ? 'bg-crimson text-white' 
                : 'bg-gray-800 text-white'
            }`}
          >
            {message.content && (
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            )}
            
            <MessageMedia message={message} />
          </div>
          
          <div className="text-xs text-white/50 mt-1 px-2 flex items-center">
            {format(new Date(message.created_at), 'HH:mm')}
            
            {isOwnMessage && (
              <span className="ml-2 flex items-center">
                {readByOthers > 0 ? (
                  <Check className="h-3 w-3 text-green-500" strokeWidth={3} />
                ) : hasBeenRead ? (
                  <Check className="h-3 w-3 text-gray-400" />
                ) : null}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
