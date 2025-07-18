import { useState, useRef, useCallback } from 'react';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitState {
  checkRateLimit: () => boolean;
  isLimited: boolean;
  remainingRequests: number;
  resetTime: number | null;
}

export function useRateLimit(config: RateLimitConfig): RateLimitState {
  const requestTimes = useRef<number[]>([]);
  const [isLimited, setIsLimited] = useState(false);
  const [remainingRequests, setRemainingRequests] = useState(config.maxRequests);
  const [resetTime, setResetTime] = useState<number | null>(null);

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Remove old requests outside the window
    requestTimes.current = requestTimes.current.filter(time => time > windowStart);

    const currentRequests = requestTimes.current.length;
    const remaining = Math.max(0, config.maxRequests - currentRequests);

    if (currentRequests >= config.maxRequests) {
      setIsLimited(true);
      setRemainingRequests(0);
      
      // Calculate when the rate limit will reset
      const oldestRequest = Math.min(...requestTimes.current);
      const resetAt = oldestRequest + config.windowMs;
      setResetTime(resetAt);
      
      return false;
    }

    // Allow the request
    requestTimes.current.push(now);
    setIsLimited(false);
    setRemainingRequests(remaining - 1);
    setResetTime(null);
    
    return true;
  }, [config.maxRequests, config.windowMs]);

  return { 
    checkRateLimit, 
    isLimited, 
    remainingRequests, 
    resetTime 
  };
}

// Predefined rate limit configurations
export const RATE_LIMITS = {
  FILE_UPLOAD: { maxRequests: 5, windowMs: 60 * 1000 }, // 5 uploads per minute
  API_CALL: { maxRequests: 60, windowMs: 60 * 1000 }, // 60 API calls per minute
  ADMIN_ACTION: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 admin actions per minute
} as const;