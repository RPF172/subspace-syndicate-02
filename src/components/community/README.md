# Community Live Group Chat System

This is a real-time group chat system for the Subspace Syndicate community. It allows users to chat with other active users in the community.

## Features

- Real-time messaging using Supabase Realtime
- User presence tracking
- Display of online users
- Message history
- User avatars and usernames
- Floating chat button with online user count
- Mobile-responsive design
- **Image and video sharing** - Users can upload and share images and videos in the chat
- **Real-time messaging between community members**
- **User presence tracking with online indicators**
- **Mobile-responsive chat interface**
- **Support for both text and media content**
- **Smooth animations and transitions**

## Implementation

### Database Setup

1. Run the SQL script in `src/integrations/supabase/schema/messages.sql` in your Supabase SQL editor to create:
   - The `community_chats` table (renamed from "messages")
   - Indexes for performance
   - Row Level Security policies
   - Real-time publication settings
   - Storage bucket for media files
   - Storage policies for secure access

### Components

1. **GroupChat.tsx**: The main chat component that handles:
   - Real-time message updates
   - User presence tracking
   - Message history
   - User interface for the chat
   - **Media file uploads and previews**
   - **Image and video display in messages**

2. **GroupChatButton.tsx**: A floating button component that:
   - Displays the number of online users
   - Opens and closes the chat interface
   - Provides a visual indicator for the chat

3. **Community.tsx**: Modified to:
   - Include the GroupChatButton component
   - Calculate the number of online users

## How It Works

1. When a user visits the Community page, they see a floating chat button in the bottom-right corner.
2. The button displays the number of online users (active in the last 5 minutes).
3. Clicking the button opens the group chat interface.
4. The chat interface includes:
   - A sidebar showing online users with their avatars
   - The chat area with message history
   - An input field to send new messages
   - **A paperclip button to attach images or videos**
5. Messages are delivered in real-time using Supabase's real-time subscriptions.
6. User presence is tracked through the `last_active` timestamp in the `profiles` table.

## Media Sharing

The system supports sharing images and videos in the chat:

1. **Supported media types**: 
   - Images: jpg, jpeg, png, gif, webp
   - Videos: mp4, webm, mov

2. **Size limits**: 
   - Maximum file size: 10MB

3. **Upload process**:
   - Files are uploaded to the Supabase storage bucket named 'media'
   - Files are stored in the path 'community/community_room/{uuid}.{extension}'
   - Upload progress is displayed to the user

4. **Media preview**:
   - Images are displayed inline with appropriate sizing
   - Videos are embedded with playback controls
   - Clicking an image opens it in a new tab for full-size viewing

5. **Security**:
   - Only authenticated users can upload media
   - Storage policies ensure users can only modify their own uploads
   - File types are validated on client-side before upload
   - Media is publicly viewable (suitable for a community chat)

## Technical Notes

- The chat uses a fixed room ID (`community_room`) for all community messages.
- Messages are limited to the most recent 50 to maintain performance.
- User presence is considered "online" if they were active within the last 5 minutes.
- The system uses Supabase Realtime for both message delivery and presence updates.
- Media files are stored and accessed through Supabase Storage.

## TypeScript Notes

If you encounter TypeScript errors related to imports, ensure you've updated your vite-env.d.ts file to include declarations for:
- react
- lucide-react
- framer-motion
- date-fns
- uuid

Also make sure your tsconfig.json has `"allowSyntheticDefaultImports": true` set in the compiler options.

## Table Renaming

- The database table has been renamed from "messages" to "community_chats" to more clearly indicate its purpose
- All real-time subscriptions, queries, and inserts have been updated to use the new table name
- The SQL schema file at `src/integrations/supabase/schema/messages.sql` has been updated with the new table name
- Components that interact with this table (GroupChat, GroupChatButton) have been modified to use the new name 