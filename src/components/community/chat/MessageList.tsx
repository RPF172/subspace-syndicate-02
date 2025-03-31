import React, { useRef, useEffect } from 'react';
import MessageItem from './MessageItem';
import { ChatMessage, TypingIndicator as TypingIndicatorType } from '../types/ChatTypes';
import TypingIndicator from './TypingIndicator';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  currentUserId?: string;
  onlineUsers: any[];
  typingUsers: TypingIndicatorType[];
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  isLoading,
  currentUserId,
  onlineUsers,
  typingUsers
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Always scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-crimson" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 h-full">
      {messages.length === 0 ? (
        <div className="flex-1 flex justify-center items-center text-white/50">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <MessageItem 
              key={message.id} 
              message={message} 
              currentUserId={currentUserId}
              onlineUsers={onlineUsers}
            />
          ))}
        </>
      )}
      
      {typingUsers.length > 0 && (
        <TypingIndicator typingUsers={typingUsers} />
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
