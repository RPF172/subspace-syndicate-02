
import { useState } from 'react';

export const MAX_HASHTAGS = 10;

export const useHashtagManager = (setError: (error: string | null) => void) => {
  const [hashtags, setHashtags] = useState<string[]>([]);
  
  const handleAddHashtag = (tag: string) => {
    if (hashtags.length >= MAX_HASHTAGS) {
      setError(`You can only add up to ${MAX_HASHTAGS} hashtags`);
      return;
    }
    
    const formattedTag = tag.startsWith('#') ? tag.substring(1).toLowerCase() : tag.toLowerCase();
    
    if (!formattedTag || hashtags.includes(formattedTag)) return;
    
    setHashtags(prev => [...prev, formattedTag]);
  };
  
  const handleRemoveHashtag = (tag: string) => {
    setHashtags(prev => prev.filter(t => t !== tag));
  };
  
  const resetHashtags = () => {
    setHashtags([]);
  };
  
  return {
    hashtags,
    setHashtags,
    handleAddHashtag,
    handleRemoveHashtag,
    resetHashtags
  };
};
