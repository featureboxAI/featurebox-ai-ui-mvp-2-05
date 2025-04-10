
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Upload, X, File } from 'lucide-react';
import { useForecast } from '@/context/ForecastContext';
import { toast } from '@/components/ui/sonner';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({ isOpen, onClose, onUploadSuccess }) => {
  const { forecastType, setUploadedFile, setIsUploadSuccessful } = useForecast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSelectedFile(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    
    try {
      // Simulating API upload
      console.log('Uploading file:', selectedFile.name);
      console.log('With forecast type:', forecastType);
      
      // Normally we would send this to an API
      // const formData = new FormData();
      // formData.append('file', selectedFile);
      // formData.append('forecastType', forecastType);
      // const response = await fetch('/api/upload', { method: 'POST', body: formData });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update context
      setUploadedFile(selectedFile);
      setIsUploadSuccessful(true);
      
      // Show success message
      toast.success('File uploaded successfully');
      onUploadSuccess();
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error uploading file. Please try again.');
    } finally {
      setIsUploading(false);
      resetFileInput();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload CSV File</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {!selectedFile ? (
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
              <h3 className="text-sm font-medium text-gray-900">Click to upload or drag and drop</h3>
              <p className="text-xs text-gray-500 mt-1">CSV files only</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
                onClick={e => e.stopPropagation()}
              />
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center">
                <File className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <button 
                className="text-gray-500 hover:text-red-500"
                onClick={resetFileInput}
              >
                <X size={18} />
              </button>
            </div>
          )}
          
          {selectedFile && (
            <div className="text-sm text-gray-500">
              <p>Selected forecast type: <span className="font-medium">{forecastType || 'None'}</span></p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            disabled={!selectedFile || isUploading} 
            onClick={handleUpload}
            className="flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="animate-spin">
                  <Upload size={16} />
                </div>
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FileUploadModal;
