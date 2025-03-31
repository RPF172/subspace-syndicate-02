import React, { Suspense } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route 
} from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Messages from './pages/Messages';
import Community from './pages/Community';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import ProfileView from './pages/ProfileView';
import HashtagSearch from './pages/HashtagSearch';
import NotFound from './pages/NotFound';
import SubSpaceTVBrowse from './pages/SubSpaceTVBrowse';
import SubSpaceTVUpload from './pages/SubSpaceTVUpload';
import SubSpaceTVMyContent from './pages/SubSpaceTVMyContent';
import VideoWatchPage from './pages/VideoWatchPage';
import NewsFeed from './pages/NewsFeed';
import AdminDashboard from './pages/AdminDashboard';
import AlbumsPage from './pages/AlbumsPage';
import AlbumDetailPage from './pages/AlbumDetailPage';
import MediaDetailPage from '@/pages/MediaDetailPage';

// Configure QueryClient with error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Simple fallback for suspense
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-crimson"></div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/messages/:conversationId" element={<Messages />} />
              <Route path="/community" element={<Community />} />
              <Route path="/feed" element={<NewsFeed />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:username" element={<ProfileView />} />
              <Route path="/hashtag/:tag" element={<HashtagSearch />} />
              <Route path="/subspacetv" element={<SubSpaceTVBrowse />} />
              <Route path="/subspacetv/upload" element={<SubSpaceTVUpload />} />
              <Route path="/subspacetv/my-content" element={<SubSpaceTVMyContent />} />
              <Route path="/subspacetv/watch/:id" element={<VideoWatchPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              
              {/* Album Routes */}
              <Route path="/albums" element={<AlbumsPage />} />
              <Route path="/albums/:albumId" element={<AlbumDetailPage />} />
              <Route path="/albums/:albumId/media/:mediaId" element={<MediaDetailPage />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
