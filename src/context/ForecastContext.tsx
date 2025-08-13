
import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';

export interface ForecastResult {
  filename: string;
  downloadableFile?: Blob;
  download_url?: string;
  model_selected?: string;
}
  
//   sarima?: {
//     forecast: number[];
//     lower_bound: number[];
//     upper_bound: number[];
//     dates: string[];
//     method: string;
//   };
//   moving_average?: {
//     forecast: number[];
//     dates: string[];
//     method: string;
//   };
// }

interface ForecastContextType {
  forecastType: string;
  setForecastType: (type: string) => void;
  uploadedFiles: File[];
  addUploadedFile: (file: File) => void;
  removeUploadedFile: (fileName: string) => void;
  clearUploadedFiles: () => void;
  isUploadSuccessful: boolean;
  setIsUploadSuccessful: (success: boolean) => void;
  forecastResult: ForecastResult | null;
  setForecastResult: (result: ForecastResult | null) => void;
  globalForecastStatus: string;
  setGlobalForecastStatus: (status: string) => void;
  startGlobalPolling: () => void;
  stopGlobalPolling: () => void;
}

const ForecastContext = createContext<ForecastContextType | undefined>(undefined);

export const ForecastProvider = ({ children }: { children: ReactNode }) => {
  const [forecastType, setForecastType] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploadSuccessful, setIsUploadSuccessful] = useState<boolean>(false);
  const [forecastResult, setForecastResult] = useState<ForecastResult | null>(null);
  const [globalForecastStatus, setGlobalForecastStatus] = useState<string>('idle');
  const globalPollingRef = useRef<NodeJS.Timeout | null>(null);

  const POLLING_INTERVAL = 5 * 60 * 1000; // 5 minutes

  const startGlobalPolling = () => {
    // Prevent multiple polling intervals
    if (globalPollingRef.current) {
      console.log("[Global Polling] Already polling, skipping new interval");
      return;
    }
    
    console.log("[Global Polling] Starting polling to /status");
    globalPollingRef.current = setInterval(async () => {
      console.log("[Global Polling] Tick - calling /status");
      try {
        const res = await fetch(`${import.meta.env.VITE_AUTH_API_URL || 'https://featurebox-ai-backend-service-666676702816.us-west1.run.app'}/status`);
        const statusData = await res.json();
        console.log("[Global Polling] Response JSON:", statusData);

        setGlobalForecastStatus(statusData.status);

        // Grey out button as soon as status is started or running
        if (statusData.status === "started" || statusData.status === "running") {
          setGlobalForecastStatus("running");
        }

        if (statusData.status === "completed") {
          console.log("[Global Polling] Completed - stopping polling");
          stopGlobalPolling();
          setGlobalForecastStatus("completed");
          
          // Set forecast result if available
          const gcsPath = statusData.forecast_gcs || '';
          const filename = gcsPath.split('/').pop() || 'forecast_results.xlsx';
          setForecastResult({
            filename,
            download_url: statusData.forecast_gcs || ''
          });
          
          // Navigate to results page automatically only when forecast completes
          const currentPath = window.location.pathname;
          if (currentPath === '/data-source') {
            window.location.href = '/forecast-results';
          }
        } else if (statusData.status === "failed" || statusData.status === "error") {
          console.log("[Global Polling] Failed - stopping polling");
          stopGlobalPolling();
          setGlobalForecastStatus("failed");
        }
      } catch (err) {
        console.error("[Global Polling] Error:", err);
      }
    }, POLLING_INTERVAL);
  };

  const stopGlobalPolling = () => {
    if (globalPollingRef.current) {
      clearInterval(globalPollingRef.current);
      globalPollingRef.current = null;
      console.log("[Global Polling] Polling stopped");
    }
  };

  const addUploadedFile = (file: File) => {
    setUploadedFiles(prev => {
      // Check if file with same name already exists, if so, replace it
      const exists = prev.some(f => f.name === file.name);
      if (exists) {
        return prev.map(f => f.name === file.name ? file : f);
      }
      return [...prev, file];
    });
  };

  const removeUploadedFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(file => file.name !== fileName));
    if (uploadedFiles.length <= 1) {
      setIsUploadSuccessful(false);
    }
  };

  const clearUploadedFiles = () => {
    setUploadedFiles([]);
    setIsUploadSuccessful(false);
  };

  return (
    <ForecastContext.Provider value={{ 
      forecastType, 
      setForecastType,
      uploadedFiles,
      addUploadedFile,
      removeUploadedFile,
      clearUploadedFiles,
      isUploadSuccessful,
      setIsUploadSuccessful,
      forecastResult,
      setForecastResult,
      globalForecastStatus,
      setGlobalForecastStatus,
      startGlobalPolling,
      stopGlobalPolling
    }}>
      {children}
    </ForecastContext.Provider>
  );
};

export const useForecast = () => {
  const context = useContext(ForecastContext);
  if (context === undefined) {
    throw new Error('useForecast must be used within a ForecastProvider');
  }
  return context;
};
