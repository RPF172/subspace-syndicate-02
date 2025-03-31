
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

interface FileUploaderProps {
  accept?: string;
  maxSize?: number; // in MB
  onFilesSelected: (files: FileList | null) => void;
  multiple?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  accept,
  maxSize = 500, // Default 500MB
  onFilesSelected,
  multiple = false,
  className = '',
  children
}) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFiles(e.target.files);
    }
  };

  const validateAndProcessFiles = (files: FileList) => {
    // Check file size
    for (let i = 0; i < files.length; i++) {
      const fileSizeMB = files[i].size / (1024 * 1024);
      if (fileSizeMB > maxSize) {
        alert(`File ${files[i].name} is too large. Maximum size is ${maxSize}MB.`);
        return;
      }
    }
    
    onFilesSelected(files);
  };

  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  // Create a cloned version of children with the proper onClick handler
  const childrenWithProps = children 
    ? React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { 
            onClick: (e: React.MouseEvent) => {
              e.preventDefault();
              handleButtonClick();
              // Preserve original onClick if it exists
              if (child.props.onClick) {
                child.props.onClick(e);
              }
            }
          });
        }
        return child;
      })
    : null;

  return (
    <div 
      className={`relative ${className}`}
      onDragEnter={handleDrag}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInputChange}
      />
      
      {childrenWithProps || (
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragActive 
              ? 'border-crimson/70 bg-crimson/5' 
              : 'border-white/20 hover:bg-white/5'
          }`}
          onClick={handleButtonClick}
        >
          <Upload className="mx-auto h-10 w-10 text-white/40 mb-2" />
          <p className="text-white/70 mb-2">
            Drag and drop or click to upload
          </p>
          <Button variant="outline" size="sm">
            Select Files
          </Button>
        </div>
      )}
      
      {dragActive && (
        <div 
          className="absolute inset-0 w-full h-full rounded-lg"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        />
      )}
    </div>
  );
};
