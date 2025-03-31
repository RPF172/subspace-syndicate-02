import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';

interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
  last_active?: string;
}

interface NewConversationButtonProps {
  onConversationCreated: () => void;
}

const NewConversationButton: React.FC<NewConversationButtonProps> = ({ onConversationCreated }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    try {
      setIsSearching(true);
      setSearchQuery(query);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, last_active')
        .ilike('username', `%${query.trim()}%`)
        .neq('id', user?.id)
        .limit(10);
        
      if (error) throw error;
      
      setSearchResults(data || []);
    } catch (error: any) {
      console.error('Error searching for users:', error);
      toast({
        title: 'Error searching for users',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const startConversation = async (otherUserId: string) => {
    if (!user) return;
    
    try {
      setIsCreating(true);
      
      // Check if conversation already exists using RPC
      const { data: existingConversations } = await supabase.rpc(
        'get_user_conversations',
        { user_id: user.id }
      );
      
      if (existingConversations && existingConversations.length > 0) {
        // Check if the recipient is in any of these conversations
        const { data: participations } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', otherUserId)
          .in('conversation_id', existingConversations);
          
        if (participations && participations.length > 0) {
          toast({
            title: 'Conversation already exists',
            description: 'You already have a conversation with this user.',
          });
          setIsOpen(false);
          return;
        }
      }
      
      // Create new conversation - enforcing the two-participant model
      const { data: newConversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single();
        
      if (conversationError) throw conversationError;
      
      // Add exactly two participants: current user and the selected user
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          {
            conversation_id: newConversation.id,
            user_id: user.id,
          },
          {
            conversation_id: newConversation.id,
            user_id: otherUserId,
          }
        ]);
        
      if (participantsError) throw participantsError;
      
      toast({
        title: 'Conversation created',
        description: 'You can now start messaging!',
      });
      
      onConversationCreated();
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Error creating conversation',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <Button 
        size="icon" 
        onClick={() => setIsOpen(true)}
        className="bg-crimson hover:bg-crimson/80"
      >
        <Plus className="h-5 w-5" />
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-gray-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>New Conversation</DialogTitle>
          </DialogHeader>
          
          <SearchBar 
            onSearch={handleSearch}
            isSearching={isSearching}
          />
          
          <div className="max-h-80 overflow-y-auto">
            <SearchResults 
              results={searchResults}
              searchQuery={searchQuery}
              isSearching={isSearching}
              onSelectUser={startConversation}
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="border-white/20 text-white"
              disabled={isCreating}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewConversationButton;
