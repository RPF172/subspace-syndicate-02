
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import PostCard from '@/components/ui/PostCard';
import ConfirmationDialog from './post/ConfirmationDialog';
import PostMenu from './post/PostMenu';
import CommentForm from './post/CommentForm';
import CommentsList from './post/CommentsList';
import { usePostInteractions } from './hooks/usePostInteractions';
import { usePostManagement } from './hooks/usePostManagement';
import { usePostComments } from './hooks/usePostComments';

interface ProfileData {
  username?: string;
  avatar_url?: string;
  bdsm_role?: string;
}

interface PostWithProfile {
  id: string;
  content: string;
  created_at: string | null;
  user_id: string;
  media_url: string | null;
  media_type: string | null;
  profiles?: ProfileData;
  username?: string;
  avatar_url?: string;
  bdsm_role?: string;
}

const PostItem = ({ post }: { post: PostWithProfile }) => {
  const { user } = useAuth();
  
  // Check if current user is the post owner
  const isCurrentUser = user?.id === post.user_id;
  
  // Use our custom hooks
  const interactions = usePostInteractions({ 
    postId: post.id, 
    userId: user?.id 
  });
  
  const management = usePostManagement({
    postId: post.id,
    initialContent: post.content
  });
  
  const commentSystem = usePostComments({
    postId: post.id,
    userId: user?.id
  });

  // Create media array for PostCard if media exists
  const mediaArray = post.media_url ? [
    {
      url: post.media_url,
      type: post.media_type as any || 'image'
    }
  ] : [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      layout
      className="overflow-hidden"
    >
      <PostCard 
        id={post.id}
        author={{
          id: post.user_id,
          name: post.username || "Anonymous",
          username: post.username || "user",
          avatarUrl: post.avatar_url || undefined,
          verified: post.bdsm_role === "Verified" // Just an example condition
        }}
        content={management.isEditing ? management.editedContent : post.content}
        media={mediaArray}
        stats={{
          likes: interactions.likeCount,
          comments: commentSystem.comments.length,
          reposts: 0,
          views: 0
        }}
        timestamp={post.created_at || new Date().toISOString()}
        isLiked={interactions.isLiked}
        isBookmarked={interactions.isBookmarked}
        isReposted={interactions.isReposted}
        onLike={interactions.toggleLike}
        onComment={() => commentSystem.toggleShowAllComments()}
        onRepost={interactions.handleRepost}
        onShare={interactions.handleShare}
        onBookmark={interactions.toggleBookmark}
        showBorder={true}
        interactive={true}
      />
      
      {/* Comments section - kept separate from the card for now */}
      {commentSystem.showAllComments && (
        <div className="border-t border-white/10 bg-black/30 rounded-b-lg overflow-hidden">
          <CommentsList 
            comments={commentSystem.comments}
            loading={commentSystem.loadingComments}
            showAllComments={commentSystem.showAllComments}
            toggleShowAllComments={commentSystem.toggleShowAllComments}
            onReply={commentSystem.replyToComment}
          />
          <CommentForm 
            onSubmit={commentSystem.submitComment}
            disabled={false}
          />
        </div>
      )}
      
      {/* These dialogs are kept outside of the PostCard for simplicity */}
      <PostMenu 
        isOpen={management.showMenu}
        onClose={() => management.setShowMenu(false)}
        onEdit={management.handleEditClick}
        onDelete={management.handleDeleteClick}
        onFlag={management.handleFlagClick}
        isOwner={isCurrentUser}
      />
      
      <ConfirmationDialog
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        isOpen={management.showConfirmation}
        onClose={() => management.setShowConfirmation(false)}
        onCancel={() => management.setShowConfirmation(false)}
        onConfirm={management.deletePost}
        isLoading={management.loadingDelete}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
      
      <ConfirmationDialog
        title="Flag Post"
        message="Are you sure you want to flag this post as inappropriate? This will send a report to the moderators."
        isOpen={management.showFlagConfirmation}
        onClose={() => management.setShowFlagConfirmation(false)}
        onCancel={() => management.setShowFlagConfirmation(false)}
        onConfirm={management.flagPost}
        isLoading={false}
        confirmLabel="Flag"
        cancelLabel="Cancel"
      />
    </motion.div>
  );
};

export default PostItem;
