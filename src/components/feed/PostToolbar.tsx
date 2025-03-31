
import React from 'react';
import { Button } from '@/components/ui/button';
import { Image, Loader2 } from 'lucide-react';
import { HashtagInput } from './HashtagInput';
import { MAX_HASHTAGS } from './hooks/useHashtagManager';

interface PostToolbarProps {
  handleUploadClick: () => void;
  handleAddHashtag: (tag: string) => void;
  handleSubmitPost: () => void;
  hashtagCount: number;
  isPosting: boolean;
  isValid: boolean;
  mediaItemsCount: number;
  maxMediaItems: number;
}

const PostToolbar: React.FC<PostToolbarProps> = ({
  handleUploadClick,
  handleAddHashtag,
  handleSubmitPost,
  hashtagCount,
  isPosting,
  isValid,
  mediaItemsCount,
  maxMediaItems
}) => {
  return (
    <div className="flex items-center justify-between mt-4">
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white hover:bg-white/10"
          onClick={handleUploadClick}
          disabled={mediaItemsCount >= maxMediaItems || isPosting}
        >
          <Image className="h-5 w-5 mr-1" />
          Media
        </Button>
        
        <HashtagInput
          onAddHashtag={handleAddHashtag}
          maxHashtags={MAX_HASHTAGS}
          currentCount={hashtagCount}
          disabled={isPosting}
        />
      </div>
      
      <Button
        variant="default"
        className="bg-crimson hover:bg-crimson/90"
        onClick={handleSubmitPost}
        disabled={isPosting || !isValid}
      >
        {isPosting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Posting...
          </>
        ) : (
          'Post'
        )}
      </Button>
    </div>
  );
};

export default PostToolbar;
