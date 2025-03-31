
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { MediaItem } from '@/types/albums';

interface MediaInfoProps {
  mediaItem: MediaItem;
  getUsername: (profile: any) => string;
}

const MediaInfo: React.FC<MediaInfoProps> = ({ mediaItem, getUsername }) => {
  return (
    <Card className="bg-black/20 border-white/10 mb-4">
      <CardHeader className="pb-2">
        <h3 className="text-lg font-medium text-white">About this media</h3>
      </CardHeader>
      <CardContent>
        {mediaItem.description && (
          <p className="text-white/70 mb-4">{mediaItem.description}</p>
        )}
        
        <div className="space-y-2 text-sm">
          {mediaItem.album && (
            <div className="flex justify-between">
              <span className="text-white/60">Album</span>
              <Link to={`/albums/${mediaItem.album.id}`} className="text-crimson hover:underline">
                {mediaItem.album.title}
              </Link>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-white/60">Uploaded by</span>
            <span className="text-white">
              {mediaItem.profile && getUsername(mediaItem.profile) ? 
                <Link to={`/profile/${getUsername(mediaItem.profile)}`} className="text-white hover:text-crimson">
                  {getUsername(mediaItem.profile)}
                </Link> : 
                'Unknown user'
              }
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-white/60">Uploaded</span>
            <span className="text-white">
              {formatDistanceToNow(new Date(mediaItem.created_at), { addSuffix: true })}
            </span>
          </div>
          
          {mediaItem.file_type.startsWith('image/') && mediaItem.width && mediaItem.height && (
            <div className="flex justify-between">
              <span className="text-white/60">Dimensions</span>
              <span className="text-white">{mediaItem.width} × {mediaItem.height}</span>
            </div>
          )}
          
          {mediaItem.file_type.startsWith('video/') && mediaItem.duration && (
            <div className="flex justify-between">
              <span className="text-white/60">Duration</span>
              <span className="text-white">
                {Math.floor(mediaItem.duration / 60)}m {mediaItem.duration % 60}s
              </span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-white/60">File type</span>
            <span className="text-white">{mediaItem.file_type.split('/')[1].toUpperCase()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MediaInfo;
