
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Conversation } from '@/types/messages';
import FloatingChatHead from './FloatingChatHead';

interface FloatingChatsContainerProps {
  openConversations: Conversation[];
  currentUserId: string;
  onCloseConversation: (conversationId: string) => void;
}

const FloatingChatsContainer: React.FC<FloatingChatsContainerProps> = ({
  openConversations,
  currentUserId,
  onCloseConversation,
}) => {
  // Filter to ensure each conversation has exactly two participants
  const validConversations = openConversations.filter(
    conversation => conversation.participants && conversation.participants.length === 2
  );

  return (
    <AnimatePresence>
      {validConversations.map((conversation, index) => (
        <FloatingChatHead
          key={conversation.id}
          conversation={conversation}
          currentUserId={currentUserId}
          onClose={() => onCloseConversation(conversation.id)}
          index={index}
        />
      ))}
    </AnimatePresence>
  );
};

export default FloatingChatsContainer;
