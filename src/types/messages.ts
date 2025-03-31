
export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  participants?: ConversationParticipant[];
  lastMessage?: Message;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  created_at: string;
  profile?: {
    username: string;
    avatar_url?: string;
    last_active?: string;
  };
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
  updated_at: string;
  sender?: {
    username: string;
    avatar_url?: string;
    last_active?: string;
  };
}

export interface TypingStatus {
  userId: string;
  username: string;
  isTyping: boolean;
  timestamp: string;
}
