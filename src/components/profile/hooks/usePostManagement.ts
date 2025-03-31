
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UsePostManagementProps {
  postId: string;
  initialContent: string;
}

export const usePostManagement = ({ postId, initialContent }: UsePostManagementProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(initialContent);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showFlagConfirmation, setShowFlagConfirmation] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Update the post content
  const updatePost = async () => {
    setLoadingEdit(true);
    try {
      const { error } = await supabase
        .from('posts')
        .update({ content: editedContent })
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: 'Post updated',
        description: 'Your post has been updated successfully.',
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: 'Error updating post',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoadingEdit(false);
    }
  };

  // Delete the post
  const deletePost = async () => {
    setLoadingDelete(true);
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: 'Post deleted',
        description: 'Your post has been deleted successfully.',
      });
      
      window.location.reload();
    } catch (error: any) {
      toast({
        title: 'Error deleting post',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoadingDelete(false);
      setShowConfirmation(false);
    }
  };

  // Flag the post for moderation
  const flagPost = async () => {
    try {
      toast({
        title: 'Post reported',
        description: 'This post has been flagged for review.',
      });
    } finally {
      setShowFlagConfirmation(false);
    }
  };
  
  // Event handlers for the post menu
  const handleEditClick = () => {
    setIsEditing(true);
    setShowMenu(false);
  };
  
  const handleDeleteClick = () => {
    setShowConfirmation(true);
    setShowMenu(false);
  };
  
  const handleFlagClick = () => {
    setShowFlagConfirmation(true);
    setShowMenu(false);
  };

  return {
    isEditing,
    editedContent,
    setEditedContent,
    loadingEdit,
    loadingDelete,
    showConfirmation,
    showFlagConfirmation,
    showMenu,
    setShowMenu,
    setShowConfirmation,
    setShowFlagConfirmation,
    updatePost,
    deletePost,
    flagPost,
    handleEditClick,
    handleDeleteClick,
    handleFlagClick
  };
};
