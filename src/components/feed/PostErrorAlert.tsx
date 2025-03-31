
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface PostErrorAlertProps {
  error: string | null;
}

const PostErrorAlert: React.FC<PostErrorAlertProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="mt-3 mb-4 bg-red-950/50 border-red-800 text-red-300">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
};

export default PostErrorAlert;
