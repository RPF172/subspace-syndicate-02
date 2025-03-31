# SubSpace Syndicate

A feature-rich social networking platform designed for community building, content sharing, and interaction.

## Project Overview

SubSpace Syndicate is a comprehensive social networking platform built with modern web technologies. The application includes features for user profiles, content sharing, messaging, video streaming, and community interaction.

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: React Context API, TanStack Query
- **Authentication**: Supabase Auth
- **Database**: Prisma with Supabase
- **Routing**: React Router
- **UI Enhancements**: Framer Motion, Lucide icons

## Features

### Authentication
- User registration and login via Supabase
- Protected routes and authenticated layouts
- Persistent login sessions

### User Profiles
- Customizable user profiles
- Profile photos and bio information
- Profile viewing for other users
- BDSM role specification
- Profile tabs for different content types

### Dashboard
- Personalized feed with content from connections
- Trending content tab
- Video content tab
- Active users display
- Post creation and viewing

### Content Creation and Sharing
- Post creation with text
- Interactive post lists
- Social interactions (likes, comments)
- Hashtag support and searching
- Content categorization

### SubSpace TV
- Video upload functionality
- Video browsing interface
- Personal content management
- Video watching experience

### Messaging System
- Private messaging between users
- Conversation history
- Real-time chat capabilities
- Conversation management

### Community Features
- Community posts and discussions
- Community interaction
- Hashtag-based content discovery

### News Feed
- Customized content feed
- Content filtering options
- Recent activity display

### Creator Program
- Creator application process
- Identity verification
- Tax and payment information management
- Creator profiles with specializations
- Legal agreements and documentation

## Components

### Layout Components
- `AuthenticatedLayout`: Base layout for authenticated pages with sidebar
- `DashboardSidebar`: Navigation sidebar for the dashboard
- `Navbar`: Main navigation bar
- `Footer`: Site footer with links and information

### Authentication Components
- Auth forms for login and registration
- Password reset functionality

### Feed Components
- Post creation forms
- Post lists and individual post displays
- Interaction elements (likes, comments)

### Profile Components
- `ProfileHeader`: User profile information display
- `ProfileTabs`: Tab navigation for different profile sections
- `UserProfile`: User profile components

### Video Components
- Video player
- Video upload interface
- Video browsing components

### Community Components
- Community posts and interactions
- Trending topics

### UI Components
- Custom UI components built on shadcn/ui
- Modal dialogs
- Tooltips and popovers
- Form elements
- Navigation menus
- Notification components

### Utility Components
- Loading indicators
- Error displays
- Empty state placeholders

## Routes
- `/`: Landing page
- `/auth`: Authentication page
- `/dashboard`: User dashboard
- `/messages`: Messaging interface
- `/messages/:conversationId`: Specific conversation
- `/community`: Community page
- `/feed`: News feed
- `/settings`: User settings
- `/profile`: Current user profile
- `/profile/:username`: Other user profiles
- `/hashtag/:tag`: Hashtag search results
- `/subspacetv`: Video browsing
- `/subspacetv/upload`: Video uploads
- `/subspacetv/my-content`: User's video content
- `/subspacetv/watch/:id`: Video watching

## Models/Database Schema
- `CreatorApplication`: Creator program applications
- `Identity`: User identity verification
- `TaxInfo`: Creator tax information
- `PaymentInfo`: Payment processing details
- `CreatorProfile`: Public creator profile information
- `Agreement`: Legal agreements

## Setup and Installation

```sh
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd subspace-syndicate-01

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Development

The project is built with Vite for fast development and optimized production builds. It uses TypeScript for type safety and includes ESLint for code quality.

## Deployment

The project can be deployed using the standard Vite build process:

```sh
npm run build
```

This will generate optimized production files in the `dist` directory that can be deployed to any static hosting service.
