
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
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({ isOpen, onClose, onUploadSuccess }) => {
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
      
      // Check if file is CSV or ZIP
      if (fileType === 'csv') {
        validFiles.push(file);
      } else if (fileType === 'zip') {
        validFiles.push(file);
      } else {
        toast({
          title: "Unsupported file format",
          description: `File ${file.name} is not supported. Please upload CSV or ZIP files only.`,
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
  
  // Function to mock API call for uploading files
  const uploadFilesToAPI = async (files: File[]) => {
    try {
      // Create a FormData object to send the files
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`file-${index}`, file);
      });
      
      // In a real app, you would send the formData to your API endpoint
      // For now, we'll just log it to the console
      console.log('Uploading files to API:', formData);
      
      // Mock API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Error uploading files:', error);
      return false;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Upload your CSV or ZIP files containing sales and inventory data
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
            accept=".csv,.zip"
            multiple
          />
          <div className="flex flex-col items-center">
            <Upload size={36} className="text-gray-400 mb-4" />
            <p className="text-lg font-medium mb-1">Drop files here or click to upload</p>
            <p className="text-sm text-gray-500 mb-4">
              Support for CSV and ZIP files
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
