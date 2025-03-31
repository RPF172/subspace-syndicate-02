
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface WheelSettingsProps {
  onSpin: () => void;
}

const WheelSettings: React.FC<WheelSettingsProps> = ({ onSpin }) => {
  return (
    <div className="flex items-center justify-center space-x-4">
      <Button onClick={onSpin}>
        <ArrowRight className="mr-2 h-4 w-4" />
        Spin the Wheel
      </Button>
    </div>
  );
};

export default WheelSettings;
