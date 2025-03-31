
import React, { useState } from 'react';
import PostCard from '@/components/ui/PostCard';
import { toast } from '@/hooks/use-toast';

const PostCardExample: React.FC = () => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isReposted, setIsReposted] = useState(false);
  const [likeCount, setLikeCount] = useState(522);
  
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    
    if (!isLiked) {
      toast({
        title: 'Post liked',
        description: 'You liked this post.',
      });
    }
  };
  
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    
    toast({
      title: isBookmarked ? 'Bookmark removed' : 'Post bookmarked',
      description: isBookmarked 
        ? 'This post has been removed from your bookmarks.'
        : 'This post has been added to your bookmarks.',
    });
  };
  
  const handleRepost = () => {
    setIsReposted(!isReposted);
    
    toast({
      title: isReposted ? 'Repost removed' : 'Post reposted',
      description: isReposted 
        ? 'Your repost has been removed.'
        : 'You reposted this post to your profile.',
    });
  };
  
  const handleComment = () => {
    toast({
      title: 'Comment',
      description: 'Comment feature will be implemented soon.',
    });
  };
  
  const handleShare = () => {
    toast({
      title: 'Share options',
      description: 'Share feature will be implemented soon.',
    });
  };

  return (
    <div className="max-w-lg mx-auto my-8">
      <h2 className="text-2xl font-bold mb-4 text-white">Twitter-Style Post Card</h2>
      
      {/* Example with multiple media items */}
      <PostCard
        id="post-1"
        author={{
          id: "user-1",
          name: "Elon Musk",
          username: "elonmusk",
          avatarUrl: "https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg",
          verified: true,
        }}
        content="Ask Grok to transform your image"
        media={[
          {
            url: "/lovable-uploads/8baca5a6-760b-431a-81b5-8496e5b8a9c1.png",
            type: "image",
          },
          {
            url: "https://images.unsplash.com/photo-1564865878688-9a244444042a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
            type: "image",
          },
          {
            url: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
            type: "image",
          },
        ]}
        stats={{
          likes: likeCount,
          comments: 3500,
          reposts: 5300,
          views: 7200000,
        }}
        timestamp="2023-11-12T12:00:00Z"
        isLiked={isLiked}
        isBookmarked={isBookmarked}
        isReposted={isReposted}
        onLike={handleLike}
        onComment={handleComment}
        onRepost={handleRepost}
        onShare={handleShare}
        onBookmark={handleBookmark}
        showBorder={true}
      />
      
      {/* Example with text only */}
      <PostCard
        id="post-2"
        author={{
          id: "user-2",
          name: "Sam Altman",
          username: "sama",
          avatarUrl: "https://pbs.twimg.com/profile_images/1362766221850087425/bXKWOI5o_400x400.jpg",
          verified: true,
        }}
        content="The hardest part about shaping AGI well is getting all the subtle details right—the wrong answer at high confidence is obviously bad, but it takes detailed attention and a lot of product iteration to help models that have low confidence about an answer express that well."
        stats={{
          likes: 352,
          comments: 72,
          reposts: 41,
          views: 25400,
        }}
        timestamp="2023-11-10T09:15:00Z"
        onLike={() => {}}
        onComment={() => {}}
        onRepost={() => {}}
        onShare={() => {}}
        onBookmark={() => {}}
        showBorder={true}
      />
    </div>
  );
};

export default PostCardExample;
