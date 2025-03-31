
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type VideoStatus = 'processing' | 'ready' | 'failed';

interface VideoMetadata {
  duration?: number;
  width?: number;
  height?: number;
  format?: string;
  bitrate?: number;
}

interface UseVideoStatusProps {
  videoId: string;
  onStatusChange?: (status: VideoStatus, metadata?: VideoMetadata) => void;
}

export function useVideoStatus({ videoId, onStatusChange }: UseVideoStatusProps) {
  const [status, setStatus] = useState<VideoStatus | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchVideoStatus = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('videos')
          .select('status, duration, thumbnail_url, width, height, format, bitrate')
          .eq('id', videoId)
          .single();

        if (error) throw error;
        
        if (isMounted && data) {
          setStatus(data.status as VideoStatus);
          
          // Extract available metadata
          const videoMetadata: VideoMetadata = {};
          if (data.duration) videoMetadata.duration = data.duration;
          if (data.width) videoMetadata.width = data.width;
          if (data.height) videoMetadata.height = data.height;
          if (data.format) videoMetadata.format = data.format;
          if (data.bitrate) videoMetadata.bitrate = data.bitrate;
          
          setMetadata(videoMetadata);
          setIsLoading(false);
          
          if (onStatusChange && data.status) {
            onStatusChange(data.status as VideoStatus, videoMetadata);
          }
        }
      } catch (err) {
        console.error('Error fetching video status:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setIsLoading(false);
        }
      }
    };

    // Fetch initial status
    fetchVideoStatus();

    // Subscribe to changes
    const channel = supabase
      .channel('video-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'videos',
          filter: `id=eq.${videoId}`,
        },
        (payload) => {
          if (isMounted && payload.new) {
            const newStatus = payload.new.status as VideoStatus;
            setStatus(newStatus);
            
            // Extract available metadata from the update
            const videoMetadata: VideoMetadata = {};
            if (payload.new.duration) videoMetadata.duration = payload.new.duration;
            if (payload.new.width) videoMetadata.width = payload.new.width;
            if (payload.new.height) videoMetadata.height = payload.new.height;
            if (payload.new.format) videoMetadata.format = payload.new.format;
            if (payload.new.bitrate) videoMetadata.bitrate = payload.new.bitrate;
            
            setMetadata(videoMetadata);
            
            if (onStatusChange) {
              onStatusChange(newStatus, videoMetadata);
            }
          }
        }
      )
      .subscribe();

    // Clean up
    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [videoId, onStatusChange]);

  return { status, metadata, isLoading, error };
}
