
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ForecastContextType {
  forecastType: string;
  setForecastType: (type: string) => void;
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  isUploadSuccessful: boolean;
  setIsUploadSuccessful: (success: boolean) => void;
}

const ForecastContext = createContext<ForecastContextType | undefined>(undefined);

export const ForecastProvider = ({ children }: { children: ReactNode }) => {
  const [forecastType, setForecastType] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploadSuccessful, setIsUploadSuccessful] = useState<boolean>(false);

  return (
    <ForecastContext.Provider value={{ 
      forecastType, 
      setForecastType,
      uploadedFile,
      setUploadedFile,
      isUploadSuccessful,
      setIsUploadSuccessful
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
