import { useState, useEffect, useRef, MutableRefObject } from 'react';

export const useControls = (isPlaying: boolean, containerRef: MutableRefObject<HTMLElement | null>) => {
  const [showControls, setShowControls] = useState(true);
  const timeoutRef = useRef<number | null>(null);
  
  // Hide controls after a delay when playing
  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Show controls immediately
    setShowControls(true);
    
    // If video is playing, hide controls after a delay
    if (isPlaying) {
      timeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
        timeoutRef.current = null;
      }, 3000);
    }
    
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [isPlaying]);
  
  // Show controls on mouse move and touch
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const showControlsTemporarily = () => {
      setShowControls(true);
      
      // Hide controls after a delay if video is playing
      if (isPlaying) {
        if (timeoutRef.current !== null) {
          window.clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = window.setTimeout(() => {
          setShowControls(false);
          timeoutRef.current = null;
        }, 3000);
      }
    };
    
    container.addEventListener('mousemove', showControlsTemporarily);
    container.addEventListener('touchstart', showControlsTemporarily);
    
    return () => {
      container.removeEventListener('mousemove', showControlsTemporarily);
      container.removeEventListener('touchstart', showControlsTemporarily);
    };
  }, [containerRef, isPlaying]);
  
  return { showControls, setShowControls };
};
