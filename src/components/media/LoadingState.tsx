import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const LoadingState: React.FC = () => {
  return (
    <div className="container py-6">
      <Card className="bg-black/20 border-white/10">
        <CardContent className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crimson"></div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingState;
