
import React, { useRef, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Send, Image, Loader2 } from 'lucide-react';
import MediaPreview from './MediaPreview';
import EmojiPicker from './EmojiPicker';
import { supabase } from "@/integrations/supabase/client";

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (value: string) => void;
  onSendMessage: (e: React.FormEvent) => Promise<void>;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  isUploading: boolean;
  isSending: boolean;
  uploadProgress: number;
  isUserLoggedIn: boolean;
  roomId: string;
  userId?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  setNewMessage,
  onSendMessage,
  selectedFile,
  setSelectedFile,
  isUploading,
  isSending,
  uploadProgress,
  isUserLoggedIn,
  roomId,
  userId
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const lastTypingTime = useRef<number>(0);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        if (file.size <= 10 * 1024 * 1024) {
          setSelectedFile(file);
        } else {
          alert('File size exceeds 10MB limit');
        }
      } else {
        alert('Only image and video files are supported');
      }
    }
  };

  const handleRemoveSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(newMessage + emoji);
  };
  
  const sendTypingIndicator = async () => {
    if (!userId || !isUserLoggedIn) return;
    
    const now = new Date().getTime();
    
    // Throttle typing events to not spam the server
    if (now - lastTypingTime.current < 3000) return;
    
    lastTypingTime.current = now;
    
    try {
      await supabase.channel('typing-indicator')
        .send({
          type: 'broadcast',
          event: 'typing',
          payload: {
            user_id: userId,
            room_id: roomId,
            timestamp: new Date().toISOString()
          }
        });
      
      // Clear any existing timeout
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
      
      // Set a timeout to stop typing indicator after 3 seconds of inactivity
      typingTimeout.current = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    
    if (value.length > 0 && !isTyping) {
      setIsTyping(true);
      sendTypingIndicator();
    }
  };
  
  useEffect(() => {
    return () => {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    };
  }, []);

  return (
    <div className="p-3 border-t border-white/10 bg-black/30 flex-col">
      <MediaPreview selectedFile={selectedFile} onRemove={handleRemoveSelectedFile} />
      
      {isUploading && (
        <div className="w-full mb-2">
          <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-crimson" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-white/70 text-center mt-1">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}
      
      <form onSubmit={onSendMessage} className="flex w-full gap-2">
        <Input
          value={newMessage}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="bg-black/20 border-white/20"
          disabled={isSending || isUploading || !isUserLoggedIn}
        />
        
        <div className="flex">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <EmojiPicker onEmojiSelect={handleEmojiSelect} />
              </TooltipTrigger>
              <TooltipContent>
                <p>Add emoji</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 text-white/70 hover:text-white hover:bg-white/10"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSending || isUploading || !isUserLoggedIn}
                >
                  <Image className="h-5 w-5" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Attach image or video</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button 
            type="submit" 
            disabled={(!newMessage.trim() && !selectedFile) || isSending || isUploading || !isUserLoggedIn}
            className="bg-crimson hover:bg-crimson/80 ml-1"
          >
            {isSending || isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
