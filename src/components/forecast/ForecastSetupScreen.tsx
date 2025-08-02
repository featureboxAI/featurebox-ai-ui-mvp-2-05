import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { ArrowLeft, Download, Sparkles, CheckCircle, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassMorphCard from '../ui/GlassMorphCard';
import ProgressIndicator from '../ui/ProgressIndicator';
import { pageTransition } from '@/utils/transitions';
import { Card, CardContent } from '@/components/ui/card';
import { useForecast } from '@/context/ForecastContext';
import { toast } from "@/components/ui/use-toast";
import AIInsightPanel from '../dashboard/AIInsightPanel';


const steps = ["Onboarding", "Data Source", "Generated Forecast", "Dashboard"];

const ForecastSetupScreen: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth0();
  const { forecastType, uploadedFiles, forecastResult } = useForecast();

  useEffect(() => {
    console.log('ForecastSetupScreen - Forecast Type:', forecastType);
    console.log('ForecastSetupScreen - Uploaded Files:', uploadedFiles.map(file => file.name));
    console.log('ForecastSetupScreen - Forecast Result:', forecastResult);
  }, [forecastType, uploadedFiles, forecastResult]);

  const handleBack = () => {
    navigate('/data-source');
  };

  const handleContinue = () => {
    navigate('/dashboard');
  };

  const handleExportToExcel = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_AUTH_API_URL}/download-forecast`);
      if (!response.ok) throw new Error("Download failed");
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
  
      const link = document.createElement('a');
      link.href = url;
      link.download = forecastResult?.filename ||'forecast_results.xlsx'; // default filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      console.log(" Forecast downloaded successfully");
    } catch (err) {
      console.error(" Download failed:", err);
      toast({
        title: "Download failed",
        description: "Could not download forecast result. Please try again.",
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
        <div className="bg-white rounded-xl p-8 shadow-sm mb-8 border border-gray-100 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle size={32} />
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-4">Forecast Generated Successfully!</h2>
          <p className="text-gray-600 mb-8">
            Your demand forecast has been processed and is ready for download. 
            Click the button below to download your results as an Excel file.
          </p>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary flex items-center mx-auto text-lg px-8 py-4"
            onClick={handleExportToExcel}
            disabled={!forecastResult?.filename} 
          >
            <Download size={24} className="mr-3" />
            Download Forecast Results
          </motion.button>
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
