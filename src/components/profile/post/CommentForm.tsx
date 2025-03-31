
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CommentFormProps {
  onSubmit: (comment: string) => void;
  disabled: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({ onSubmit, disabled }) => {
  const [comment, setComment] = useState('');
  
  const handleSubmit = () => {
    if (comment.trim()) {
      onSubmit(comment);
      setComment('');
    }
  };
  
  return (
    <div className="p-4 pt-2 border-t border-white/10">
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write a comment..."
        className="bg-black/30 border border-white/20 text-white mb-2"
        disabled={disabled}
      />
      <Button 
        onClick={handleSubmit}
        className="bg-crimson hover:bg-crimson/80 text-white"
        disabled={!comment.trim() || disabled}
        size="sm"
      >
        Post Comment
      </Button>
    </div>
  );
};

export default CommentForm;
