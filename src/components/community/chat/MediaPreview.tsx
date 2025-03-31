
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Play } from 'lucide-react';

interface MediaPreviewProps {
  selectedFile: File | null;
  onRemove: () => void;
}

const MediaPreview: React.FC<MediaPreviewProps> = ({ selectedFile, onRemove }) => {
  if (!selectedFile) return null;
  
  const objectUrl = URL.createObjectURL(selectedFile);
  const isImage = selectedFile.type.startsWith('image/');
  
  return (
    <div className="relative rounded-md overflow-hidden mb-2 border border-white/20">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 z-10"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>
      
      {isImage ? (
        <img 
          src={objectUrl} 
          alt="Selected media" 
          className="max-h-32 object-contain"
          onLoad={() => URL.revokeObjectURL(objectUrl)}
        />
      ) : (
        <div className="bg-black/40 h-32 flex items-center justify-center">
          <Play className="h-8 w-8 text-white/80" />
          <span className="ml-2 text-white/80 text-sm">{selectedFile.name}</span>
        </div>
      )}
    </div>
  );
};

export default MediaPreview;
