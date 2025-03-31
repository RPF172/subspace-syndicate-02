
import React, { useState, useEffect, useRef } from 'react';
import { Conversation, Message, TypingStatus } from '@/types/messages';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import MessageHeader from './MessageHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Check } from 'lucide-react';
import TypingIndicator from './TypingIndicator';

interface MessageViewProps {
  conversation: Conversation;
  currentUserId: string;
  onBack: () => void;
  onConversationDeleted?: () => void;
}

interface MessageWithSender extends Message {
  sender: {
    username: string;
    avatar_url?: string;
    last_active?: string;
  } | null;
}

const MessageView: React.FC<MessageViewProps> = ({
  conversation,
  currentUserId,
  onBack,
  onConversationDeleted
}) => {
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<{
    username: string;
    avatar_url?: string;
    last_active?: string;
  } | null>(null);
  const [typingStatus, setTypingStatus] = useState<TypingStatus | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fetchCurrentUserProfile = async () => {
      if (!currentUserId) return;
      
      try {
        const { data } = await supabase
          .from('profiles')
          .select('username, avatar_url, last_active')
          .eq('id', currentUserId)
          .single();
          
        if (data) {
          setCurrentUserProfile(data);
        }
      } catch (error) {
        console.error('Error fetching current user profile:', error);
      }
    };
    
    fetchCurrentUserProfile();
  }, [currentUserId]);

  useEffect(() => {
    fetchMessages();
    
    const messageChannel = supabase
      .channel(`messages-${conversation.id}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`
        }, 
        (payload) => {
          // Check if message is already in state before adding it
          if (!messages.some(msg => msg.id === payload.new.id)) {
            const fetchSenderInfo = async () => {
              const { data } = await supabase
                .from('profiles')
                .select('username, avatar_url, last_active')
                .eq('id', payload.new.sender_id)
                .single();
                
              const newMsg: MessageWithSender = {
                id: payload.new.id,
                conversation_id: payload.new.conversation_id,
                sender_id: payload.new.sender_id,
                content: payload.new.content,
                read: payload.new.read || false,
                created_at: payload.new.created_at,
                updated_at: payload.new.updated_at,
                sender: data || null
              };
              
              // Remove any optimistic versions of this message first
              setMessages(prev => {
                // First filter out any temporary optimistic messages from this sender with similar content
                const filteredMessages = prev.filter(m => 
                  !(m.id.startsWith('temp-') && 
                    m.sender_id === payload.new.sender_id && 
                    m.content === payload.new.content)
                );
                
                // Then add the new message if it's not already in the list
                if (!filteredMessages.some(m => m.id === newMsg.id)) {
                  return [...filteredMessages, newMsg];
                }
                
                return filteredMessages;
              });
              
              if (payload.new.sender_id !== currentUserId) {
                markMessageAsRead(payload.new.id);
              }
            };
            
            fetchSenderInfo();
          }
        }
      )
      .subscribe();
      
    const typingChannel = supabase
      .channel(`typing-${conversation.id}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.userId !== currentUserId) {
          setTypingStatus({
            userId: payload.payload.userId,
            isTyping: payload.payload.isTyping,
            username: payload.payload.username,
            timestamp: payload.payload.timestamp || new Date().toISOString()
          });
          
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          
          if (payload.payload.isTyping) {
            typingTimeoutRef.current = setTimeout(() => {
              setTypingStatus(null);
            }, 3000);
          }
        }
      })
      .subscribe();
      
    const readChannel = supabase
      .channel(`read-${conversation.id}`)
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`
        },
        (payload) => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === payload.new.id ? { ...msg, read: true } : msg
            )
          );
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(typingChannel);
      supabase.removeChannel(readChannel);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversation.id, currentUserId]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });
        
      if (messagesError) throw messagesError;
      
      if (!messagesData || messagesData.length === 0) {
        setMessages([]);
        setIsLoading(false);
        return;
      }
      
      const senderIds = [...new Set(messagesData.map(msg => msg.sender_id))];
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', senderIds);
        
      if (profilesError) throw profilesError;
      
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });
      
      const messagesWithSenders: MessageWithSender[] = messagesData.map(msg => ({
        ...msg,
        sender: profilesMap.get(msg.sender_id) || null
      }));
      
      setMessages(messagesWithSenders);
      
      if (messagesWithSenders.length > 0) {
        const unreadMessages = messagesWithSenders.filter(msg => !msg.read && msg.sender_id !== currentUserId);
        
        if (unreadMessages.length > 0) {
          const unreadIds = unreadMessages.map(msg => msg.id);
          markMessagesAsRead(unreadIds);
        }
      }
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error loading messages',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const markMessagesAsRead = async (messageIds: string[]) => {
    if (!messageIds.length) return;
    
    try {
      await supabase
        .from('messages')
        .update({ read: true })
        .in('id', messageIds);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleTypingStatus = (isTyping: boolean) => {
    if (!currentUserProfile) return;
    
    supabase
      .channel(`typing-${conversation.id}`)
      .send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          userId: currentUserId,
          isTyping,
          username: currentUserProfile.username,
          timestamp: new Date().toISOString()
        }
      });
  };

  const handleSendMessage = async (messageContent: string) => {
    try {
      setIsSending(true);
      
      handleTypingStatus(false);
      
      // Create a unique temporary ID with a timestamp to better identify this message
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const optimisticMessage: MessageWithSender = {
        id: tempId,
        conversation_id: conversation.id,
        sender_id: currentUserId,
        content: messageContent,
        read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sender: currentUserProfile
      };
      
      // Add the optimistic message to the UI
      setMessages(prev => [...prev, optimisticMessage]);
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: currentUserId,
          content: messageContent,
        })
        .select();
        
      if (error) throw error;
      
      // No need to update messages state here, the realtime subscription will handle it
      // and remove the optimistic message
      
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversation.id);
        
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error sending message',
        description: error.message,
        variant: 'destructive',
      });
      
      // If there's an error, remove the optimistic message
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteConversation = async () => {
    try {
      setIsDeleting(true);
      
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversation.id);
        
      if (messagesError) throw messagesError;
      
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .delete()
        .eq('conversation_id', conversation.id);
        
      if (participantsError) throw participantsError;
      
      const { error: conversationError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversation.id);
        
      if (conversationError) throw conversationError;
      
      if (onConversationDeleted) {
        onConversationDeleted();
      }
      
      onBack();
      
      toast({
        title: 'Conversation deleted',
        description: 'The conversation has been successfully deleted',
      });
    } catch (error: any) {
      console.error('Error deleting conversation:', error);
      toast({
        title: 'Error deleting conversation',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getOtherParticipant = () => {
    if (!conversation.participants || conversation.participants.length !== 2) return null;
    return conversation.participants.find(p => p.user_id !== currentUserId);
  };

  const getLatestSentMessage = () => {
    const userMessages = messages.filter(msg => msg.sender_id === currentUserId);
    if (userMessages.length === 0) return null;
    return userMessages[userMessages.length - 1];
  };

  const otherParticipant = getOtherParticipant();
  const latestSentMessage = getLatestSentMessage();
  
  return (
    <div className="flex flex-col h-full">
      <MessageHeader
        otherParticipant={otherParticipant}
        onBack={onBack}
        onDeleteConversation={handleDeleteConversation}
        isDeleting={isDeleting}
      />
      
      <div className="flex-1 overflow-y-auto bg-black/20">
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          isLoading={isLoading}
        />
        
        {typingStatus?.isTyping && (
          <TypingIndicator username={typingStatus.username} />
        )}
        
        {latestSentMessage && latestSentMessage.read && (
          <div className="flex items-center justify-end px-4 pb-1">
            <span className="text-xs text-white/60 flex items-center gap-1">
              <Check className="h-3 w-3" /> Read
            </span>
          </div>
        )}
      </div>
      
      <MessageInput
        onSendMessage={handleSendMessage}
        isSending={isSending}
        onTypingChange={handleTypingStatus}
      />
    </div>
  );
};

export default MessageView;
