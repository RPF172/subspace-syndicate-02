import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseTypingIndicatorProps {
  roomId: string;
  userId?: string;
}

export const useTypingIndicator = ({ roomId, userId }: UseTypingIndicatorProps) => {
  const [isTyping, setIsTyping] = useState(false);
  const lastTypingTime = useRef<number>(0);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const sendTypingIndicator = async (isActive: boolean = true) => {
    if (!userId) return;
    
    const now = new Date().getTime();
    
    // Throttle typing events to not spam the server
    // Don't throttle when explicitly stopping typing (isActive = false)
    if (isActive && now - lastTypingTime.current < 2000) return;
    
    lastTypingTime.current = now;
    
    try {
      await supabase.channel('typing-indicator')
        .send({
          type: 'broadcast',
          event: 'typing',
          payload: {
            user_id: userId,
            room_id: roomId,
            timestamp: new Date().toISOString(),
            isActive: isActive
          }
        });
      
      // Clear any existing timeout
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
        typingTimeout.current = null;
      }
      
      // Only set a new timeout if still typing
      if (isActive) {
        // Set a timeout to stop typing indicator after 3 seconds of inactivity
        typingTimeout.current = setTimeout(() => {
          setIsTyping(false);
          // Send an explicit typing stopped event
          sendTypingIndicator(false);
        }, 3000);
      }
      
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  };

  const handleInputChange = (value: string) => {
    if (value.length > 0 && !isTyping) {
      setIsTyping(true);
      sendTypingIndicator(true);
    } else if (value.length === 0 && isTyping) {
      // Clear typing when input is emptied
      setIsTyping(false);
      sendTypingIndicator(false);
    }
    return value;
  };

  const resetTypingState = () => {
    setIsTyping(false);
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
      typingTimeout.current = null;
    }
    // Send an explicit "stopped typing" signal
    sendTypingIndicator(false);
  };

  return {
    isTyping,
    handleInputChange,
    resetTypingState
  };
};
