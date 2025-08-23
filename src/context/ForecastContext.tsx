
import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

export interface ForecastResult {
  filename: string;
  downloadableFile?: Blob;
  download_url?: string;
  model_selected?: string;
  completedAt?: Date;
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
  const { user } = useAuth0();
  const navigate = useNavigate();
  const [forecastType, setForecastType] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploadSuccessful, setIsUploadSuccessful] = useState<boolean>(false);
  const [forecastResult, setForecastResultState] = useState<ForecastResult | null>(() => {
    // Load from localStorage on init
    try {
      const saved = localStorage.getItem('forecastResult');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert completedAt string back to Date
        if (parsed.completedAt) {
          parsed.completedAt = new Date(parsed.completedAt);
        }
        return parsed;
      }
    } catch (error) {
      console.error('Failed to load forecast result from localStorage:', error);
    }
    return null;
  });
  const [globalForecastStatus, setGlobalForecastStatus] = useState<string>('idle');
  const globalPollingRef = useRef<NodeJS.Timeout | null>(null);

  const POLLING_INTERVAL = 5 * 60 * 1000; // 5 minutes

  // Helper function to get the correct backend URL based on user
  const getBackendUrl = () => {
    let backendUrl = import.meta.env.VITE_AUTH_API_URL || 'https://featurebox-ai-backend-service-666676702816.us-west1.run.app'; // Default

    if (
      user?.sub === 'auth0|688e5737480c85818cab73ba' ||
      user?.sub === 'auth0|68885310e8ffc9f5c2dd2f14'
    ) {
      backendUrl = 'https://ladera-featurebox-ai-backend-service-666676702816.us-west1.run.app';
      console.log('Ladera user detected, using Ladera backend for status polling');
    } else if (
      user?.sub === 'auth0|687f0be2fb6744d5fe3ca09f' ||
      user?.sub === 'auth0|688849466594333b2d382039'
    ) {
      backendUrl = 'https://featurebox-ai-backend-service-666676702816.us-west1.run.app';
      console.log('Herb Farms user detected, using Herb Farms backend for status polling');
    } else {
      console.log('Default user, using default backend for status polling');
    }

    return backendUrl;
  };

  // Wrapper function to save to localStorage whenever forecast result is set
  const setForecastResult = (result: ForecastResult | null) => {
    setForecastResultState(result);
    try {
      if (result) {
        localStorage.setItem('forecastResult', JSON.stringify(result));
      } else {
        localStorage.removeItem('forecastResult');
      }
    } catch (error) {
      console.error('Failed to save forecast result to localStorage:', error);
    }
  };


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
        const res = await fetch(`${getBackendUrl()}/status`);
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
            download_url: statusData.forecast_gcs || '',
            completedAt: new Date()
          });
          
          // Navigate to results page automatically only when forecast completes
          const currentPath = window.location.pathname;
          console.log('[Global Polling] Current path on completion:', currentPath);
          if (currentPath === '/data-source') {
            console.log('[Global Polling] Navigating to forecast results');
            navigate('/forecast-results');
          } else {
            console.log('[Global Polling] Not on data-source page, skipping navigation');
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

  // Set up page visibility listener to check status when page becomes visible
  useEffect(() => {
    const checkForecastStatus = async () => {
      if (globalForecastStatus === 'running' || globalForecastStatus === 'started') {
        console.log('[Visibility] Checking forecast status immediately');
        try {
          const res = await fetch(`${getBackendUrl()}/status`);
          const statusData = await res.json();
          console.log('[Visibility] Status check result:', statusData);

          if (statusData.status === "completed") {
            console.log('[Visibility] Found completed status on page visibility');
            
            if (globalPollingRef.current) {
              clearInterval(globalPollingRef.current);
              globalPollingRef.current = null;
            }

            setGlobalForecastStatus("completed");
            
            // Set forecast result if available
            const gcsPath = statusData.forecast_gcs || '';
            const filename = gcsPath.split('/').pop() || 'forecast_results.xlsx';
            setForecastResult({
              filename,
              download_url: statusData.forecast_gcs || '',
              completedAt: new Date()
            });
            
            // Navigate to results page automatically only when forecast completes
            const currentPath = window.location.pathname;
            console.log('[Visibility] Current path on completion:', currentPath);
            if (currentPath === '/data-source') {
              console.log('[Visibility] Navigating to forecast results');
              navigate('/forecast-results');
            } else {
              console.log('[Visibility] Not on data-source page, skipping navigation');
            }
          } else if (statusData.status === "failed" || statusData.status === "error") {
            console.log('[Visibility] Found failed status on page visibility');
            stopGlobalPolling();
            setGlobalForecastStatus("failed");
          }
        } catch (error) {
          console.error('[Visibility] Status check failed:', error);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('[Visibility] Page became visible, checking forecast status');
        checkForecastStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [globalForecastStatus, navigate, setForecastResult, setGlobalForecastStatus, stopGlobalPolling]);

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
