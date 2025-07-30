// DataSourceScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Database, Upload, FileSpreadsheet, FileArchive, ArrowLeft, Check, X, AlertCircle, LogOut } from 'lucide-react';
import { File as FileIcon } from 'lucide-react';
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

const DataSourceScreen: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth0();
  const { forecastType, uploadedFiles, removeUploadedFile, isUploadSuccessful, setForecastResult } = useForecast();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [pollingStatus, setPollingStatus] = useState<string>("idle"); // ✅ NEW: Track status
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);      // ✅ NEW: Track interval
  
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
  
      const response = await fetch(`${import.meta.env.VITE_AUTH_API_URL}/upload/`, {
        method: "POST",
        body: formData,
      });
  
      console.log("API status:", response.status);
      const contentType = response.headers.get("Content-Type") || "";

      if (contentType.includes("application/json")) {
        const result = await response.json();
        console.log("📡 JSON from /upload:", result);

        // ✅ Always start polling (no job_id check)
        toast({ title: "Forecast started", description: "Polling for status..." });
        startPolling(); // ✅ Start polling
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
        navigate('/forecast-setup');
      }
  
    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: "Upload Failed", description: (error as Error).message || "Unknown error" });
    } finally {
      setIsUploading(false);
    }
  };  

  // ✅ NEW: Polling with debug logs
  const startPolling = () => {
    console.log("🚀 [Polling] Starting to poll /status");
    pollingIntervalRef.current = setInterval(async () => {
      console.log("🔄 [Polling] Tick - calling /status");
      try {
        const res = await fetch(`${import.meta.env.VITE_AUTH_API_URL}/status`);
        console.log("🌐 [Polling] Response status:", res.status);
        const statusData = await res.json();
        console.log("📡 [Polling] Response JSON:", statusData);

        setPollingStatus(statusData.status);

        if (statusData.status === "completed") {
          console.log("✅ [Polling] Completed - stopping polling");
          clearInterval(pollingIntervalRef.current!);
          pollingIntervalRef.current = null;
          toast({ title: "Forecast Complete", description: "Redirecting to results..." });
          navigate('/forecast-setup');
        }
      } catch (err) {
        console.error("❌ [Polling] Error:", err);
      }
    }, 5000);
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
      <ProgressIndicator steps={steps} currentStep={1} />
      
      <div className="flex items-center justify-between mb-8">
        <motion.div 
          className="text-center flex-1"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold tracking-tight mb-2">Connect Your Data</h1>
          <p className="text-lg text-gray-600">Upload your ZIP file containing sales and inventory data.</p>
          {forecastType && (
            <p className="mt-2 text-sm font-medium text-primary">Selected forecast type: {forecastType}</p>
          )}
          {pollingStatus !== "idle" && (
            <p className="mt-2 text-sm text-blue-500">Status: {pollingStatus}</p>
          )}
        </motion.div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
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
      
      {/* ✅ Original UI restored */}
      <motion.div 
        className="grid grid-cols-1 gap-6 mb-12"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={staggerItem}>
          <GlassMorphCard className="h-full" hover={false}>
            <div className="flex flex-col h-full">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Database size={28} />
                </div>
                <h3 className="text-xl font-medium mb-3">Connect External Source</h3>
                <p className="text-gray-600">Import data from external sources. Currently, only ZIP archives are supported.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <button 
                  className={`p-4 rounded-lg border transition-all ${
                    isUploadSuccessful && uploadedFiles.some(f => f.name.endsWith('.zip')) 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                  } flex flex-col items-center`}
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
          className={`btn-primary ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
          onClick={handleGenerateForecast}
          disabled={isUploading}
        >
          {isUploading ? 'Generating...' : 'Generate Forecast'}
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
