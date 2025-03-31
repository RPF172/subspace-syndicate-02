import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, X, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GroupChat from './GroupChat';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface GroupChatButtonProps {
  onlineCount?: number;
}

const GroupChatButton: React.FC<GroupChatButtonProps> = ({ onlineCount = 0 }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const COMMUNITY_ROOM_ID = 'community_room';

  React.useEffect(() => {
    // Set up real-time listener for new messages
    const subscription = supabase
      .channel('public:community_chats')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'community_chats',
          filter: `room_id=eq.${COMMUNITY_ROOM_ID}`
        }, 
        () => {
          if (!isOpen) {
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && <GroupChat isOpen={isOpen} onClose={() => setIsOpen(false)} />}
      </AnimatePresence>
      
      <Button 
        onClick={toggleChat}
        className="fixed bottom-4 right-4 z-40 h-12 px-4 bg-crimson hover:bg-crimson/90 shadow-lg flex items-center gap-2"
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <>
            <MessageSquare className="h-5 w-5" />
            <Maximize2 className="h-4 w-4" />
          </>
        )}
        <span className="ml-1">
          {isOpen ? "Close Chat" : "Full Screen Chat"}
        </span>
        {!isOpen && unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="ml-1"
          >
            <Badge variant="crimson" className="font-bold">
              {unreadCount}
            </Badge>
          </motion.div>
        )}
      </Button>
    </>
  );
};

export default GroupChatButton;
