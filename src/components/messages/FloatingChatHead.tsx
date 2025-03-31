
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Conversation } from '@/types/messages';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MessageView from './MessageView';

interface FloatingChatHeadProps {
  conversation: Conversation;
  currentUserId: string;
  onClose: () => void;
  index: number;
}

const FloatingChatHead: React.FC<FloatingChatHeadProps> = ({
  conversation,
  currentUserId,
  onClose,
  index
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  
  const otherParticipant = conversation.participants?.find(p => p.user_id !== currentUserId);
  const username = otherParticipant?.profile?.username || 'User';
  const avatarUrl = otherParticipant?.profile?.avatar_url;
  const initials = username.substring(0, 2).toUpperCase();
  
  // Calculate position based on index
  const positionFromRight = (index * 300) + 20;
  
  return (
    <motion.div
      initial={{ y: 20, opacity: 0, bottom: 0, right: positionFromRight }}
      animate={{ y: 0, opacity: 1, bottom: 0, right: positionFromRight }}
      exit={{ y: 20, opacity: 0 }}
      className="fixed z-50 flex flex-col"
      style={{ maxWidth: '280px', width: '280px' }}
    >
      <div 
        className="bg-gray-900 rounded-t-lg border border-white/10 flex items-center p-2 cursor-pointer shadow-lg"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <Avatar className="h-8 w-8 mr-2">
          <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={username} />
          <AvatarFallback className="bg-crimson text-white">{initials}</AvatarFallback>
        </Avatar>
        <span className="flex-1 font-medium text-white truncate">{username}</span>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/10"
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-white/70 hover:text-white hover:bg-red-500/20"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-black/20 border border-t-0 border-white/10 backdrop-blur-md rounded-b-lg shadow-lg overflow-hidden"
            style={{ height: '380px' }}
          >
            <div className="flex flex-col h-full">
              <MessageView 
                conversation={conversation}
                currentUserId={currentUserId}
                onBack={() => {}} // No-op since we handle this with the X button
                onConversationDeleted={onClose}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FloatingChatHead;
