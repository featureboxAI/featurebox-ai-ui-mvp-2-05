
import React, { useState, useRef } from 'react';
import { X, Upload, FileArchive } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useForecast } from '@/context/ForecastContext';
import { toast } from '@/hooks/use-toast';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
  acceptedFileTypes?: string;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({ 
  isOpen, 
  onClose, 
  onUploadSuccess,
  acceptedFileTypes = "csv,zip" 
}) => {
  const { addUploadedFile, setIsUploadSuccessful } = useForecast();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files);
    }
  };
  
  const handleFileUpload = (files: FileList) => {
    setIsUploading(true);
    
    const validFiles: File[] = [];
    
    // Process all files
    Array.from(files).forEach(file => {
      const fileType = file.name.split('.').pop()?.toLowerCase();
      
      // Check if file matches accepted type
      if (acceptedFileTypes === "zip" && fileType === 'zip') {
        validFiles.push(file);
      } else if (acceptedFileTypes === "csv" && fileType === 'csv') {
        validFiles.push(file);
      } else if (acceptedFileTypes === "csv,zip" && (fileType === 'csv' || fileType === 'zip')) {
        validFiles.push(file);
      } else {
        toast({
          title: "Unsupported file format",
          description: `File ${file.name} is not supported. Please upload ${acceptedFileTypes.toUpperCase()} files only.`,
          variant: "destructive",
        });
      }
    });
    
    // Add all valid files to context
    if (validFiles.length > 0) {
      validFiles.forEach(file => {
        addUploadedFile(file);
      });
      
      setIsUploadSuccessful(true);
      
      toast({
        title: "Files uploaded successfully",
        description: `${validFiles.length} file(s) have been uploaded.`,
      });
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    }
    
    setIsUploading(false);
    
    // Clear the input value to allow the same file to be uploaded again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getAcceptString = () => {
    if (acceptedFileTypes === "zip") return ".zip";
    if (acceptedFileTypes === "csv") return ".csv";
    return ".csv,.zip";
  };
  
  const getFileTypeLabel = () => {
    if (acceptedFileTypes === "zip") return "ZIP files only";
    if (acceptedFileTypes === "csv") return "CSV files only";
    return "CSV and ZIP files";
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Upload your {getFileTypeLabel()}
          </DialogDescription>
        </DialogHeader>
        
        <div 
          className={`mt-4 border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            onChange={handleFileChange} 
            accept={getAcceptString()}
            multiple
          />
          <div className="flex flex-col items-center">
            {acceptedFileTypes === "zip" ? (
              <FileArchive size={36} className="text-blue-500 mb-4" />
            ) : (
              <Upload size={36} className="text-gray-400 mb-4" />
            )}
            <p className="text-lg font-medium mb-1">Drop files here or click to upload</p>
            <p className="text-sm text-gray-500 mb-4">
              {getFileTypeLabel()}
            </p>
            <Button 
              type="button" 
              onClick={triggerFileInput}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Select Files'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileUploadModal;
