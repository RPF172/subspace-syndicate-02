
import React from 'react';

interface VideoTitleProps {
  title?: string;
  isFullscreen: boolean;
}

const VideoTitle: React.FC<VideoTitleProps> = ({ title, isFullscreen }) => {
  if (!isFullscreen || !title) return null;
  
  return (
    <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
      <h3 className="text-white font-medium">{title}</h3>
    </div>
  );
};

export default VideoTitle;
