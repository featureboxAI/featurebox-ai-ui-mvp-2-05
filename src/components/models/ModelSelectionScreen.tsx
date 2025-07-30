import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Info, CheckCircle, LineChart } from 'lucide-react';
import GlassMorphCard from '../ui/GlassMorphCard';
import ProgressIndicator from '../ui/ProgressIndicator';
import { staggerContainer, staggerItem } from '@/utils/transitions';
import { useForecast } from '@/context/ForecastContext';


const steps = ["Onboarding", "Data Source", "Model Selection", "Generated Forecast", "Dashboard"];
console.log("[DEBUG] Setting up polling in useEffect");

const POLLING_INTERVAL =  10 * 1000; // 10 seconds

const ModelSelectionScreen: React.FC = () => {
  console.log("[DEBUG] ModelSelectionScreen component mounted");
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

  useEffect(() => {
    // Log the forecast type from context
    console.log('ModelSelectionScreen - Forecast Type:', forecastType);
    console.log('Forecast Result:', forecastResult);
    
    if (forecastResult) {
      setIsAnalyzing(false);
      // Use the model_selected from the API response
      setRecommendedModel(forecastResult?.model_selected || "Default Model");
    } else {
      // If no forecast result, simulate loading
      const timer = setTimeout(() => {
        setIsAnalyzing(false);
        setRecommendedModel('Default Model');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [forecastType, forecastResult]);

  // Fix 3: Improve polling logic
useEffect(() => {
  console.log("[DEBUG] Polling effect started");
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);


  const checkStatus = async () => {
    try {
      console.log("[DEBUG] Checking forecast status...");
      const res = await fetch("https://featurebox-ai-backend-service-666676702816.us-west1.run.app/status");
      if (!res.ok) throw new Error(`Status check failed: ${res.status}`);
      
      const data = await res.json();
      console.log("[DEBUG] Forecast status:", data);

      if (data.status === "completed") {
        clearInterval(pollIntervalRef.current!);
        setIsGenerating(false);
        setIsDownloadReady(true);
        navigate("/download-results"); // ✅ Move to download page
      } else if (data.status === "error") {
        clearInterval(pollIntervalRef.current!);
        setIsGenerating(false);
        setIsDownloadReady(false);
        setStatusMessage("Error in forecast. Please try again.");
      }
    } catch (err) {
      console.error("[ERROR] Polling failed:", err);
    }
  };

  if (forecastStarted) {
    checkStatus();
    pollIntervalRef.current = setInterval(checkStatus, POLLING_INTERVAL);
  }

  return () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
  };
}, [forecastStarted]);

  // =============================
  // NEW: Polling /status every 5 min
  // =============================
  // useEffect(() => {
  //   console.log("[DEBUG] Polling effect started");
  //   let pollInterval: ReturnType<typeof setInterval>;

  //   const checkStatus = async () => {
  //     try {
  //       console.log("[DEBUG] Checking forecast status...");
  //       const res = await fetch("https://featurebox-ai-backend-service-666676702816.us-west1.run.app/status");
  //       if (!res.ok) throw new Error(`Status check failed: ${res.status}`);
        
  //       const data = await res.json();
  //       console.log("[DEBUG] Forecast status:", data);

  //       if (data.status === "completed") {
  //         clearInterval(pollInterval);
  //         setForecastStarted(false);  // Enable Generate button
  //         setIsDownloadReady(true);
  //         setStatusMessage("Forecast completed! Ready to download.");
  //       } else if (data.status === "error") {
  //         clearInterval(pollInterval);
  //         setForecastStarted(false);
  //         setIsDownloadReady(false);
  //         setStatusMessage("Error in forecast. Please try again.");
  //       } else if (data.status === "running" || data.status === "started") {
  //         setIsGenerating(true);   //  Keeps button greyed out while running
  //         setIsDownloadReady(false);
  //         setStatusMessage("Forecast is running...");
  //       } else {
  //         setStatusMessage(`Forecast status: ${data.status}`);
  //       }
        
  //     } catch (err) {
  //       console.error("[ERROR] Polling failed:", err);
  //     }
  //   };

  //   // Start polling immediately when component mounts
  //   pollInterval = setInterval(checkStatus, POLLING_INTERVAL);
  //   checkStatus(); // Immediate check so we don’t wait 5 mins for first status

  //   return () => clearInterval(pollInterval); // Cleanup
  // },[]); 


  const handleBack = () => {
    navigate('/data-source');
  };

  // Fix 2: Improve the handleContinue function
const handleContinue = async () => {
  // setForecastStarted(true);
  setIsGenerating(true); 
  setForecastStarted(true);
  setStatusMessage("Starting forecast...");
  
  try {
    // Actually trigger the forecast generation
    const startRes = await fetch("https://featurebox-ai-backend-service-666676702816.us-west1.run.app/start-forecast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Add any necessary body data
    });
    
    if (!startRes.ok) throw new Error("Failed to start forecast");
    
    setStatusMessage("Forecast started successfully...");
  } catch (err) {
    console.error("[ERROR] Failed to start forecast:", err);
    // setForecastStarted(false);
    setIsGenerating(false);
    setForecastStarted(false);
    setStatusMessage("Failed to start forecast. Please try again.");
  }
};

  
  // const handleContinue = () => {
  //   navigate('/forecast-setup');
  // };

  // Trigger forecast start + disable button
//   const handleContinue = () => {
//     setForecastStarted(true); // <--- Immediately disables button
//     setIsDownloadReady(false);
//     setStatusMessage("Forecast started...");
//     // Optionally: trigger backend to start forecast here

//   // Immediate status check after forecast starts
//   fetch("https://featurebox-ai-backend-service-666676702816.us-west1.run.app/status")
//     .then(r => r.json())
//     .then(data => {
//       console.log("[DEBUG] Immediate status after start:", data);
//       if (data.status === "completed") {
//         setIsGenerating(false);
//         setIsDownloadReady(true);
//         setStatusMessage("Forecast completed! Ready to download.");
//       } else if (data.status === "running" || data.status === "started") {
//         setIsGenerating(true);
//         setIsDownloadReady(false);
//         setStatusMessage("Forecast is running...");
//       }
//     })
//     .catch(err => console.error("[ERROR] Immediate status check failed:", err));
// };

  // =============================
  // NEW: Function to call /download-forecast
  // =============================
  const downloadForecast = async () => {
    try {
      const res = await fetch(
        "https://featurebox-ai-backend-service-666676702816.us-west1.run.app/download-forecast"
      );
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "forecast_results.xlsx"; // Default filename
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[ERROR] Failed to download forecast:", err);
    }
  };


//   return (
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
        {/* Loading indicator for forecast generation */}
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
    {/* Generate Forecast Button */}
    <motion.button
  whileHover={isGenerating ? {} : { scale: 1.02 }}
  whileTap={isGenerating ? {} : { scale: 0.98 }}
  className={`btn-primary ${isGenerating ? "opacity-50 cursor-not-allowed bg-gray-400" : ""}`}
  disabled={isGenerating}
  onClick={handleContinue}
>
  {isGenerating ? "Running..." : "Generate Forecast"}
</motion.button>


    {/* Download button shown only when ready */}
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

export default ModelSelectionScreen;







