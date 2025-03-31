import React from 'react';
import { Conversation } from '@/types/messages';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import OnlineIndicator from '@/components/community/OnlineIndicator';
import { Badge } from '@/components/ui/badge';

interface ConversationsListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  isLoading: boolean;
  currentUserId: string;
}

const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  isLoading,
  currentUserId
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-crimson"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-white/60">
        <p>No conversations yet</p>
        <p className="text-sm mt-2">Click the + button to start chatting</p>
      </div>
    );
  }

  // Function to get the other participant (not the current user)
  const getOtherParticipant = (conversation: Conversation) => {
    if (!conversation.participants || conversation.participants.length !== 2) return null;
    return conversation.participants.find(p => p.user_id !== currentUserId);
  };

  return (
    <div className="divide-y divide-white/5">
      {conversations.map(conversation => {
        const otherParticipant = getOtherParticipant(conversation);
        
        // Skip rendering this conversation if we can't find the other participant
        if (!otherParticipant) return null;
        
        const username = otherParticipant.profile?.username || 'User';
        const avatarUrl = otherParticipant.profile?.avatar_url;
        const lastActive = otherParticipant.profile?.last_active;
        const initials = username.substring(0, 2).toUpperCase();
        const isSelected = selectedConversation?.id === conversation.id;
        const lastMessageText = conversation.lastMessage?.content || 'No messages yet';
        const lastMessageTime = conversation.lastMessage?.created_at 
          ? formatDistanceToNow(new Date(conversation.lastMessage.created_at), { addSuffix: true })
          : '';
        const isUnread = conversation.lastMessage && 
          !conversation.lastMessage.read && 
          conversation.lastMessage.sender_id !== currentUserId;

        return (
          <div
            key={conversation.id}
            className={`p-4 hover:bg-white/5 cursor-pointer transition-colors ${
              isSelected ? 'bg-white/10' : ''
            }`}
            onClick={() => onSelectConversation(conversation)}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={username} />
                  <AvatarFallback className="bg-crimson text-white">{initials}</AvatarFallback>
                </Avatar>
                {lastActive && (
                  <OnlineIndicator 
                    lastActive={lastActive} 
                    className="absolute -bottom-1 -right-1 border-2 border-gray-900" 
                  />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className={`font-medium ${isUnread ? 'text-white' : 'text-white/90'} truncate`}>
                    {username}
                  </p>
                  {lastMessageTime && (
                    <span className="text-xs text-white/50">{lastMessageTime}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <p className={`text-sm ${isUnread ? 'text-white font-medium' : 'text-white/70'} truncate`}>
                    {lastMessageText}
                  </p>
                  {isUnread && (
                    <div className="h-2 w-2 rounded-full bg-crimson"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationsList;
