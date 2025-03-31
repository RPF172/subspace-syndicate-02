
import React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type OnlineIndicatorProps = {
  lastActive?: string | null;
  className?: string;
  showTooltip?: boolean;
};

const OnlineIndicator: React.FC<OnlineIndicatorProps> = ({ 
  lastActive, 
  className,
  showTooltip = true
}) => {
  // Consider the user online if lastActive is not provided
  if (!lastActive) {
    // Just render a static indicator if lastActive is not provided
    return (
      <span 
        className={cn(
          "relative inline-block h-2 w-2 rounded-full bg-green-500", 
          className
        )} 
        aria-label="Online"
      >
        <span className="absolute top-0 left-0 h-full w-full rounded-full bg-green-500 animate-ping opacity-75"></span>
      </span>
    );
  }
  
  const lastActiveDate = new Date(lastActive);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60));
  
  // Consider users active if they've interacted in the last 5 minutes
  const isOnline = diffInMinutes < 5;
  
  // Format the last active time
  const formatLastActive = () => {
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    
    return lastActiveDate.toLocaleDateString();
  };
  
  const indicator = (
    <span 
      className={cn(
        "relative inline-block h-2 w-2 rounded-full", 
        isOnline ? "bg-green-500" : "bg-gray-400",
        className
      )} 
      aria-label={isOnline ? "Online" : "Offline"}
    >
      {isOnline && (
        <span className="absolute top-0 left-0 h-full w-full rounded-full bg-green-500 animate-ping opacity-75"></span>
      )}
    </span>
  );
  
  if (!showTooltip) return indicator;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {indicator}
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{isOnline ? 'Online' : `Last active ${formatLastActive()}`}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default OnlineIndicator;
