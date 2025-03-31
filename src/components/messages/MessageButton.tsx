import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MessageButtonProps {
  recipientId: string;
  className?: string;
}

const MessageButton: React.FC<MessageButtonProps> = ({ recipientId, className }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleClick = async () => {
    if (!user) {
      toast({
        title: 'You need to sign in',
        description: 'Please sign in to send messages',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }
    
    if (user.id === recipientId) {
      toast({
        title: 'Cannot message yourself',
        description: 'You cannot start a conversation with yourself',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Check if conversation already exists
      const { data: existingConversations } = await supabase.rpc(
        'get_user_conversations',
        { user_id: user.id }
      );
      
      if (existingConversations && existingConversations.length > 0) {
        // Check if the recipient is in any of these conversations
        const { data: participations } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', recipientId)
          .in('conversation_id', existingConversations);
          
        if (participations && participations.length > 0) {
          // Conversation exists, redirect to it
          navigate(`/messages/${participations[0].conversation_id}`);
          return;
        }
      }
      
      // Create new conversation with exactly two participants
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single();
        
      if (conversationError) throw conversationError;
      
      // Add exactly two participants: current user and recipient
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          {
            conversation_id: conversation.id,
            user_id: user.id,
          },
          {
            conversation_id: conversation.id,
            user_id: recipientId,
          }
        ]);
        
      if (participantsError) throw participantsError;
      
      // Navigate to the specific conversation
      navigate(`/messages/${conversation.id}`);
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Error starting conversation',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className={`flex items-center gap-2 ${className}`}
    >
      <MessageSquare className="h-4 w-4" />
      <span>Message</span>
    </Button>
  );
};

export default MessageButton;
