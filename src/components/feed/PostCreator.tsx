
import React, { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { MediaPreview } from './MediaPreview';
import PostErrorAlert from './PostErrorAlert';
import PostToolbar from './PostToolbar';
import HashtagDisplay from './HashtagDisplay';
import { usePostCreation } from './hooks/usePostCreation';
import { useMediaManager, MAX_MEDIA_ITEMS } from './hooks/useMediaManager';
import { useHashtagManager } from './hooks/useHashtagManager';

interface PostCreatorProps {
  onPostCreated: (post: any) => void;
}

const PostCreator: React.FC<PostCreatorProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  
  const {
    content,
    setContent,
    isPosting,
    error,
    setError,
    handleSubmitPost
  } = usePostCreation({ onPostCreated });
  
  const {
    mediaItems,
    fileInputRef,
    handleFileSelect,
    handleRemoveMedia,
    handleReorderMedia,
    resetMediaItems
  } = useMediaManager(setError);
  
  const {
    hashtags,
    handleAddHashtag,
    handleRemoveHashtag,
    resetHashtags
  } = useHashtagManager(setError);
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setError(null);
  };
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const submitPost = async () => {
    const success = await handleSubmitPost(mediaItems, hashtags);
    if (success) {
      resetMediaItems();
      resetHashtags();
    }
  };
  
  return (
    <DndProvider backend={HTML5Backend}>
      <Card className="bg-black/30 border-white/10">
        <CardContent className="p-4">
          <div className="flex space-x-3">
            <Avatar className="h-10 w-10 border border-white/10">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-black/50">
                {user?.user_metadata?.username?.substring(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <Textarea
                value={content}
                onChange={handleContentChange}
                placeholder="What's on your mind?"
                className="min-h-[120px] bg-black/30 border-white/10 resize-none mb-3"
              />
              
              {mediaItems.length > 0 && (
                <div className="mt-3 mb-4">
                  <MediaPreview
                    items={mediaItems}
                    onRemove={handleRemoveMedia}
                    onReorder={handleReorderMedia}
                  />
                </div>
              )}
              
              <HashtagDisplay 
                hashtags={hashtags} 
                onRemove={handleRemoveHashtag} 
              />
              
              <PostErrorAlert error={error} />
              
              <PostToolbar
                handleUploadClick={handleUploadClick}
                handleAddHashtag={handleAddHashtag}
                handleSubmitPost={submitPost}
                hashtagCount={hashtags ? hashtags.length : 0}
                isPosting={isPosting}
                isValid={!!(content.trim() || mediaItems.length > 0)}
                mediaItemsCount={mediaItems.length}
                maxMediaItems={MAX_MEDIA_ITEMS}
              />
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                accept=".jpg,.jpeg,.png,.gif,.mp4,.mov"
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </DndProvider>
  );
};

export default PostCreator;
