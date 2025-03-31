
import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Button } from '@/components/ui/button';
import { X, GripVertical } from 'lucide-react';

interface MediaItemProps {
  id: string;
  type: 'image' | 'video' | 'gif';
  previewUrl: string;
  index: number;
  onRemove: (id: string) => void;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
}

const MediaItem: React.FC<MediaItemProps> = ({
  id,
  type,
  previewUrl,
  index,
  onRemove,
  onReorder
}) => {
  // Set up drag and drop
  const ref = React.useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: 'MEDIA_ITEM',
    item: () => {
      return { id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'MEDIA_ITEM',
    hover: (item: { id: string, index: number }, monitor) => {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      
      // Get horizontal middle
      const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
      
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      
      // Get pixels to the left
      const hoverClientX = clientOffset!.x - hoverBoundingRect.left;
      
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging right, only move when the cursor is below 50%
      // When dragging left, only move when the cursor is above 50%
      
      // Dragging right
      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
        return;
      }
      
      // Dragging left
      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
        return;
      }
      
      // Time to actually perform the action
      onReorder(dragIndex, hoverIndex);
      
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });
  
  drag(drop(ref));
  
  return (
    <div 
      ref={ref}
      className={`
        relative border border-white/10 rounded-md overflow-hidden
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
      style={{ width: '100px', height: '100px' }}
    >
      {type === 'video' ? (
        <video 
          src={previewUrl} 
          className="w-full h-full object-cover"
          muted
        />
      ) : (
        <img 
          src={previewUrl} 
          alt="Media preview" 
          className="w-full h-full object-cover"
        />
      )}
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 hover:bg-black/80 text-white"
        onClick={() => onRemove(id)}
      >
        <X className="h-3 w-3" />
      </Button>
      
      <div className="absolute top-1 left-1 cursor-move">
        <GripVertical className="h-4 w-4 text-white/70" />
      </div>
      
      {type === 'video' && (
        <div className="absolute bottom-1 left-1 bg-black/60 text-white/90 text-xs px-1 rounded">
          Video
        </div>
      )}
      {type === 'gif' && (
        <div className="absolute bottom-1 left-1 bg-black/60 text-white/90 text-xs px-1 rounded">
          GIF
        </div>
      )}
    </div>
  );
};

interface MediaUploaderProps {
  items: Array<{
    id: string;
    type: 'image' | 'video' | 'gif';
    previewUrl?: string;
  }>;
  onRemove: (id: string) => void;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({ 
  items,
  onRemove,
  onReorder
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <MediaItem
          key={item.id}
          id={item.id}
          type={item.type}
          previewUrl={item.previewUrl || ''}
          index={index}
          onRemove={onRemove}
          onReorder={onReorder}
        />
      ))}
    </div>
  );
};
