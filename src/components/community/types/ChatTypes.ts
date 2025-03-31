export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  media_url?: string | null;
  media_type?: string | null;
  created_at: string;
  username?: string;
  avatar_url?: string;
  read_by?: string[]; // Array of user IDs who read this message
  isOptimistic?: boolean; // Flag to identify locally added messages before server confirmation
}

export interface MessageFromDB {
  id: string;
  content: string;
  sender_id?: string;
  conversation_id?: string;
  created_at: string;
  read?: boolean;
  updated_at?: string;
}

export interface TypingIndicator {
  user_id: string;
  username?: string;
  avatar_url?: string;
  timestamp: string;
  expired?: boolean; // Added to help remove typing indicators
}
