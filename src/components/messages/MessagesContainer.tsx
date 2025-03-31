
import React from 'react';
import { motion } from 'framer-motion';
import ConversationsList from './ConversationsList';
import MessageView from './MessageView';
import NewConversationButton from './NewConversationButton';

interface MessagesContainerProps {
  conversations: any[];
  selectedConversation: any | null;
  onSelectConversation: (conversation: any) => void;
  isLoading: boolean;
  currentUserId: string;
  onFetchConversations: () => void;
  onConversationDeleted: () => void;
  onBack: () => void;
}

// This component is kept for backward compatibility but is no longer used directly
const MessagesContainer: React.FC<MessagesContainerProps> = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  isLoading,
  currentUserId,
  onFetchConversations,
  onConversationDeleted,
  onBack
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-abyss via-abyss/95 to-abyss">
      <div className="container mx-auto py-6 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-black/20 border border-white/10 backdrop-blur-md rounded-lg overflow-hidden"
        >
          <div className="flex flex-col md:flex-row h-[80vh]">
            <div className="w-full md:w-1/3 border-r border-white/10">
              <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Messages</h2>
                <NewConversationButton onConversationCreated={onFetchConversations} />
              </div>
              
              <ConversationsList 
                conversations={conversations} 
                selectedConversation={selectedConversation}
                onSelectConversation={onSelectConversation}
                isLoading={isLoading}
                currentUserId={currentUserId}
              />
            </div>
            
            <div className="w-full md:w-2/3 flex flex-col">
              {selectedConversation ? (
                <MessageView 
                  conversation={selectedConversation}
                  currentUserId={currentUserId}
                  onBack={onBack}
                  onConversationDeleted={onConversationDeleted}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-white/60">
                    <p className="text-lg">Select a conversation or start a new one</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MessagesContainer;
