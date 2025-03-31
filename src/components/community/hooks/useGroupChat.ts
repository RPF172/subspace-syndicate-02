import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage, TypingIndicator } from '../types/ChatTypes';
import { useChatSubscriptions } from './useChatSubscriptions';
import { useMessageOperations } from './useMessageOperations';
import { useMediaUpload } from './useMediaUpload';
import { useTypingIndicator } from './useTypingIndicator';

export const useGroupChat = (roomId: string, userId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [isSending, setIsSending] = useState(false);

  const { isSending: messageOperationsSending, markMessageAsRead, sendMessageWithMedia } = useMessageOperations({ roomId, userId });
  const { selectedFile, setSelectedFile, isUploading, uploadProgress, uploadMedia } = useMediaUpload({ roomId });
  const { handleInputChange, resetTypingState } = useTypingIndicator({ roomId, userId });

  // Handle new messages from subscription
  const handleNewMessage = (newMsg: ChatMessage) => {
    setMessages(previous => {
      // Check if message already exists (by id)
      const messageExists = previous.some(msg => msg.id === newMsg.id);
      if (messageExists) return previous;
      
      // Check if there's an optimistic version of this message
      const optimisticIndex = previous.findIndex(
        m => m.isOptimistic && m.user_id === newMsg.user_id && 
             Math.abs(new Date(m.created_at).getTime() - new Date(newMsg.created_at).getTime()) < 5000
      );
      
      if (optimisticIndex >= 0) {
        // Replace optimistic message with real one
        const updatedMessages = [...previous];
        updatedMessages[optimisticIndex] = newMsg;
        return updatedMessages;
      }
      
      // Otherwise add as new message
      return [...previous, newMsg];
    });
    
    if (userId && userId !== newMsg.user_id) {
      markMessageAsRead(newMsg.id);
    }
  };

  // Handle typing indicator updates
  const handleTypingUpdate = (typingUser: TypingIndicator) => {
    setTypingUsers(prev => {
      // If expired flag is set, remove the user
      if (typingUser.expired) {
        return prev.filter(user => user.user_id !== typingUser.user_id);
      }
      
      const existingUserIndex = prev.findIndex(user => user.user_id === typingUser.user_id);
      
      if (existingUserIndex >= 0) {
        const updatedUsers = [...prev];
        updatedUsers[existingUserIndex] = typingUser;
        return updatedUsers;
      } else {
        return [...prev, typingUser];
      }
    });
  };

  // Handle read receipts
  const handleReadReceipt = (payload: any) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === payload.message_id) {
        return {
          ...msg,
          read_by: [...(msg.read_by || []), payload.user_id]
        };
      }
      return msg;
    }));
  };

  // Function to fetch online users
  const fetchOnlineUsers = useCallback(async () => {
    try {
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, last_active')
        .gt('last_active', fiveMinutesAgo.toISOString())
        .order('last_active', { ascending: false })
        .limit(20);
        
      if (error) throw error;
      
      // Use a stable sorting mechanism to prevent avatar flicker
      setOnlineUsers(prevUsers => {
        const newData = data || [];
        
        // Create a map of current positions
        const currentPositions = new Map();
        prevUsers.forEach((user, index) => {
          currentPositions.set(user.id, index);
        });
        
        // Sort by keeping existing positions where possible
        return [...newData].sort((a, b) => {
          const aPos = currentPositions.has(a.id) ? currentPositions.get(a.id) : Number.MAX_SAFE_INTEGER;
          const bPos = currentPositions.has(b.id) ? currentPositions.get(b.id) : Number.MAX_SAFE_INTEGER;
          
          // If both users existed before, maintain their order
          if (aPos !== Number.MAX_SAFE_INTEGER && bPos !== Number.MAX_SAFE_INTEGER) {
            return aPos - bPos;
          }
          
          // If only one user existed before, they come first
          if (aPos !== Number.MAX_SAFE_INTEGER) return -1;
          if (bPos !== Number.MAX_SAFE_INTEGER) return 1;
          
          // Otherwise, sort by most recently active
          return new Date(b.last_active).getTime() - new Date(a.last_active).getTime();
        });
      });
    } catch (error) {
      console.error('Error fetching online users:', error);
    }
  }, []);

  // Set up all subscriptions
  useChatSubscriptions({
    roomId,
    userId,
    onNewMessage: handleNewMessage,
    onTypingUpdate: handleTypingUpdate,
    onReadReceipt: handleReadReceipt,
    onOnlineStatusChange: fetchOnlineUsers
  });

  useEffect(() => {
    fetchMessages();
    fetchOnlineUsers();
    
    // Set up a periodic refresh of online users
    const onlineUsersInterval = setInterval(() => {
      fetchOnlineUsers();
    }, 10000); // Refresh every 10 seconds
    
    return () => {
      clearInterval(onlineUsersInterval);
    };
  }, [userId, roomId, fetchOnlineUsers]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('community_chats')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(50);
        
      if (error) throw error;
      
      const userIds = [...new Set(data?.map(m => m.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);
        
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, {
          username: profile.username,
          avatar_url: profile.avatar_url
        });
      });
      
      const enrichedMessages = data?.map((message) => {
        const profile = profilesMap.get(message.user_id);
        return {
          id: message.id,
          room_id: message.room_id,
          user_id: message.user_id,
          content: message.content,
          media_url: message.media_url,
          media_type: message.media_type,
          created_at: message.created_at,
          username: profile?.username,
          avatar_url: profile?.avatar_url,
          read_by: userId ? [userId] : [],
          isOptimistic: false
        } as ChatMessage;
      });
      
      setMessages(enrichedMessages || []);
      
      if (userId && enrichedMessages?.length) {
        enrichedMessages.forEach(msg => {
          markMessageAsRead(msg.id);
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !userId) return;
    
    try {
      setIsSending(true);
      
      // Reset typing state immediately when sending message
      resetTypingState();
      
      let mediaUrl = null;
      let mediaType = null;
      
      // Create an optimistic message to show immediately
      const optimisticMessageId = `temp-${Date.now()}`;
      const { data: userData } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', userId)
        .single();
        
      // Add optimistic message to the UI immediately
      const optimisticMessage: ChatMessage = {
        id: optimisticMessageId,
        room_id: roomId,
        user_id: userId,
        content: newMessage.trim(),
        media_url: null,
        media_type: null,
        created_at: new Date().toISOString(),
        username: userData?.username,
        avatar_url: userData?.avatar_url,
        read_by: [userId],
        isOptimistic: true
      };
      
      // Update UI immediately
      setMessages(previous => [...previous, optimisticMessage]);
      
      if (selectedFile) {
        const uploadResult = await uploadMedia(selectedFile);
        mediaUrl = uploadResult.url;
        mediaType = uploadResult.type;
        
        // Update the optimistic message with media info
        setMessages(previous => previous.map(msg => 
          msg.id === optimisticMessageId 
            ? { ...msg, media_url: mediaUrl, media_type: mediaType } 
            : msg
        ));
      }
      
      const success = await sendMessageWithMedia(newMessage, mediaUrl, mediaType);
      
      if (success) {
        setNewMessage('');
        setSelectedFile(null);
      } else {
        // If sending failed, remove the optimistic message
        setMessages(previous => previous.filter(msg => msg.id !== optimisticMessageId));
      }
    } catch (error) {
      console.error('Error in send message process:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Custom setNewMessage that also handles typing indicators
  const updateNewMessage = (value: string) => {
    setNewMessage(handleInputChange(value));
  };

  return {
    messages,
    newMessage,
    setNewMessage: updateNewMessage,
    isLoading,
    isSending,
    onlineUsers,
    selectedFile,
    setSelectedFile,
    isUploading,
    uploadProgress,
    sendMessage,
    typingUsers,
  };
};
