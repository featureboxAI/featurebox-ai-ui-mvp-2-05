import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { ArrowLeft, Download, Sparkles, CheckCircle, User, LogOut, Calendar, FileText, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassMorphCard from '../ui/GlassMorphCard';
import ProgressIndicator from '../ui/ProgressIndicator';
import { pageTransition } from '@/utils/transitions';
import { Card, CardContent } from '@/components/ui/card';
import { useForecast } from '@/context/ForecastContext';
import { toast } from "@/components/ui/use-toast";
import AIInsightPanel from '../dashboard/AIInsightPanel';

interface ForecastHistoryItem {
  filename: string;
  blob_path: string;
  formatted_date: string;
  formatted_time: string;
  status: string;
}


const steps = ["Onboarding", "Data Source", "Generated Forecast", "Dashboard"];

const ForecastSetupScreen: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth0();
  const { forecastType, uploadedFiles, forecastResult } = useForecast();
  const [forecastHistory, setForecastHistory] = useState<ForecastHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    console.log('ForecastSetupScreen - Forecast Type:', forecastType);
    console.log('ForecastSetupScreen - Uploaded Files:', uploadedFiles.map(file => file.name));
    console.log('ForecastSetupScreen - Forecast Result:', forecastResult);
  }, [forecastType, uploadedFiles, forecastResult]);

  // Fetch forecast history when component mounts
  useEffect(() => {
    fetchForecastHistory();
  }, []);

  const fetchForecastHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_AUTH_API_URL}/forecast-history?limit=3`);
      if (response.ok) {
        const data = await response.json();
        setForecastHistory(data.forecasts || []);
      }
    } catch (error) {
      console.error('Failed to fetch forecast history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDownloadHistoryFile = async (blobPath: string, filename: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_AUTH_API_URL}/download-forecast-file?blob_path=${encodeURIComponent(blobPath)}`
      );
      
      if (!response.ok) throw new Error("Download failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download the selected file.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    navigate('/data-source');
  };

  const handleContinue = () => {
    navigate('/dashboard');
  };

  const handleExportToExcel = async () => {
    try {
      console.log("Starting download. Forecast result:", forecastResult);
      const response = await fetch(`${import.meta.env.VITE_AUTH_API_URL}/download-forecast`);
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);
      
      if (!response.ok) throw new Error(`Download failed with status: ${response.status}`);
  
      const blob = await response.blob();
      console.log("Blob size:", blob.size, "Type:", blob.type);
      
      // Check if the blob is empty or has wrong type
      if (blob.size === 0) {
        throw new Error("Downloaded file is empty");
      }
      
      const url = window.URL.createObjectURL(blob);
  
      const link = document.createElement('a');
      link.href = url;
      link.download = forecastResult?.filename || 'forecast_results.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
  
      console.log("Forecast downloaded successfully");
      toast({
        title: "Download successful",
        description: "Forecast results downloaded successfully.",
      });
    } catch (err) {
      console.error("Download failed:", err);
      toast({
        title: "Download failed",
        description: `Could not download forecast result: ${(err as Error).message}`,
        variant: "destructive",
      });
    }
  };
    
  return (
    <motion.div 
      className="container max-w-5xl px-4 py-12 mx-auto"
      {...pageTransition}
    >
      <ProgressIndicator steps={steps} currentStep={2} />

      <div className="flex items-center justify-between mb-8">
        <div className="text-center w-full">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Generated Forecast</h1>
          <p className="text-lg text-gray-600">Your forecast has been generated successfully.</p>
        </div>
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
      <div className="mb-8 text-center">
        {forecastType && (
          <p className="mt-2 text-sm font-medium text-primary">Using forecast type: {forecastType}</p>
        )}
        {uploadedFiles && uploadedFiles.length > 0 && (
          <p className="mt-1 text-sm text-gray-500">
            {uploadedFiles.length === 1 
              ? `File: ${uploadedFiles[0].name}` 
              : `Files: ${uploadedFiles.length} files uploaded`}
          </p>
        )}
        {forecastResult?.filename && (
          <p className="mt-1 text-sm text-green-600">
            Results generated: {forecastResult.filename}
          </p>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6 border border-gray-100 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle size={24} />
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-3">Forecast Generated Successfully!</h2>
          <p className="text-gray-600 mb-6 text-sm">
            Your demand forecast has been processed and is ready for download.
          </p>

          <motion.button 
            whileHover={{ scale: forecastResult?.filename ? 1.05 : 1 }}
            whileTap={{ scale: forecastResult?.filename ? 0.95 : 1 }}
            className={`btn-primary flex items-center mx-auto px-6 py-3 ${
              !forecastResult?.filename ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleExportToExcel}
            disabled={!forecastResult?.filename} 
          >
            <Download size={20} className="mr-2" />
            Download Forecast Results
          </motion.button>
        </div>

        {/* Latest Forecast Results Table */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Latest Forecast Results</h3>
          </div>
          
          {loadingHistory ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading forecast history...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {forecastHistory.length > 0 ? (
                forecastHistory.map((forecast, index) => (
                  <div key={forecast.blob_path} className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            index === 0 ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <p className="text-sm font-medium">
                              {forecast.filename}
                            </p>
                            {index === 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Latest
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{forecast.formatted_date}</span>
                            </div>
                            <span>{forecast.formatted_time}</span>
                            <span className="font-medium">Status:</span>
                            <span className="text-green-600">{forecast.status}</span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadHistoryFile(forecast.blob_path, forecast.filename)}
                          className="text-xs"
                        >
                          <Download size={14} className="mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No forecast history available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      <AIInsightPanel/>

      <div className="mt-10 flex justify-between">
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
          className={`btn-primary ${!forecastResult ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleContinue}
          disabled={!forecastResult}
        >
          Continue to Dashboard
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ForecastSetupScreen;
