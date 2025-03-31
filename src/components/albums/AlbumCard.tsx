
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Album } from '@/types/albums';
import { formatDistanceToNow } from 'date-fns';
import { Eye, Heart, Lock, Image } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlbumCardProps {
  album: Album;
  className?: string;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ album, className }) => {
  return (
    <Link to={`/albums/${album.id}`}>
      <Card className={cn("overflow-hidden transition-transform hover:scale-[1.02]", className)}>
        <div className="relative aspect-[4/3]">
          {album.cover_image_url ? (
            <img 
              src={album.cover_image_url} 
              alt={album.title}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-black/40">
              <Image className="h-12 w-12 text-white/30" />
            </div>
          )}
          
          {album.privacy !== 'public' && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-black/60 backdrop-blur-sm">
                <Lock className="h-3 w-3 mr-1" />
                {album.privacy === 'private' ? 'Private' : 'Friends'}
              </Badge>
            </div>
          )}
        </div>
        
        <CardContent className="p-3">
          <h3 className="font-medium text-white truncate">{album.title}</h3>
          
          <div className="flex items-center justify-between mt-2 text-xs text-white/60">
            <div className="flex items-center gap-3">
              <span className="flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                {album.views}
              </span>
              <span className="flex items-center">
                <Heart className="h-3 w-3 mr-1" />
                {album.likes}
              </span>
            </div>
            
            <span>
              {formatDistanceToNow(new Date(album.created_at), { addSuffix: true })}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default AlbumCard;
