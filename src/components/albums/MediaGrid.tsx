import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MediaItem } from '@/types/albums';
import { Eye, Heart, Clock, Image, FileVideo } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';

interface MediaGridProps {
  mediaItems: MediaItem[];
  albumId: string;
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  onDeleteMedia?: (mediaId: string) => Promise<boolean>;
}

// Helper function to format duration
const formatDuration = (seconds: number | null): string => {
  if (!seconds) return '';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const MediaGrid: React.FC<MediaGridProps> = ({ mediaItems, albumId, onDeleteMedia }) => {
  // Calculate grid layout
  const getMediaLayout = (items: MediaItem[]) => {
    if (!items || items.length === 0) return [];
    
    // Determine aspect ratios and sizes for the mosaic layout
    return items.map(item => {
      const aspectRatio = item.width && item.height 
        ? item.width / item.height 
        : 1;
      
      // Calculate span classes based on aspect ratio and position
      let spanClass = 'col-span-1 row-span-1';
      
      // Make some items larger based on aspect ratio
      if (aspectRatio > 1.5) {
        spanClass = 'col-span-2 row-span-1';
      } else if (aspectRatio < 0.7) {
        spanClass = 'col-span-1 row-span-2';
      }
      
      return {
        ...item,
        spanClass
      };
    });
  };
  
  const layoutItems = getMediaLayout(mediaItems);
  
  if (!mediaItems || mediaItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-white/60">
        <Image className="h-12 w-12 mb-4 opacity-50" />
        <p>No media items in this album yet</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {layoutItems.map(item => (
        <Link 
          key={item.id} 
          to={`/albums/${albumId}/media/${item.id}`}
          className={`block transition-transform hover:scale-[1.02]`}
        >
          <div className="relative aspect-square">
            {item.file_type.startsWith('image/') ? (
              <img 
                src={item.thumbnail_url || item.url} 
                alt={item.description || 'Album media'} 
                className="object-cover w-full h-full rounded-md"
              />
            ) : item.file_type.startsWith('video/') ? (
              <div className="relative w-full h-full">
                <img 
                  src={item.thumbnail_url || item.url} 
                  alt={item.description || 'Video thumbnail'} 
                  className="object-cover w-full h-full rounded-md"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/50 rounded-full p-3">
                    <FileVideo className="h-8 w-8 text-white" />
                  </div>
                </div>
                {item.duration && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDuration(item.duration)}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black/40 rounded-md">
                <Image className="h-12 w-12 text-white/30" />
              </div>
            )}
          </div>
          
          <div className="mt-2">
            {item.description && (
              <p className="text-sm text-white truncate">{item.description}</p>
            )}
            
            <div className="flex items-center justify-between mt-1 text-xs text-white/60">
              <div className="flex items-center gap-3">
                <span className="flex items-center">
                  <Eye className="h-3 w-3 mr-1" />
                  {item.views}
                </span>
                <span className="flex items-center">
                  <Heart className="h-3 w-3 mr-1" />
                  {item.likes}
                </span>
              </div>
              
              <span className="text-xs">
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default MediaGrid;
