import React from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, 
  SkipBack, SkipForward, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import VolumeControl from './VolumeControl';
import TimeDisplay from './TimeDisplay';

interface VideoControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  showControls: boolean;
  togglePlay: () => void;
  skip: (seconds: number) => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  handleTimeChange: (value: number[]) => void;
  handleVolumeChange?: (value: number[]) => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  showControls,
  togglePlay,
  skip,
  toggleMute,
  toggleFullscreen,
  handleTimeChange,
  handleVolumeChange,
  hasPrevious = false,
  hasNext = false,
  onPrevious,
  onNext
}) => {
  // Use the volume change handler if provided, otherwise fallback to time change handler
  const onVolumeChange = handleVolumeChange || handleTimeChange;
  
  return (
    <div 
      className={`absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      } pointer-events-none`}
    >
      {/* Center play/pause button (large) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlay}
          className="w-16 h-16 text-white bg-black/30 hover:bg-black/50 rounded-full"
        >
          {isPlaying ? <Pause size={32} /> : <Play size={32} />}
        </Button>
      </div>
      
      {/* Multi-video navigation buttons */}
      {(hasPrevious || hasNext) && (
        <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-auto">
          {hasPrevious && onPrevious && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrevious}
              className="w-10 h-10 text-white bg-black/30 hover:bg-black/50 rounded-full"
            >
              <ChevronLeft size={24} />
            </Button>
          )}
          
          <div className="flex-1"></div>
          
          {hasNext && onNext && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onNext}
              className="w-10 h-10 text-white bg-black/30 hover:bg-black/50 rounded-full"
            >
              <ChevronRight size={24} />
            </Button>
          )}
        </div>
      )}
      
      <div className="z-10 pointer-events-auto">
        {/* Progress bar */}
        <div className="flex items-center mb-2">
          <TimeDisplay currentTime={currentTime} />
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 100}
            step={0.1}
            onValueChange={handleTimeChange}
            className="flex-1 mx-2"
          />
          <TimeDisplay currentTime={duration} />
        </div>
        
        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => skip(-10)}
              className="text-white hover:bg-white/20"
            >
              <SkipBack size={20} />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => skip(10)}
              className="text-white hover:bg-white/20"
            >
              <SkipForward size={20} />
            </Button>
            
            <VolumeControl 
              isMuted={isMuted} 
              volume={volume} 
              toggleMute={toggleMute} 
              handleVolumeChange={onVolumeChange}
            />
          </div>
          
          <div className="flex items-center gap-1">
            {/* Multi-video navigation buttons (small) */}
            {hasPrevious && onPrevious && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onPrevious}
                className="text-white hover:bg-white/20"
              >
                <ChevronLeft size={20} />
              </Button>
            )}
            
            {hasNext && onNext && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onNext}
                className="text-white hover:bg-white/20"
              >
                <ChevronRight size={20} />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              <Maximize size={20} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoControls;
