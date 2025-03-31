
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface ResultDisplayProps {
  result: string;
  onPlayAgain: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onPlayAgain }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-md shadow-md bg-black/30 border border-white/10">
      <h2 className="text-3xl font-bold text-white mb-4">Result: {result}</h2>
      <Button onClick={onPlayAgain}>
        Play Again
        <ArrowRight className="ml-2" />
      </Button>
    </div>
  );
};

export default ResultDisplay;
