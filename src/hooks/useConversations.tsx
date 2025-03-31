import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Conversation } from '@/types/messages';
import { toast } from '@/hooks/use-toast';

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Get conversation IDs where user is a participant
      const { data: participantData, error: participantError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);
        
      if (participantError) throw participantError;
      
      if (!participantData || participantData.length === 0) {
        setConversations([]);
        setIsLoading(false);
        return;
      }
      
      const conversationIds = participantData.map(p => p.conversation_id);
      
      // Get conversations with last message and participants
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });
        
      if (conversationsError) throw conversationsError;
      
      // For each conversation, get participants and latest message
      const conversationsWithDetails = await Promise.all(
        conversationsData.map(async (conversation) => {
          // Get participants
          const { data: participants } = await supabase
            .from('conversation_participants')
            .select(`
              id, 
              conversation_id, 
              user_id, 
              created_at
            `)
            .eq('conversation_id', conversation.id);
            
          // Skip conversations that don't have exactly two participants
          if (!participants || participants.length !== 2) {
            return null;
          }
          
          // Separately fetch profiles data for each participant
          const processedParticipants = await Promise.all(
            participants.map(async (p) => {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('username, avatar_url, last_active')
                .eq('id', p.user_id)
                .single();
                
              return {
                id: p.id,
                conversation_id: p.conversation_id,
                user_id: p.user_id,
                created_at: p.created_at,
                profile: {
                  username: profileData?.username || 'Unknown',
                  avatar_url: profileData?.avatar_url,
                  last_active: profileData?.last_active
                }
              };
            })
          );
          
          // Get latest message
          const { data: messages } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: false })
            .limit(1);
          
          return {
            ...conversation,
            participants: processedParticipants,
            lastMessage: messages && messages.length > 0 ? messages[0] : undefined
          };
        })
      );
      
      // Filter out null values (conversations without exactly 2 participants)
      const validConversations = conversationsWithDetails.filter(
        conversation => conversation !== null
      ) as Conversation[];
      
      setConversations(validConversations);
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      toast({
        title: 'Error loading conversations',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSelectedConversation = async (conversationId: string) => {
    if (!conversationId) return;
    
    try {
      const { data: conversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();
        
      if (!conversation) return;
      
      // Fetch participants
      const { data: participants } = await supabase
        .from('conversation_participants')
        .select(`
          id, 
          conversation_id, 
          user_id, 
          created_at
        `);
        
      // Separately fetch profiles data for each participant
      const processedParticipants = await Promise.all(
        participants?.map(async (p) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username, avatar_url, last_active')
            .eq('id', p.user_id)
            .single();
            
          return {
            id: p.id,
            conversation_id: p.conversation_id,
            user_id: p.user_id,
            created_at: p.created_at,
            profile: {
              username: profileData?.username || 'Unknown',
              avatar_url: profileData?.avatar_url,
              last_active: profileData?.last_active
            }
          };
        }) || []
      );
        
      // Get latest message
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(1);
        
      const updatedConversation = {
        ...conversation,
        participants: processedParticipants,
        lastMessage: messages && messages.length > 0 ? messages[0] : undefined
      };
      
      setSelectedConversation(updatedConversation);
    } catch (error) {
      console.error("Error updating selected conversation:", error);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    
    // Mark unread messages as read when selecting a conversation
    if (conversation.lastMessage && !conversation.lastMessage.read && 
        conversation.lastMessage.sender_id !== user?.id) {
      supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversation.id)
        .eq('read', false)
        .neq('sender_id', user?.id)
        .then(() => {
          // Update the conversation in the list to show message as read
          fetchConversations();
        });
    }
  };

  return {
    conversations,
    selectedConversation,
    isLoading,
    fetchConversations,
    updateSelectedConversation,
    handleSelectConversation,
    setSelectedConversation
  };
};
