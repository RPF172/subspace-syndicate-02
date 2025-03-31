import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { X, GripVertical as Move, Image as ImageIcon, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Card } from '@/components/ui/card';

interface PostMedia {
  id: string;
  url: string;
  type: 'image' | 'video' | 'gif';
  aspectRatio?: number;
  duration?: number;
  file?: File;
  previewUrl?: string;
}

interface MediaPreviewProps {
  items: PostMedia[];
  onRemove: (id: string) => void;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
}

interface MediaItemProps {
  item: PostMedia;
  index: number;
  onRemove: (id: string) => void;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
}

// DnD item type
const MEDIA_ITEM = 'media-item';

// Individual draggable media item
const DraggableMediaItem: React.FC<MediaItemProps> = ({ item, index, onRemove, onReorder }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Define drag behavior
  const [{ isDragging }, drag] = useDrag({
    type: MEDIA_ITEM,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  // Define drop behavior
  const [, drop] = useDrop({
    accept: MEDIA_ITEM,
    hover: (draggedItem: { index: number }, monitor) => {
      if (!ref.current) return;
      
      const dragIndex = draggedItem.index;
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return;
      
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      
      // Get horizontal middle
      const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
      
      // Get mouse position
      const clientOffset = monitor.getClientOffset();
      
      // Get pixels to the left
      const hoverClientX = clientOffset!.x - hoverBoundingRect.left;
      
      // Only perform the move when the mouse has crossed half of the items width
      // Dragging right
      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) return;
      
      // Dragging left
      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) return;
      
      // Time to actually perform the action
      onReorder(dragIndex, hoverIndex);
      
      // Note: we're mutating the monitor item here!
      // This is generally not recommended, but we need to update the index
      draggedItem.index = hoverIndex;
    },
  });
  
  // Connect drag and drop refs
  drag(drop(ref));
  
  // Determine preview source
  const imageUrl = item.previewUrl || item.url;
  
  return (
    <div 
      ref={ref} 
      className={`relative group transition-transform ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      style={{ cursor: 'move' }}
    >
      <Card className="overflow-hidden border border-white/10 bg-black/30">
        {item.type === 'video' ? (
          <video 
            src={imageUrl}
            className="w-full h-[200px] object-cover"
            controls
          />
        ) : (
          <div className="relative w-full h-[200px]">
            <img 
              src={imageUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="absolute top-2 right-2 flex gap-1">
          <Button
            variant="default"
            size="icon"
            className="h-8 w-8 rounded-full bg-black/60 hover:bg-black/80 text-white"
            onClick={() => onRemove(item.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
          {item.type === 'video' ? (
            <Film className="h-3 w-3 mr-1" />
          ) : item.type === 'gif' ? (
            <span className="font-bold mr-1">GIF</span>
          ) : (
            <ImageIcon className="h-3 w-3 mr-1" />
          )}
          {item.file ? item.file.name.substring(0, 15) + '...' : 'Media'}
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
          <Move className="h-8 w-8 text-white" />
        </div>
      </Card>
    </div>
  );
};

export const MediaPreview: React.FC<MediaPreviewProps> = ({ items, onRemove, onReorder }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-300">Media Preview ({items.length}/5)</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {items.map((item, index) => (
          <DraggableMediaItem
            key={item.id}
            item={item}
            index={index}
            onRemove={onRemove}
            onReorder={onReorder}
          />
        ))}
      </div>
      
      <div className="text-xs text-gray-400 flex items-center">
        <Move className="h-3 w-3 mr-1" /> 
        Drag to reorder media
      </div>
    </div>
  );
};
