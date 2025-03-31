
import React from 'react';
import { Card } from '@/components/ui/card';
import PostForm from './PostForm';
import PostsList from './PostsList';
import { useAuth } from '@/contexts/AuthContext';

interface FeedTabProps {
  userId?: string;
}

const FeedTab: React.FC<FeedTabProps> = ({ userId }) => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Post creation */}
      <Card className="bg-black/20 border-white/10 backdrop-blur-md p-6">
        <PostForm />
      </Card>

      {/* Posts list */}
      <PostsList />
    </div>
  );
};

export default FeedTab;
