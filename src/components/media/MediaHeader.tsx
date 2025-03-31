import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface MediaHeaderProps {
  albumId: string;
}

const MediaHeader: React.FC<MediaHeaderProps> = ({ albumId }) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Link to={`/albums/${albumId}`}>
        <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Album
        </Button>
      </Link>
    </div>
  );
};

export default MediaHeader;
