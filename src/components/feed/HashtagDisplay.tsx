
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface HashtagDisplayProps {
  hashtags: string[];
  onRemove: (tag: string) => void;
}

const HashtagDisplay: React.FC<HashtagDisplayProps> = ({ hashtags, onRemove }) => {
  if (!hashtags || hashtags.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-2 mt-3 mb-4">
      {hashtags.map(tag => (
        <Badge
          key={tag}
          variant="secondary"
          className="bg-blue-900/30 hover:bg-blue-800/40 text-blue-300 flex items-center gap-1"
        >
          #{tag}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 rounded-full hover:bg-blue-800/60 p-0"
            onClick={() => onRemove(tag)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
    </div>
  );
};

export default HashtagDisplay;
