
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ForecastResult {
  model_selected: string;
  sarima?: {
    forecast: number[];
    lower_bound: number[];
    upper_bound: number[];
    dates: string[];
    method: string;
  };
  moving_average?: {
    forecast: number[];
    dates: string[];
    method: string;
  };
}

interface ForecastContextType {
  forecastType: string;
  setForecastType: (type: string) => void;
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  isUploadSuccessful: boolean;
  setIsUploadSuccessful: (success: boolean) => void;
  forecastResult: ForecastResult | null;
  setForecastResult: (result: ForecastResult | null) => void;
}

const ForecastContext = createContext<ForecastContextType | undefined>(undefined);

export const ForecastProvider = ({ children }: { children: ReactNode }) => {
  const [forecastType, setForecastType] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploadSuccessful, setIsUploadSuccessful] = useState<boolean>(false);
  const [forecastResult, setForecastResult] = useState<ForecastResult | null>(null);

  return (
    <ForecastContext.Provider value={{ 
      forecastType, 
      setForecastType,
      uploadedFile,
      setUploadedFile,
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
