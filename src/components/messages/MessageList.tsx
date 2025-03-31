
import React, { useRef, useEffect } from 'react';
import { Message } from '@/types/messages';
import MessageItem from './MessageItem';

interface MessageWithSender extends Message {
  sender: {
    username: string;
    avatar_url?: string;
    last_active?: string;
  } | null;
}

interface MessageListProps {
  messages: MessageWithSender[];
  currentUserId: string;
  isLoading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  currentUserId,
  isLoading 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-crimson"></div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center text-white/60 my-8">
        <p>No messages yet</p>
        <p className="text-sm mt-2">Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map(message => (
        <MessageItem
          key={message.id}
          id={message.id}
          content={message.content}
          created_at={message.created_at}
          isMine={message.sender_id === currentUserId}
          sender={message.sender}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
