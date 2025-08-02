
import React, { createContext, useContext, useState, ReactNode } from 'react';

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
}

const ForecastContext = createContext<ForecastContextType | undefined>(undefined);

export const ForecastProvider = ({ children }: { children: ReactNode }) => {
  const [forecastType, setForecastType] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploadSuccessful, setIsUploadSuccessful] = useState<boolean>(false);
  const [forecastResult, setForecastResult] = useState<ForecastResult | null>(null);

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
      setForecastResult 
      
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
