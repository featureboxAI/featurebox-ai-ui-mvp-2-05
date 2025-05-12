
import React, { useState, useRef } from 'react';
import { FileArchive, Upload, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useForecast } from '@/context/ForecastContext';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
  acceptedFileTypes?: string;
}

// Maximum file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const FileUploadModal: React.FC<FileUploadModalProps> = ({ 
  isOpen, 
  onClose, 
  onUploadSuccess,
  acceptedFileTypes = "zip" 
}) => {
  const { addUploadedFile, setIsUploadSuccessful } = useForecast();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
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
      validateAndProcessFiles(e.dataTransfer.files);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFiles(e.target.files);
    }
  };
  
  const validateAndProcessFiles = (files: FileList) => {
    setValidationError(null);
    const validFiles: File[] = [];
    let hasErrors = false;
    
    // Process all files
    Array.from(files).forEach(file => {
      const fileType = file.name.split('.').pop()?.toLowerCase();
      
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setValidationError(`File ${file.name} exceeds the maximum size limit of 50MB`);
        hasErrors = true;
        return;
      }
      
      // Check file type
      if (fileType !== 'zip') {
        setValidationError(`File ${file.name} is not a ZIP file. Please upload ZIP files only.`);
        hasErrors = true;
        return;
      }
      
      validFiles.push(file);
    });
    
    if (!hasErrors && validFiles.length > 0) {
      handleFileUpload(validFiles);
    }
  };
  
  const handleFileUpload = (files: File[]) => {
    setIsUploading(true);
    
    // Add all valid files to context
    if (files.length > 0) {
      files.forEach(file => {
        addUploadedFile(file);
      });
      
      setIsUploadSuccessful(true);
      
      toast({
        title: "Files uploaded successfully",
        description: `${files.length} file(s) have been uploaded.`,
      });
      
      setIsUploading(false);
      
      // Close the modal automatically on successful upload
      onClose();
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    }
    
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
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Upload your ZIP files only
          </DialogDescription>
        </DialogHeader>
        
        {validationError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}
        
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
            accept=".zip"
            multiple
          />
          <div className="flex flex-col items-center">
            <FileArchive size={36} className="text-blue-500 mb-4" />
            <p className="text-lg font-medium mb-1">Drop files here or click to upload</p>
            <p className="text-sm text-gray-500 mb-4">
              ZIP files only (Max 50MB)
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
