// DataSourceScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Database, Upload, FileSpreadsheet, FileArchive, ArrowLeft, Check, X, AlertCircle, LogOut, User } from 'lucide-react';
import { File as FileIcon } from 'lucide-react';
import GlassMorphCard from '../ui/GlassMorphCard';
import FileUploadModal from '../ui/FileUploadModal';
import { useForecast } from '@/context/ForecastContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Polling interval in ms (5 minutes)
const POLLING_INTERVAL = 5 * 60 * 1000;  

const DataSourceScreen: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth0();
  const { forecastType, uploadedFiles, removeUploadedFile, isUploadSuccessful, setForecastResult } = useForecast();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pollingStatus, setPollingStatus] = useState<string>("idle"); // Track status
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);      // Track interval
  const [isForecastInProgress, setIsForecastInProgress] = useState(false);
  
  useEffect(() => {
    console.log('DataSourceScreen - Forecast Type:', forecastType);
  }, [forecastType]);

  const handleSourceSelect = (source: string) => {
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
  
    const nonZipFiles = uploadedFiles.filter(file => !file.name.toLowerCase().endsWith('.zip'));
    if (nonZipFiles.length > 0) {
      toast({
        title: "Invalid file format",
        description: "Only ZIP files are allowed. Please remove any non-ZIP files.",
        variant: "destructive",
      });
      return;
    }
  
    setIsForecastInProgress(true); // Disable button immediately
    setUploadError(null);
    handleUploadToAPI();
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleUploadToAPI = async () => {
    setIsUploading(true);
  
    try {
      let formData; 
      if (uploadedFiles.length > 0) {
        const file = uploadedFiles[0];
        if (!(file instanceof window.File)) {
          throw new Error("Uploaded file is not a valid File object");
        }
        formData = new FormData();
        formData.append("file", file);
      } else {
        throw new Error("No file selected.");
      }
  
            console.log("Uploading files to API...");

      // Simple user-based backend routing
      let backendUrl = 'https://featurebox-ai-backend-service-666676702816.us-west1.run.app'; // Default
      
      if (user?.sub === 'auth0|688e5737480c85818cab73ba' || user?.sub === 'auth0|68885310e8ffc9f5c2dd2f14') {
        backendUrl = 'https://ladera-featurebox-ai-backend-service-666676702816.us-west1.run.app';
        console.log('Ladera user detected, using Ladera backend');
      } else if (user?.sub === 'auth0|687f0be2fb6744d5fe3ca09f' || user?.sub === 'auth0|688849466594333b2d382039') {
        backendUrl = 'https://featurebox-ai-backend-service-666676702816.us-west1.run.app';
        console.log('Herb Farms user detected, using Herb Farms backend');
      } else {
        console.log('Default user, using default backend');
      }

      const response = await fetch(`${backendUrl}/upload/`, {
        method: "POST",
        body: formData,
      });
  
      console.log("API status:", response.status);
      const contentType = response.headers.get("Content-Type") || "";

      if (contentType.includes("application/json")) {
        const result = await response.json();
        console.log(" JSON from /upload:", result);

        toast({ title: "Forecast started", description: "Polling for status..." });
        setPollingStatus("running");
        startPolling(); 
        return;

      } else if (contentType.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
        const blob = await response.blob();
        const disp = response.headers.get("Content-Disposition");
  
        let filename = "forecast_results.xlsx";
        if (disp && disp.includes("filename=")) {
          const match = /filename="?(.+?)"?($|;)/.exec(disp);
          if (match) filename = match[1];
        }
  
        setForecastResult({ filename, downloadableFile: blob });
        navigate('/forecast-results');
      }
  
    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: "Upload Failed", description: (error as Error).message || "Unknown error" });
    } finally {
      setIsUploading(false);
    }
  };  

  // Polling logic with debug logs
  const startPolling = () => {
    console.log(" [Polling] Starting polling to /status");
    pollingIntervalRef.current = setInterval(async () => {
      console.log(" [Polling] Tick - calling /status");
      try {
        const res = await fetch(`${import.meta.env.VITE_AUTH_API_URL}/status`);
        console.log(" [Polling] Response status:", res.status);
        const statusData = await res.json();
        console.log(" [Polling] Response JSON:", statusData);

        setPollingStatus(statusData.status);

        // Grey out button as soon as status is started or running
      if (statusData.status === "started" || statusData.status === "running") {
        setPollingStatus("running");
      }

        if (statusData.status === "completed") {
          console.log(" [Polling] Completed - stopping polling");
          clearInterval(pollingIntervalRef.current!);
          pollingIntervalRef.current = null;
          setPollingStatus("completed");

          // Extract filename from GCS path and set in context
          const gcsPath = statusData.forecast_gcs || '';
          const filename = gcsPath.split('/').pop() || 'forecast_results.xlsx';
          setForecastResult({
            filename,
            downloadableFile: null // file will be downloaded via /download-forecast
          });

          toast({ title: "Forecast Complete", description: "Redirecting to results..." });
          navigate('/forecast-results');
        }
      } catch (err) {
        console.error(" [Polling] Error:", err);
      }
    }, POLLING_INTERVAL);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'zip') return <FileArchive size={24} className="text-blue-600" />;
    return <FileIcon size={24} className="text-gray-600" />;
  };

  const resetUpload = () => {
    setUploadError(null);
  };

  return (
    <div className="container max-w-5xl px-4 py-12 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <motion.div 
          className="text-center w-full"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-center">Connect Your Data</h1>
          <p className="text-lg text-gray-600">Upload your ZIP file containing sales and inventory data.</p>
          {forecastType && (
            <p className="mt-2 text-sm font-medium text-primary">Selected forecast type: {forecastType}</p>
          )}
          {pollingStatus !== "idle" && (
            <p className="mt-2 text-sm text-blue-500">Status: {pollingStatus}</p>
          )}
        </motion.div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer">
              <User size={16} className="text-gray-600" />
            </div>
            <div className="absolute right-0 top-10 bg-white border rounded-lg shadow-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              Hello, {user?.email || 'User'}
            </div>
          </div>
          <Button 
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </div>
      
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
                disabled={isUploading}
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
          className={`btn-primary ${(isUploading || pollingStatus === 'running') ? 'opacity-70 cursor-not-allowed' : ''}`}
          onClick={handleGenerateForecast}
          disabled={isUploading || pollingStatus === "running" || pollingStatus === "forecast started"}
          >
            {(isUploading || pollingStatus === 'running') ? 'Generating...' : 'Generate Forecast'}
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
