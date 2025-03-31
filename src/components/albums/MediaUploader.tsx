import React, { useState, useRef, useEffect } from 'react';
import { FileUploader } from '@/components/ui/file-uploader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Upload, X, FileVideo, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MediaUploaderProps {
  albumId: string;
  onUpload: (file: File, description?: string) => Promise<void>;
  uploadProgress: { [key: string]: number };
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

const MediaUploader: React.FC<MediaUploaderProps> = ({ albumId, onUpload, uploadProgress = {} }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [filePreview]);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `Maximum file size is 50MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`;
    }

    // Check file type
    if (file.type.startsWith('image/') && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'Unsupported image format. Please use JPEG, PNG, GIF, or WebP.';
    }

    if (file.type.startsWith('video/') && !ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return 'Unsupported video format. Please use MP4, WebM, or OGG.';
    }

    return null;
  };
  
  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const validationError = validateFile(file);
    
    if (validationError) {
      toast({
        title: 'Invalid file',
        description: validationError,
        variant: 'destructive'
      });
      return;
    }
    
    setSelectedFile(file);
    
    const objectUrl = URL.createObjectURL(file);
    setFilePreview(objectUrl);
    
    // Reset error state
    setError(null);
    
    setIsDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    if (isUploading) return;
    
    setIsDialogOpen(false);
    
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    
    setSelectedFile(null);
    setDescription('');
    setError(null);
    setRetryCount(0);
  };
  
  const handleUpload = async () => {
    if (!selectedFile || isUploading) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      await onUpload(selectedFile, description);
      
      setSelectedFile(null);
      setDescription('');
      
      setIsDialogOpen(false);
      
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
        setFilePreview(null);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload file');
      
      // Implement retry mechanism
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        retryTimeoutRef.current = setTimeout(() => {
          handleUpload();
        }, RETRY_DELAY);
      }
    } finally {
      setIsUploading(false);
    }
  };
  
  const currentProgress = Object.values(uploadProgress)[0] || 0;
  
  return (
    <>
      <FileUploader
        accept="image/*,video/*"
        maxSize={50}
        onFilesSelected={handleFileSelect}
        multiple={false}
      >
        <Button variant="outline" className="w-full h-24">
          <Upload className="mr-2 h-5 w-5" />
          Upload Media
        </Button>
      </FileUploader>
      
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
            <DialogDescription>
              Add this {selectedFile?.type.startsWith('image/') ? 'image' : 'video'} to your album
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                <p>{error}</p>
                {retryCount > 0 && (
                  <p className="text-xs">Retrying... ({retryCount}/{MAX_RETRIES})</p>
                )}
              </div>
            )}
            
            {filePreview && selectedFile && (
              <div className="relative">
                {selectedFile.type.startsWith('image/') ? (
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="w-full max-h-[300px] object-contain rounded-md"
                  />
                ) : selectedFile.type.startsWith('video/') ? (
                  <video
                    src={filePreview}
                    controls
                    className="w-full max-h-[300px] rounded-md"
                  />
                ) : (
                  <div className="w-full h-[200px] flex items-center justify-center bg-black/40 rounded-md">
                    <FileVideo className="h-12 w-12 text-white/30" />
                  </div>
                )}
              </div>
            )}
            
            <div>
              <Textarea
                placeholder="Add a description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-black/30 border-white/20"
                rows={3}
              />
            </div>
            
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{currentProgress}%</span>
                </div>
                <Progress value={currentProgress} className="h-2" />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MediaUploader; 