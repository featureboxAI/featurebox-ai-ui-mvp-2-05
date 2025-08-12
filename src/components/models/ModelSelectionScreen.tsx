import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Info, CheckCircle, LineChart } from 'lucide-react';
import GlassMorphCard from '../ui/GlassMorphCard';
import ProgressIndicator from '../ui/ProgressIndicator';
import { staggerContainer, staggerItem } from '@/utils/transitions';
import { useForecast } from '@/context/ForecastContext';

const steps = ["Onboarding", "Data Source", "Model Selection", "Generated Forecast", "Dashboard"];
// const POLLING_INTERVAL = 5 * 60 * 1000; // 5 minutes

const ModelSelectionScreen: React.FC = () => {
  const navigate = useNavigate();
  const { forecastType, forecastResult } = useForecast();
  const [recommendedModel, setRecommendedModel] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloadReady, setIsDownloadReady] = useState(false); 
  const [forecastStarted, setForecastStarted] = useState(false);

  // --- IMPORTANT: useRef declared at the top-level, not inside useEffect ---
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('[DEBUG] ModelSelectionScreen - Forecast Type:', forecastType);
    console.log('[DEBUG] ModelSelectionScreen - Forecast Result:', forecastResult);
    if (forecastResult) {
      setIsAnalyzing(false);
      setRecommendedModel(forecastResult?.model_selected || "Default Model");
    } else {
      const timer = setTimeout(() => {
        setIsAnalyzing(false);
        setRecommendedModel('Default Model');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [forecastType, forecastResult]);

  // --- Polling useEffect ---
  useEffect(() => {
    // Only start polling after forecast has started
    if (forecastStarted && !pollIntervalRef.current) {
      const checkStatus = async () => {
        console.log('[DEBUG] Polling: Checking forecast status...');
        try {
          const res = await fetch(`${import.meta.env.VITE_AUTH_API_URL}/status`);
          if (!res.ok) throw new Error(`Status check failed: ${res.status}`);
          const data = await res.json();
          console.log('[DEBUG] Forecast status:', data);

          if (data.status === "completed") {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            setIsGenerating(false);
            setIsDownloadReady(true);
            setStatusMessage("Forecast completed! Ready to download.");
          } else if (data.status === "error") {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            setIsGenerating(false);
            setIsDownloadReady(false);
            setStatusMessage("Error in forecast. Please try again.");
          } else if (data.status === "running" || data.status === "started") {
            setStatusMessage("Forecast is running...");
            setIsDownloadReady(false);
            setIsGenerating(true);
          }
        } catch (err) {
          console.error('[ERROR] Polling failed:', err);
          setStatusMessage("Unable to check forecast status.");
        }
      };

      // Do immediate check and start interval
      checkStatus();
      pollIntervalRef.current = setInterval(checkStatus, POLLING_INTERVAL);
      console.log('[DEBUG] Polling interval started');
    }

    // Cleanup
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
        console.log('[DEBUG] Polling interval cleared');
      }
    };
  }, [forecastStarted]);

  const handleBack = () => {
    navigate('/data-source');
  };

  // Start forecast
  const handleContinue = async () => {
    setIsGenerating(true); 
    setForecastStarted(true);
    setStatusMessage("Starting forecast...");
    try {
      const startRes = await fetch("https://featurebox-ai-backend-service-666676702816.us-west1.run.app/start-forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!startRes.ok) throw new Error("Failed to start forecast");
      setStatusMessage("Forecast started successfully...");
      console.log("[DEBUG] Forecast started successfully");
    } catch (err) {
      console.error("[ERROR] Failed to start forecast:", err);
      setIsGenerating(false);
      setForecastStarted(false);
      setStatusMessage("Failed to start forecast. Please try again.");
    }
  };

  const downloadForecast = async () => {
    try {
      const res = await fetch("https://featurebox-ai-backend-service-666676702816.us-west1.run.app/download-forecast");
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "forecast_results.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[ERROR] Failed to download forecast:", err);
    }
  };

  return (
    <div className="container max-w-5xl px-4 py-12 mx-auto">
      <ProgressIndicator steps={steps} currentStep={2} />
      <motion.div 
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">Recommended Forecast Model</h1>
        <p className="text-lg text-gray-600">We'll use the optimal model automatically.</p>
        {forecastType && (
          <p className="mt-2 text-sm text-primary">Forecast type: {forecastType}</p>
        )}
      </motion.div>
      <GlassMorphCard className="mb-8" hover={false}>
        {isAnalyzing ? (
          <div className="flex items-center">
            <div className="animate-spin mr-2">
              <LineChart className="text-primary" size={20} />
            </div>
            <span className="text-sm">Analyzing data patterns...</span>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-medium mb-2">{recommendedModel} selected</h3>
            {statusMessage && (
              <p className="mt-2 text-sm text-primary">{statusMessage}</p>
            )}
            {isGenerating && (
              <div className="flex items-center mt-4">
                <div className="animate-spin mr-2">
                  <LineChart className="text-primary" size={20} />
                </div>
                <span className="text-sm">Generating forecast...</span>
              </div>
            )}
          </div>
        )}
      </GlassMorphCard>
      <div className="flex justify-between">
        <motion.button
          whileHover={isGenerating ? {} : { scale: 1.02 }}
          whileTap={isGenerating ? {} : { scale: 0.98 }}
          className={`btn-primary ${isGenerating ? "opacity-50 cursor-not-allowed bg-gray-400" : ""}`}
          disabled={isGenerating}
          onClick={handleContinue}
        >
          {isGenerating ? "Running..." : "Generate Forecast"}
        </motion.button>
        {isDownloadReady && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary ml-4"
            onClick={downloadForecast}
          >
            Download Forecast
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default ModelSelectionScreen;
