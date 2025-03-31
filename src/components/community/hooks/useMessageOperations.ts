
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '../types/ChatTypes';

interface UseMessageOperationsProps {
  roomId: string;
  userId?: string;
}

export const useMessageOperations = ({ roomId, userId }: UseMessageOperationsProps) => {
  const [isSending, setIsSending] = useState(false);

  const markMessageAsRead = async (messageId: string) => {
    if (!userId) return;
    
    try {
      await supabase.channel('read-receipts')
        .send({
          type: 'broadcast',
          event: 'message_read',
          payload: {
            message_id: messageId,
            user_id: userId,
            room_id: roomId,
            timestamp: new Date().toISOString()
          }
        });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const sendMessageWithMedia = async (
    content: string, 
    mediaUrl: string | null, 
    mediaType: string | null
  ) => {
    if (!userId) return;
    
    try {
      setIsSending(true);
      
      const { error } = await supabase
        .from('community_chats')
        .insert({
          room_id: roomId,
          user_id: userId,
          content: content.trim(),
          media_url: mediaUrl,
          media_type: mediaType
        });
        
      if (error) throw error;
      
      // Update user's last active timestamp
      await supabase
        .from('profiles')
        .update({ last_active: new Date().toISOString() })
        .eq('id', userId);
      
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return {
    isSending,
    markMessageAsRead,
    sendMessageWithMedia
  };
};
