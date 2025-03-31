import React, { useState, useRef, useEffect } from 'react';
import VideoControls from './controls/VideoControls';
import VideoBuffering from './VideoBuffering';
import VideoTitle from './VideoTitle';
import { useVideoPlayer } from './hooks/useVideoPlayer';
import { useFullscreen } from './hooks/useFullscreen';
import { useControls } from './hooks/useControls';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type VideoPlayerProps = {
  videoUrl: string | string[]; // Can be a single URL or an array of URLs
  title?: string;
  autoPlay?: boolean;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoUrl, 
  title,
  autoPlay = false
}) => {
  // Handle multiple videos
  const [urls] = useState<string[]>(Array.isArray(videoUrl) ? videoUrl : [videoUrl]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const currentUrl = urls[currentVideoIndex];
  
  // Track swipe gesture
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const [startX, setStartX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const swipeThreshold = 50; // Minimum distance to trigger a swipe
  
  // Custom hooks for player functionality
  const { 
    videoRef, 
    isPlaying, 
    currentTime, 
    duration, 
    volume, 
    isMuted,
    isBuffering,
    togglePlay, 
    skip, 
    toggleMute, 
    handleTimeChange, 
    handleVolumeChange,
    setIsPlaying
  } = useVideoPlayer(currentUrl);
  
  const { 
    containerRef, 
    isFullscreen, 
    toggleFullscreen 
  } = useFullscreen();
  
  const { 
    showControls,
    setShowControls
  } = useControls(isPlaying, containerRef);
  
  // Navigation indicator refs
  const leftIndicatorRef = useRef<HTMLDivElement>(null);
  const rightIndicatorRef = useRef<HTMLDivElement>(null);
  
  // Play autoplay videos
  useEffect(() => {
    if (autoPlay) {
      setIsPlaying(true);
    }
  }, [autoPlay, setIsPlaying]);
  
  // Handle changing videos
  const goToNextVideo = () => {
    if (currentVideoIndex < urls.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };
  
  const goToPreviousVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };
  
  // Handle touch/mouse events for gesture navigation
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
    setIsDragging(true);
  };
  
  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!startX || !isDragging) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diffX = clientX - startX;
    
    if (Math.abs(diffX) > swipeThreshold) {
      setSwipeDirection(diffX > 0 ? 'right' : 'left');
      
      // Animate the indicators
      if (diffX > 0 && leftIndicatorRef.current && currentVideoIndex > 0) {
        leftIndicatorRef.current.style.opacity = Math.min(Math.abs(diffX) / 150, 0.8).toString();
      } else if (diffX < 0 && rightIndicatorRef.current && currentVideoIndex < urls.length - 1) {
        rightIndicatorRef.current.style.opacity = Math.min(Math.abs(diffX) / 150, 0.8).toString();
      }
    } else {
      setSwipeDirection(null);
      
      // Reset indicator opacity
      if (leftIndicatorRef.current) leftIndicatorRef.current.style.opacity = '0';
      if (rightIndicatorRef.current) rightIndicatorRef.current.style.opacity = '0';
    }
  };
  
  const handleTouchEnd = () => {
    if (!startX || !isDragging) return;
    
    if (swipeDirection === 'left' && currentVideoIndex < urls.length - 1) {
      goToNextVideo();
    } else if (swipeDirection === 'right' && currentVideoIndex > 0) {
      goToPreviousVideo();
    }
    
    // Reset state
    setStartX(null);
    setIsDragging(false);
    setSwipeDirection(null);
    
    // Reset indicator opacity
    if (leftIndicatorRef.current) leftIndicatorRef.current.style.opacity = '0';
    if (rightIndicatorRef.current) rightIndicatorRef.current.style.opacity = '0';
  };
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentVideoIndex < urls.length - 1) {
        goToNextVideo();
      } else if (e.key === 'ArrowLeft' && currentVideoIndex > 0) {
        goToPreviousVideo();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentVideoIndex, urls.length]);

  return (
    <div 
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group"
      ref={containerRef}
      onTouchStart={urls.length > 1 ? handleTouchStart : undefined}
      onTouchMove={urls.length > 1 ? handleTouchMove : undefined}
      onTouchEnd={urls.length > 1 ? handleTouchEnd : undefined}
      onMouseDown={urls.length > 1 ? handleTouchStart : undefined}
      onMouseMove={urls.length > 1 ? handleTouchMove : undefined}
      onMouseUp={urls.length > 1 ? handleTouchEnd : undefined}
      onMouseLeave={urls.length > 1 ? handleTouchEnd : undefined}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={currentUrl}
        onClick={togglePlay}
        className="w-full h-full object-contain"
        playsInline
      />
      
      {/* Navigation Indicators (for gesture-based navigation) */}
      {urls.length > 1 && (
        <>
          {/* Left indicator */}
          <div 
            ref={leftIndicatorRef}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/60 rounded-full w-12 h-12 flex items-center justify-center opacity-0 transition-opacity"
          >
            <ChevronLeft className="text-white" size={24} />
          </div>
          
          {/* Right indicator */}
          <div 
            ref={rightIndicatorRef}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/60 rounded-full w-12 h-12 flex items-center justify-center opacity-0 transition-opacity"
          >
            <ChevronRight className="text-white" size={24} />
          </div>
        </>
      )}
      
      {/* Loading overlay */}
      <VideoBuffering isBuffering={isBuffering} />
      
      {/* Video pagination indicator */}
      {urls.length > 1 && (
        <div className="absolute top-4 left-0 right-0 flex justify-center">
          <div className="bg-black/50 rounded-full px-3 py-1 flex space-x-2">
            {urls.map((_, index) => (
              <div 
                key={index}
                className={`w-2 h-2 rounded-full ${index === currentVideoIndex ? 'bg-crimson' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Title (only in fullscreen) */}
      <VideoTitle title={title} isFullscreen={isFullscreen} />
      
      {/* Controls */}
      <VideoControls
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        showControls={showControls}
        togglePlay={togglePlay}
        skip={skip}
        toggleMute={toggleMute}
        toggleFullscreen={toggleFullscreen}
        handleTimeChange={handleTimeChange}
        handleVolumeChange={handleVolumeChange}
        hasPrevious={currentVideoIndex > 0}
        hasNext={currentVideoIndex < urls.length - 1}
        onPrevious={goToPreviousVideo}
        onNext={goToNextVideo}
      />
      
      {/* Swipe animation overlay */}
      <AnimatePresence>
        {swipeDirection && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-r from-black/0 via-crimson/20 to-black/0 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoPlayer;
