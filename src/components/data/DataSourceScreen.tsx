import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Database, Upload, FileSpreadsheet, FileArchive, ArrowLeft, Download, Check, X, File, AlertCircle, Loader } from 'lucide-react';
import GlassMorphCard from '../ui/GlassMorphCard';
import ProgressIndicator from '../ui/ProgressIndicator';
import { staggerContainer, staggerItem } from '@/utils/transitions';
import FileUploadModal from '../ui/FileUploadModal';
import { useForecast } from '@/context/ForecastContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const steps = ["Onboarding", "Data Source", "Generated Forecast", "Dashboard"];

// Maximum number of retry attempts
const MAX_RETRIES = 3;

const DataSourceScreen: React.FC = () => {
  const navigate = useNavigate();
  const { forecastType, uploadedFiles, removeUploadedFile, isUploadSuccessful, setForecastResult } = useForecast();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  
  useEffect(() => {
    // Log the forecast type coming from the context
    console.log('DataSourceScreen - Forecast Type:', forecastType);
  }, [forecastType]);
  
  const handleSourceSelect = (source: string) => {
    // Only allow ZIP file uploads
    if (source === 'zip') {
      setIsUploadModalOpen(true);
    }
  };
  
  const handleBack = () => {
    navigate('/');
  };
  
  const handleGenerateForecast = () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No files uploaded",
        description: "Please upload at least one ZIP file before continuing.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if there are any non-ZIP files
    const nonZipFiles = uploadedFiles.filter(file => !file.name.toLowerCase().endsWith('.zip'));
    if (nonZipFiles.length > 0) {
      toast({
        title: "Invalid file format",
        description: "Only ZIP files are allowed. Please remove any non-ZIP files.",
        variant: "destructive",
      });
      return;
    }
    
    // Reset retry count and error state
    setRetryCount(0);
    setUploadError(null);
    setIsRetrying(false);
    
    // This is where you would initiate the API upload
    handleUploadToAPI();
  };
  
  const handleUploadToAPI = async () => {
    setIsUploading(true);
    
    try {
      // Create a FormData object to send files
      const formData = new FormData();
      
      // Add the first ZIP file to the FormData
      if (uploadedFiles.length > 0) {
        formData.append('file', uploadedFiles[0], uploadedFiles[0].name);
      }
      
      console.log('Uploading files to API...');
      console.log('Files to upload:', uploadedFiles.map(f => `${f.name} (${formatFileSize(f.size)})`));
      
      // Make the API call to the actual endpoint
      const response = await fetch('https://featurebox-ai-service-666676702816.us-west1.run.app/upload/', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
        },
        body: formData,
      });
      
      if (response.ok) {
        console.log('Files successfully uploaded to API');
        
        // The response should be a downloadable file, so we'll store it for later use
        const blob = await response.blob();
        const filename = response.headers.get('content-disposition')?.match(/filename="([^"]+)"/)?.[1] || 'forecast_results.xlsx';
        
        // Store the forecast result
        setForecastResult({
          model_selected: 'SARIMA',
          downloadableFile: blob,
          filename: filename
        });
        
        setIsUploading(false);
        navigate('/forecast-setup');
      } else {
        throw new Error(`API responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      
      // Check if we should retry
      if (retryCount < MAX_RETRIES) {
        const nextRetryCount = retryCount + 1;
        setRetryCount(nextRetryCount);
        setIsRetrying(true);
        
        toast({
          title: `Upload failed (Attempt ${nextRetryCount}/${MAX_RETRIES})`,
          description: "Retrying upload...",
          variant: "destructive",
        });
        
        // Retry after a delay (with exponential backoff)
        setTimeout(() => {
          setIsRetrying(false); 
          handleUploadToAPI();
        }, 1000 * Math.pow(2, nextRetryCount)); // 2s, 4s, 8s
      } else {
        // Max retries reached, show error
        setIsUploading(false);
        setIsRetrying(false);
        setUploadError("Failed to upload files after multiple attempts. Please try again later.");
        
        toast({
          title: "Upload failed",
          description: "Failed to upload files to the server after multiple attempts.",
          variant: "destructive",
        });
      }
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };
  
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (extension === 'zip') {
      return <FileArchive size={24} className="text-blue-600" />;
    } else {
      return <File size={24} className="text-gray-600" />;
    }
  };

  const resetUpload = () => {
    setUploadError(null);
    setRetryCount(0);
    setIsRetrying(false);
  };

  return (
    <div className="container max-w-5xl px-4 py-12 mx-auto">
      <ProgressIndicator steps={steps} currentStep={1} />
      
      <motion.div 
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight mb-2">Connect Your Data</h1>
        <p className="text-lg text-gray-600">Upload your ZIP file containing sales and inventory data.</p>
        {forecastType && (
          <p className="mt-2 text-sm font-medium text-primary">Selected forecast type: {forecastType}</p>
        )}
      </motion.div>
      
      <motion.div 
        className="grid grid-cols-1 gap-6 mb-12"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={staggerItem}>
          <GlassMorphCard 
            className={`h-full`}
            hover={false}
          >
            <div className="flex flex-col h-full">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Database size={28} />
                </div>
                <h3 className="text-xl font-medium mb-3">Connect External Source</h3>
                <p className="text-gray-600">
                  Import data from external sources. Currently, only ZIP archives are supported.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <button 
                  className={`p-4 rounded-lg border transition-all
                    ${isUploadSuccessful && uploadedFiles.some(f => f.name.endsWith('.zip')) ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'}
                    flex flex-col items-center`}
                  onClick={() => handleSourceSelect('zip')}
                >
                  <FileArchive size={24} className="text-blue-700 mb-2" />
                  <span className="text-sm font-medium">ZIP Archive</span>
                </button>
                
                <button 
                  className="p-4 rounded-lg border border-gray-200 bg-gray-100 cursor-not-allowed flex flex-col items-center opacity-50"
                  disabled
                >
                  <FileSpreadsheet size={24} className="text-gray-500 mb-2" />
                  <span className="text-sm font-medium">CSV Files</span>
                </button>
                
                <button 
                  className="p-4 rounded-lg border border-gray-200 bg-gray-100 cursor-not-allowed flex flex-col items-center opacity-50"
                  disabled
                >
                  <FileSpreadsheet size={24} className="text-gray-500 mb-2" />
                  <span className="text-sm font-medium">Excel</span>
                </button>
              </div>
              
              {isUploadSuccessful && uploadedFiles.length > 0 && (
                <div className="mt-auto">
                  <h4 className="font-medium text-sm mb-2 flex items-center">
                    <Check size={16} className="text-green-600 mr-2" />
                    {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} uploaded
                  </h4>
                  <button 
                    onClick={() => setIsUploadModalOpen(true)}
                    className="mb-2 text-xs text-primary underline"
                  >
                    Upload more files
                  </button>
                </div>
              )}
            </div>
          </GlassMorphCard>
        </motion.div>
      </motion.div>
      
      <GlassMorphCard className="mb-12" hover={false}>
        <div className="flex items-start">
          <div className="flex-grow">
            <h3 className="text-lg font-medium mb-4">Uploaded Files</h3>
            
            {uploadedFiles.length > 0 ? (
              <ScrollArea className="h-[200px] w-full border rounded-md bg-white">
                <div className="p-4">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex items-center">
                        {getFileIcon(file.name)}
                        <div className="ml-3">
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeUploadedFile(file.name)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        disabled={isUploading}
                      >
                        <X size={18} />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 border rounded-md bg-gray-50">
                <Upload size={28} className="text-gray-400 mb-3" />
                <p className="text-gray-600 mb-4">No files uploaded yet</p>
                <Button onClick={() => setIsUploadModalOpen(true)}>
                  Upload Files
                </Button>
              </div>
            )}
            
            {isRetrying && (
              <Alert className="mt-4 bg-yellow-50 border-yellow-200">
                <div className="flex items-center">
                  <Loader size={16} className="text-yellow-600 mr-2 animate-spin" />
                  <AlertTitle className="text-yellow-700">Retrying upload</AlertTitle>
                </div>
                <AlertDescription className="text-yellow-600">
                  Attempt {retryCount} of {MAX_RETRIES}. Please wait...
                </AlertDescription>
              </Alert>
            )}
            
            {uploadError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {uploadError}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={resetUpload}
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="mt-4">
              <Button 
                variant="outline"
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center"
                disabled={isUploading || isRetrying}
              >
                <Upload size={16} className="mr-2" />
                Upload ZIP File
              </Button>
            </div>
          </div>
        </div>
      </GlassMorphCard>
      
      <div className="flex justify-between">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-outline flex items-center"
          onClick={handleBack}
        >
          <ArrowLeft size={18} className="mr-2" />
          Back
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`btn-primary ${isUploading || isRetrying ? 'opacity-70 cursor-not-allowed' : ''}`}
          onClick={handleGenerateForecast}
          disabled={isUploading || isRetrying}
        >
          {isUploading ? 'Generating...' : isRetrying ? `Retrying (${retryCount}/${MAX_RETRIES})` : 'Generate Forecast'}
        </motion.button>
      </div>
      
      <FileUploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={() => {}}
        acceptedFileTypes="zip"
      />
    </div>
  );
};

export default DataSourceScreen;
