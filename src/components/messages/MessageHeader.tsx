
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, ArrowLeft, Trash2 } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import OnlineIndicator from '@/components/community/OnlineIndicator';
import { ConversationParticipant } from '@/types/messages';

interface MessageHeaderProps {
  otherParticipant: ConversationParticipant | null;
  onBack: () => void;
  onDeleteConversation: () => void;
  isDeleting: boolean;
}

const MessageHeader: React.FC<MessageHeaderProps> = ({
  otherParticipant,
  onBack,
  onDeleteConversation,
  isDeleting
}) => {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  
  // If we can't find the other participant, show a fallback
  if (!otherParticipant?.profile) {
    return (
      <div className="p-4 border-b border-white/10 bg-black/30 flex items-center">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="text-lg font-medium">Unknown User</div>
      </div>
    );
  }
  
  const username = otherParticipant.profile.username;
  const avatarUrl = otherParticipant.profile.avatar_url;
  const lastActive = otherParticipant.profile.last_active;
  const initials = username.substring(0, 2).toUpperCase();
  
  return (
    <>
      <div className="p-3 border-b border-white/10 bg-black/30 flex justify-between items-center">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2 md:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-9 w-9">
                <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={username} />
                <AvatarFallback className="bg-crimson text-white">{initials}</AvatarFallback>
              </Avatar>
              {lastActive && (
                <OnlineIndicator 
                  lastActive={lastActive} 
                  className="absolute -bottom-1 -right-1 border-2 border-gray-900 h-3 w-3" 
                />
              )}
            </div>
            
            <div>
              <h2 className="font-medium text-white">{username}</h2>
              {lastActive && <OnlineStatus lastActive={lastActive} />}
            </div>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-gray-900 border-white/10">
            <DropdownMenuItem 
              className="text-red-500 cursor-pointer" 
              onClick={() => setShowDeleteAlert(true)}
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="bg-gray-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Conversation?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              This will permanently delete the entire conversation history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 bg-gray-800 text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={onDeleteConversation}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// Helper component to display online status
const OnlineStatus: React.FC<{ lastActive: string }> = ({ lastActive }) => {
  const lastActiveDate = new Date(lastActive);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60));
  
  if (diffMinutes < 5) {
    return <span className="text-xs text-green-500">Online now</span>;
  }
  
  return null;
};

export default MessageHeader;
