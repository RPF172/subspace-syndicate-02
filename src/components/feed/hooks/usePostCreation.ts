
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase, ensureBucketExists } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface PostMedia {
  id: string;
  url: string;
  type: 'image' | 'video' | 'gif';
  aspectRatio?: number;
  duration?: number;
  file?: File;
  previewUrl?: string;
}

export interface Post {
  id: string;
  content: string;
  media?: PostMedia[];
  hashtags?: string[];
  created_at: string;
  user_id: string;
  user: {
    username: string;
    name?: string;
    avatar_url?: string;
  };
  likes: number;
  comments: number;
}

interface UsePostCreationProps {
  onPostCreated: (post: Post) => void;
}

export const usePostCreation = ({ onPostCreated }: UsePostCreationProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmitPost = async (
    mediaItems: PostMedia[],
    hashtags: string[]
  ) => {
    try {
      if (!content.trim() && mediaItems.length === 0) {
        setError('Please add some content or media to your post');
        return false;
      }
      
      if (!user) {
        setError('You must be logged in to create a post');
        return false;
      }
      
      setIsPosting(true);
      setError(null);
      
      const uploadedMedia: PostMedia[] = [];
      
      if (mediaItems.length > 0) {
        // Check if media bucket exists
        const bucketExists = await ensureBucketExists('post_media');
        
        if (!bucketExists) {
          // Try to create the bucket (this will likely fail on client side)
          // We'll handle the error gracefully
          try {
            toast({
              title: "Media storage issue",
              description: "Creating media storage... This might take a moment.",
            });
            
            // Call Edge Function to create bucket (if available)
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-media-bucket`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabase.auth.getSession()}`
              }
            });
            
            if (!response.ok) {
              throw new Error('Failed to create media bucket');
            }
            
          } catch (error) {
            console.error('Error creating media bucket:', error);
            setError('Media storage is not available. Please contact support or try again later.');
            setIsPosting(false);
            return false;
          }
        }
        
        // Upload each media file
        for (const item of mediaItems) {
          if (item.file) {
            const fileExt = item.file.name.split('.').pop();
            const fileName = `${user?.id}/${uuidv4()}-${item.file.name}`;
            const filePath = `${fileName}`;
            
            const { data, error: uploadError } = await supabase.storage
              .from('post_media')
              .upload(filePath, item.file);
              
            if (uploadError) {
              console.error('Upload error:', uploadError);
              if (uploadError.message.includes('storage/bucket-not-found')) {
                setError('Media storage is currently unavailable. Your post will be saved without media.');
                break;
              } else {
                throw uploadError;
              }
            }
            
            const { data: urlData } = supabase.storage
              .from('post_media')
              .getPublicUrl(filePath);
              
            uploadedMedia.push({
              id: item.id,
              url: urlData.publicUrl,
              type: item.type
            });
          }
        }
      }
      
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert({
          content,
          user_id: user?.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (postError) throw postError;
      
      if (uploadedMedia.length > 0) {
        const mediaInserts = uploadedMedia.map((media, index) => ({
          post_id: postData.id,
          url: media.url,
          type: media.type,
          position: index
        }));
        
        const { error: mediaError } = await supabase
          .from('post_media')
          .insert(mediaInserts);
          
        if (mediaError) throw mediaError;
      }
      
      if (hashtags && hashtags.length > 0) {
        const hashtagInserts = hashtags.map(tag => ({
          post_id: postData.id,
          hashtag: tag
        }));
        
        const { error: hashtagError } = await supabase
          .from('post_hashtags')
          .insert(hashtagInserts);
          
        if (hashtagError) throw hashtagError;
      }
      
      await supabase.channel('feed-updates').send({
        type: 'broadcast',
        event: 'new-post',
        payload: { 
          id: postData.id,
          user_id: user?.id,
          hashtags
        }
      });
      
      const newPost: Post = {
        id: postData.id,
        content: postData.content,
        media: uploadedMedia,
        hashtags,
        created_at: postData.created_at,
        user_id: user?.id || '',
        user: {
          username: user?.user_metadata?.username || '',
          avatar_url: user?.user_metadata?.avatar_url
        },
        likes: 0,
        comments: 0
      };
      
      setContent('');
      
      onPostCreated(newPost);
      return true;
    } catch (error: any) {
      console.error('Error creating post:', error);
      setError(error.message);
      return false;
    } finally {
      setIsPosting(false);
    }
  };
  
  return {
    content,
    setContent,
    isPosting,
    error,
    setError,
    handleSubmitPost
  };
};
