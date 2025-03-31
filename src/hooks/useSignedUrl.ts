import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSignedUrl = (originalUrl: string, interval = 240000) => {
  const [signedUrl, setSignedUrl] = useState<string>(originalUrl);

  const refreshUrl = async () => {
    try {
      const { data } = await supabase
        .storage
        .from('album_media')
        .createSignedUrl(originalUrl, 300); // 5 minutes

      if (data?.signedUrl) {
        setSignedUrl(data.signedUrl);
      }
    } catch (error) {
      console.error('Error refreshing signed URL:', error);
      // Fallback to original URL if signing fails
      setSignedUrl(originalUrl);
    }
  };

  useEffect(() => {
    refreshUrl();
    
    // Refresh URL every 4 minutes
    const timer = setInterval(refreshUrl, interval);
    
    return () => clearInterval(timer);
  }, [originalUrl]);

  return signedUrl;
}; 