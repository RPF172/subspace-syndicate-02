import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useActivity } from '@/utils/useActivity';
import { useConversations } from '@/hooks/useConversations';
import RealtimeSubscriptions from '@/components/messages/RealtimeSubscriptions';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import ConversationsList from '@/components/messages/ConversationsList';
import NewConversationButton from '@/components/messages/NewConversationButton';
import MessageView from '@/components/messages/MessageView';
import { Conversation } from '@/types/messages';

const Messages = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  
  // Custom hook to fetch and manage conversations
  const { 
    conversations,
    selectedConversation,
    isLoading,
    fetchConversations,
    updateSelectedConversation,
    handleSelectConversation,
  } = useConversations();
  
  // Track user activity for online status
  useActivity();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    
    if (user) {
      fetchConversations();
    }
  }, [user, loading]);

  useEffect(() => {
    // If URL has a conversation ID, select that conversation
    if (conversationId && user) {
      const convo = conversations.find(c => c.id === conversationId);
      if (convo) {
        handleSelectConversation(convo);
      } else if (conversations.length > 0) {
        updateSelectedConversation(conversationId);
      }
    }
  }, [conversationId, conversations, user]);

  const handleConversationSelect = (conversation: Conversation) => {
    handleSelectConversation(conversation);
    navigate(`/messages/${conversation.id}`);
  };

  const handleBackToList = () => {
    navigate('/messages');
  };

  if (!user) return null;

  return (
    <AuthenticatedLayout pageTitle="Messages" showSidebar={true}>
      {/* Component to handle all real-time subscriptions */}
      <RealtimeSubscriptions 
        userId={user.id}
        conversations={conversations}
        selectedConversation={selectedConversation}
        onFetchConversations={fetchConversations}
        onUpdateSelectedConversation={updateSelectedConversation}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-abyss via-abyss/95 to-abyss">
        <div className="h-[calc(100vh-64px)] flex">
          {/* Conversations list - always visible but resizes */}
          <div className={`h-full ${selectedConversation ? 'w-1/3 border-r border-white/10' : 'w-full'} 
            transition-all duration-300 overflow-hidden flex flex-col`}>
            
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
              <h2 className="text-xl font-semibold text-white">Messages</h2>
              <NewConversationButton onConversationCreated={fetchConversations} />
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <ConversationsList 
                conversations={conversations.filter(c => c.participants && c.participants.length === 2)} 
                selectedConversation={selectedConversation}
                onSelectConversation={handleConversationSelect}
                isLoading={isLoading}
                currentUserId={user.id}
              />
            </div>
          </div>
          
          {/* Selected conversation view */}
          {selectedConversation && (
            <div className="w-2/3 h-full flex flex-col">
              <MessageView
                conversation={selectedConversation}
                currentUserId={user.id}
                onBack={handleBackToList}
                onConversationDeleted={fetchConversations}
              />
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Messages;
