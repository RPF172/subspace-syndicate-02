
import { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase, ensureBucketExists } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { PostMedia } from './usePostCreation';

export const MAX_MEDIA_ITEMS = 4;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const useMediaManager = (setError: (error: string | null) => void) => {
  const { user } = useAuth();
  const [mediaItems, setMediaItems] = useState<PostMedia[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bucketChecked, setBucketChecked] = useState(false);
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    // Check if post_media bucket exists if not already checked
    if (!bucketChecked) {
      try {
        const bucketExists = await ensureBucketExists('post_media');
        if (!bucketExists) {
          setError('Media storage is not available. Please contact support or try again later.');
          return;
        }
        setBucketChecked(true);
      } catch (error) {
        console.error('Error checking bucket existence:', error);
        setError('Could not verify media storage availability. Please try again later.');
        return;
      }
    }
    
    // Check if adding more files would exceed the limit
    if (mediaItems.length + e.target.files.length > MAX_MEDIA_ITEMS) {
      setError(`You can only upload up to ${MAX_MEDIA_ITEMS} media items per post.`);
      return;
    }
    
    const newMediaItems: PostMedia[] = [];
    
    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setError(`File ${file.name} exceeds the maximum allowed size of 10MB.`);
        continue;
      }
      
      // Create a media item
      const mediaItem: PostMedia = {
        id: uuidv4(),
        file,
        url: '', // Add empty url to match PostMedia interface
        previewUrl: URL.createObjectURL(file),
        type: file.type.startsWith('image/') 
          ? 'image' 
          : file.type.startsWith('video/') 
            ? 'video' 
            : 'gif'
      };
      
      // If it's an image, calculate aspect ratio
      if (mediaItem.type === 'image') {
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          setMediaItems(prev => 
            prev.map(item => 
              item.id === mediaItem.id 
                ? { ...item, aspectRatio } 
                : item
            )
          );
        };
        img.src = mediaItem.previewUrl;
      }
      
      // If it's a video, calculate duration and aspect ratio
      if (mediaItem.type === 'video') {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          const duration = video.duration;
          const aspectRatio = video.videoWidth / video.videoHeight;
          setMediaItems(prev => 
            prev.map(item => 
              item.id === mediaItem.id 
                ? { ...item, duration, aspectRatio } 
                : item
            )
          );
        };
        video.src = mediaItem.previewUrl;
      }
      
      newMediaItems.push(mediaItem);
    }
    
    if (newMediaItems.length > 0) {
      setMediaItems(prev => [...prev, ...newMediaItems]);
      setError(null);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleRemoveMedia = (id: string) => {
    setMediaItems(prev => {
      const filtered = prev.filter(item => item.id !== id);
      const removedItem = prev.find(item => item.id === id);
      
      // Revoke object URL to free memory
      if (removedItem?.previewUrl) {
        URL.revokeObjectURL(removedItem.previewUrl);
      }
      
      return filtered;
    });
  };
  
  const handleReorderMedia = (startIndex: number, endIndex: number) => {
    setMediaItems(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };
  
  const uploadMediaItems = async () => {
    if (!user) return [];
    
    // Check if post_media bucket exists
    try {
      const bucketExists = await ensureBucketExists('post_media');
      if (!bucketExists) {
        // Try creating it via client side admin fetch
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/create-media-bucket`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${supabase.auth.getSession()}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to create media bucket');
          }
          
          toast({
            title: 'Media storage created',
            description: 'You can now upload media files.',
          });
        } catch (error) {
          console.error('Error creating media bucket:', error);
          throw new Error('Media storage is not available. Please contact support or try again later.');
        }
      }
    } catch (error) {
      console.error('Error checking bucket existence:', error);
      throw new Error('Could not verify media storage availability. Please try again later.');
    }
    
    // Upload all files
    const uploadPromises = mediaItems
      .filter(item => item.file) // Only upload items with files
      .map(async (item) => {
        if (!item.file) return null;
        
        const fileExt = item.file.name.split('.').pop();
        const filePath = `${user.id}/${uuidv4()}.${fileExt}`;
        
        try {
          const { error: uploadError } = await supabase.storage
            .from('post_media')
            .upload(filePath, item.file);
            
          if (uploadError) throw uploadError;
          
          const { data: urlData } = supabase.storage
            .from('post_media')
            .getPublicUrl(filePath);
            
          return {
            id: item.id,
            url: urlData.publicUrl,
            type: item.type,
            aspectRatio: item.aspectRatio,
            duration: item.duration
          };
        } catch (error) {
          console.error('Error uploading file:', error);
          throw new Error(`Error uploading ${item.file.name}. Please try again.`);
        }
      });
      
    try {
      const uploadedItems = await Promise.all(uploadPromises);
      return uploadedItems.filter(Boolean);
    } catch (error) {
      console.error('Error uploading media items:', error);
      throw error;
    }
  };
  
  const resetMediaItems = () => {
    // Revoke object URLs to free memory
    mediaItems.forEach(item => {
      if (item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
    
    setMediaItems([]);
  };
  
  return {
    mediaItems,
    setMediaItems,
    fileInputRef,
    handleFileSelect,
    handleRemoveMedia,
    handleReorderMedia,
    uploadMediaItems,
    resetMediaItems
  };
};
