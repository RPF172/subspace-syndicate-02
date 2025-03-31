
import React from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ChatMessage } from '../types/ChatTypes';

interface MessageMediaProps {
  message: ChatMessage;
}

const MessageMedia: React.FC<MessageMediaProps> = ({ message }) => {
  if (!message.media_url) return null;
  
  if (message.media_type === 'image') {
    return (
      <div className="mt-1 rounded-md overflow-hidden">
        <img 
          src={message.media_url} 
          alt="Shared image" 
          className="max-w-full max-h-64 object-contain cursor-pointer"
          onClick={() => window.open(message.media_url!, '_blank')}
        />
      </div>
    );
  } else if (message.media_type === 'video') {
    return (
      <div className="mt-1 rounded-md overflow-hidden">
        <AspectRatio ratio={16/9} className="bg-black">
          <video 
            src={message.media_url} 
            controls 
            className="w-full h-full object-contain"
          />
        </AspectRatio>
      </div>
    );
  }
  
  return null;
};

export default MessageMedia;
