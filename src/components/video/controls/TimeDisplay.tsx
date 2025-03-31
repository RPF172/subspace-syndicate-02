
import React from 'react';

interface TimeDisplayProps {
  currentTime: number;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({ currentTime }) => {
  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <span className="text-white text-xs mx-2">{formatTime(currentTime)}</span>
  );
};

export default TimeDisplay;
