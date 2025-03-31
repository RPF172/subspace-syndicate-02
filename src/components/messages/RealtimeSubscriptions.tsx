
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Conversation } from '@/types/messages';

interface RealtimeSubscriptionsProps {
  userId: string;
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onFetchConversations: () => void;
  onUpdateSelectedConversation: (conversationId: string) => void;
}

const RealtimeSubscriptions: React.FC<RealtimeSubscriptionsProps> = ({ 
  userId, 
  conversations, 
  selectedConversation, 
  onFetchConversations,
  onUpdateSelectedConversation
}) => {
  useEffect(() => {
    if (!userId) return;
    
    // Set up real-time subscription for changes to conversations
    const conversationsChannel = supabase
      .channel('conversations-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'conversation_participants',
          filter: `user_id=eq.${userId}`
        }, 
        () => {
          onFetchConversations();
        }
      )
      .subscribe();
      
    // Set up real-time subscription for new messages to update conversation list ordering
    const messagesChannel = supabase
      .channel('messages-updates')
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          // Check if the message belongs to one of our conversations before updating
          const belongsToUserConversation = conversations.some(c => c.id === payload.new.conversation_id);
          
          if (belongsToUserConversation) {
            // Debounce multiple messages coming in at once
            onFetchConversations();
            
            // If the new message is for our currently selected conversation and from the other user,
            // update the selected conversation object to include this message
            if (selectedConversation?.id === payload.new.conversation_id && 
                payload.new.sender_id !== userId) {
              onUpdateSelectedConversation(selectedConversation.id);
            }
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [userId, conversations, selectedConversation, onFetchConversations, onUpdateSelectedConversation]);

  return null; // This component doesn't render anything
};

export default RealtimeSubscriptions;
