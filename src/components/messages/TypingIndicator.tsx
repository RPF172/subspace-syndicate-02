import React from 'react';

interface TypingIndicatorProps {
  username: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ username }) => {
  return (
    <div className="px-4 py-2 text-white/70 flex items-center space-x-2">
      <span className="text-sm font-medium">{username} is typing</span>
      <div className="flex space-x-1">
        <div className="h-2 w-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="h-2 w-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="h-2 w-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};

export default TypingIndicator; 