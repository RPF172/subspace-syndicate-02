
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { formatTextWithHashtags } from '@/utils/hashtags';
import VideoPlayer from '@/components/ui/VideoPlayer';

interface PostContentProps {
  content: string;
  media_url: string | null;
  media_type: string | null;
  isEditing?: boolean;
  editedContent?: string;
  onEditChange?: (value: string) => void;
}

const PostContent: React.FC<PostContentProps> = ({
  content,
  media_url,
  media_type,
  isEditing = false,
  editedContent = '',
  onEditChange = () => {},
}) => {
  return (
    <div className="p-4">
      {isEditing ? (
        <Textarea
          value={editedContent}
          onChange={(e) => onEditChange(e.target.value)}
          placeholder="What's on your mind?"
          className="bg-black/20 border-white/20 min-h-[100px]"
        />
      ) : (
        <div className="text-white whitespace-pre-wrap break-words">
          {formatTextWithHashtags(content)}
        </div>
      )}
      
      {media_url && !isEditing && (
        <div className="mt-4 rounded-md overflow-hidden">
          {media_type === 'image' ? (
            <img 
              src={media_url}
              alt="Post media" 
              className="max-w-full object-contain rounded-md"
            />
          ) : media_type === 'video' ? (
            <VideoPlayer src={media_url} />
          ) : null}
        </div>
      )}
    </div>
  );
};

export default PostContent;
