
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  open?: boolean; // Added for compatibility
  title: string;
  message?: string;
  description?: string; // Added for compatibility
  confirmLabel: string;
  cancelLabel: string;
  isLoading?: boolean;
  loading?: boolean; // Added for compatibility
  onConfirm: () => void;
  onCancel: () => void;
  onClose?: () => void; // Added for compatibility
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  open,
  title,
  message,
  description,
  confirmLabel,
  cancelLabel,
  isLoading,
  loading,
  onConfirm,
  onCancel,
  onClose
}) => {
  // Use either isOpen or open prop
  const isVisible = isOpen || open;
  
  // Use either message or description prop
  const dialogMessage = message || description;
  
  // Use either isLoading or loading prop
  const isProcessing = isLoading || loading;
  
  // Use either onCancel or onClose
  const handleCancel = () => {
    if (onCancel) onCancel();
    if (onClose) onClose();
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="bg-black/90 border-white/20 text-white max-w-md w-full">
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-white/70">{dialogMessage}</p>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isProcessing}
            className="border-white/20 text-white"
          >
            {cancelLabel}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isProcessing}
            className="bg-crimson hover:bg-crimson/80"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ConfirmationDialog;
