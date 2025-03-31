
import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface VolumeControlProps {
  isMuted: boolean;
  volume: number;
  toggleMute: () => void;
  handleVolumeChange: (value: number[]) => void;
}

const VolumeControl: React.FC<VolumeControlProps> = ({
  isMuted,
  volume,
  toggleMute,
  handleVolumeChange
}) => {
  return (
    <div className="flex items-center ml-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMute}
        className="text-white hover:bg-white/20"
      >
        {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </Button>
      
      <Slider
        value={[isMuted ? 0 : volume]}
        min={0}
        max={1}
        step={0.01}
        onValueChange={handleVolumeChange}
        className="w-20 ml-1"
      />
    </div>
  );
};

export default VolumeControl;
