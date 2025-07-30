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

  const [pollingStatus, setPollingStatus] = useState<string>("idle");   // ✅ Track status text
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);       // ✅ Track interval reference
  
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

        // ✅ Removed job_id requirement — always start polling
        toast({ title: "Forecast started", description: "Polling for status..." });  // NEW
        startPolling();  // NEW

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

  // ✅ Updated polling function (no job_id)
  const startPolling = () => {
    console.log(" [Polling] Starting polling to /status");
    pollingIntervalRef.current = setInterval(async () => {
      console.log(" [Polling] Tick - calling /status");
      try {
        const res = await fetch(`${import.meta.env.VITE_AUTH_API_URL}/status`);
        console.log(" [Polling] Response status code:", res.status); 
        const statusData = await res.json();
        console.log("📡 [Polling] Response JSON:", statusData);

        setPollingStatus(statusData.status);

        if (statusData.status === "completed") {
          console.log(" [Polling] Status is completed, stopping polling");
          clearInterval(pollingIntervalRef.current!);
          toast({ title: "Forecast Complete", description: "Redirecting to results..." });
          navigate('/forecast-setup');
        }
      } catch (err) {
        console.error("Polling error:", err);
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
          {pollingStatus !== "idle" && <p className="mt-2 text-sm text-blue-500">Status: {pollingStatus}</p>} {/* ✅ Show status */}
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
      
      {/* Remaining upload UI unchanged */}
    </div>
  );
};

export default DataSourceScreen;
