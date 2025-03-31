
import React from 'react';

interface VideoBufferingProps {
  isBuffering: boolean;
}

const VideoBuffering: React.FC<VideoBufferingProps> = ({ isBuffering }) => {
  if (!isBuffering) return null;
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crimson"></div>
    </div>
  );
};

export default VideoBuffering;
