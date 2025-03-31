import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  albumId?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ albumId }) => {
  return (
    <div className="container py-6">
      <Card className="bg-black/20 border-white/10">
        <CardContent className="py-12 text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-crimson" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">Media Not Found</h3>
          <p className="text-white/70 mb-6">This media item doesn't exist or has been deleted</p>
          {albumId ? (
            <Link to={`/albums/${albumId}`}>
              <Button>Back to Album</Button>
            </Link>
          ) : (
            <Link to="/albums">
              <Button>Back to Albums</Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorState;
