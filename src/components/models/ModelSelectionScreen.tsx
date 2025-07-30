import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Info, CheckCircle, LineChart } from 'lucide-react';
import GlassMorphCard from '../ui/GlassMorphCard';
import ProgressIndicator from '../ui/ProgressIndicator';
import { staggerContainer, staggerItem } from '@/utils/transitions';
import { useForecast } from '@/context/ForecastContext';

const steps = ["Onboarding", "Data Source", "Model Selection", "Generated Forecast", "Dashboard"];

const POLLING_INTERVAL = 5 * 60 * 1000; // 5 minutes

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

  // =============================
  // NEW: Polling /status every 5 min
  // =============================
  useEffect(() => {
    let pollInterval: ReturnType<typeof setInterval>;

    const checkStatus = async () => {
      try {
        console.log("[DEBUG] Checking forecast status...");
        const res = await fetch("https://featurebox-ai-backend-service-666676702816.us-west1.run.app/status");
        if (!res.ok) throw new Error(`Status check failed: ${res.status}`);
        
        const data = await res.json();
        console.log("[DEBUG] Forecast status:", data);

        if (data.status === "completed") {
          clearInterval(pollInterval);
          setIsGenerating(false); // Enable button again
          setStatusMessage("Forecast completed!");
          navigate("/results"); // Move to results screen
        } else if (data.status === "error") {
          clearInterval(pollInterval);
          setIsGenerating(false);
          setStatusMessage("Error in forecast. Please try again.");
          setIsDownloadReady(false);
        } else if (data.status === "running") {
          setStatusMessage("Forecast is running..."); // Clean message
        } else if (data.status === "started") {
          setStatusMessage("Forecast is started"); // Clean message
        } else {
          setStatusMessage(`Status: ${data.status}`); // Fallback clean message
        }
      } catch (err) {
        console.error("[ERROR] Polling failed:", err);
      }
    };

    // Start polling immediately when component mounts
    pollInterval = setInterval(checkStatus, POLLING_INTERVAL);
    checkStatus(); // Immediate check so we don’t wait 5 mins for first status

    return () => clearInterval(pollInterval); // Cleanup
  }, [navigate]);


  const handleBack = () => {
    navigate('/data-source');
  };
  
  // const handleContinue = () => {
  //   navigate('/forecast-setup');
  // };

  // Trigger forecast start + disable button
  const handleContinue = () => {
    setIsGenerating(true);
    setStatusMessage("Forecast started...");
    // Polling will handle completion
  };

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
          </div>
        )}
      </GlassMorphCard>
      
      <div className="flex justify-between">
        <motion.button
          whileHover={!isGenerating ? { scale: 1.02 } : {}} // NEW: Disable hover when running
          whileTap={!isGenerating ? { scale: 0.98 } : {}}
          className={`btn-primary ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`} // NEW: Grey style
          disabled={isGenerating} // NEW: Disable click
          onClick={handleContinue}
        >
          {isGenerating ? "Running..." : "Generate Forecast"} 
        </motion.button>

        # Download button shown only when ready
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








//   return (
//     <div className="container max-w-5xl px-4 py-12 mx-auto">
//       <ProgressIndicator steps={steps} currentStep={2} />
      
//       <motion.div 
//         className="mb-8 text-center"
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         <h1 className="text-3xl font-bold tracking-tight mb-2">Recommended Forecast Model</h1>
//         <p className="text-lg text-gray-600">We'll automatically select the best model based on your data.</p>
//         {forecastType && (
//           <p className="mt-2 text-sm font-medium text-primary">Selected forecast type: {forecastType}</p>
//         )}
//       </motion.div>
      
//       <GlassMorphCard className="mb-8" hover={false}>
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-xl font-semibold">Auto-Inferred Model</h2>
//           {isAnalyzing ? (
//             <div className="flex items-center">
//               <div className="animate-spin mr-2">
//                 <LineChart className="text-primary" size={20} />
//               </div>
//               <span className="text-sm">Analyzing data patterns...</span>
//             </div>
//           ) : (
//             <div className="flex items-center text-green-600">
//               <CheckCircle size={20} className="mr-2" />
//               <span className="text-sm font-medium">Analysis complete</span>
//             </div>
//           )}
//         </div>
        
//         {isAnalyzing ? (
//           <div className="animate-pulse space-y-4">
//             <div className="h-8 bg-gray-200 rounded w-1/3"></div>
//             <div className="h-4 bg-gray-200 rounded w-full"></div>
//             <div className="h-4 bg-gray-200 rounded w-5/6"></div>
//           </div>
//         ) : (
//           <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
//             <div className="flex items-start">
//               <div className="flex-shrink-0 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mr-6">
//                 <LineChart className="text-primary" size={28} />
//               </div>
              
//               <div>
//                 <h3 className="text-lg font-medium mb-2">{recommendedModel} is recommended for your data</h3>
//                 <p className="text-gray-600 mb-4">
//                   Based on your business type and forecast type ({forecastType || 'Not specified'}), 
//                   we recommend {recommendedModel} for its ability to handle {forecastType === 'Seasonality' ? 'seasonal patterns' : 'promotional impacts'}.
//                 </p>
                
//                 <h4 className="font-medium mb-2">Why this model?</h4>
//                 <ul className="list-disc pl-5 space-y-1 text-gray-700">
//                   {recommendedModel === 'SARIMA' && (
//                     <>
//                       <li>We detected clear weekly and yearly seasonality in your data</li>
//                       <li>Your data shows strong seasonal patterns that SARIMA handles well</li>
//                       <li>You have sufficient historical data for accurate forecasting</li>
//                     </>
//                   )}
//                   {recommendedModel === 'Prophet' && (
//                     <>
//                       <li>We detected multiple seasonal patterns in your data</li>
//                       <li>Your data has trend changepoints that Prophet handles well</li>
//                       <li>Your business data has holiday effects that benefit from Prophet's modeling</li>
//                     </>
//                   )}
//                   {recommendedModel === 'LightGBM' && (
//                     <>
//                       <li>Your data has complex patterns and many features</li>
//                       <li>Non-linear relationships detected in your historical data</li>
//                       <li>External factors significantly impact your forecast</li>
//                     </>
//                   )}
//                   {recommendedModel === 'Ensemble' && (
//                     <>
//                       <li>Your data benefits from multiple modeling approaches</li>
//                       <li>Reduced forecast error through model combination</li>
//                       <li>More stable predictions across different business scenarios</li>
//                     </>
//                   )}
//                 </ul>
//               </div>
//             </div>
//           </div>
//         )}
//       </GlassMorphCard>
      
//       <div className="mb-8">
//         <button 
//           className="flex items-center text-primary mb-4"
//           onClick={() => setShowAdvanced(!showAdvanced)}
//         >
//           <span className="font-medium mr-2">Advanced Model Override</span>
//           {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//         </button>
        
//         {showAdvanced && (
//           <motion.div 
//             className="bg-gray-50 border border-gray-200 rounded-lg p-6"
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: 'auto' }}
//             transition={{ duration: 0.3 }}
//           >
//             <div className="flex items-center mb-4">
//               <Info size={18} className="text-amber-500 mr-2" />
//               <p className="text-sm text-gray-700">
//                 <span className="font-medium">Model override is for advanced users only.</span> Our recommended model is optimized based on your data characteristics.
//               </p>
//             </div>
            
//             <div className="grid grid-cols-1 gap-4">
//               {models.map((model) => (
//                 <div 
//                   key={model.id}
//                   className={`p-4 rounded-lg border cursor-pointer transition-all ${
//                     selectedModel === model.id 
//                       ? 'border-primary bg-primary/5'
//                       : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
//                   }`}
//                   onClick={() => handleModelSelect(model.id)}
//                 >
//                   <div className="flex items-start">
//                     <div className={`mt-1 w-5 h-5 rounded-full border ${
//                       selectedModel === model.id ? 'border-primary' : 'border-gray-300'
//                     } flex items-center justify-center mr-3`}>
//                       {selectedModel === model.id && (
//                         <div className="w-3 h-3 rounded-full bg-primary" />
//                       )}
//                     </div>
                    
//                     <div className="flex-1">
//                       <div className="flex items-center justify-between">
//                         <h4 className="font-medium">{model.name}</h4>
//                         {model.id === recommendedModel && !isAnalyzing && (
//                           <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Recommended</span>
//                         )}
//                       </div>
//                       <p className="text-sm text-gray-600 mt-1">{model.description}</p>
                      
//                       <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
//                         <div>
//                           <span className="font-medium block mb-1">Key Strengths:</span>
//                           <ul className="list-disc pl-4 text-gray-700 space-y-0.5">
//                             {model.strengths.map((strength, i) => (
//                               <li key={i}>{strength}</li>
//                             ))}
//                           </ul>
//                         </div>
//                         <div>
//                           <span className="font-medium block mb-1">Data Requirements:</span>
//                           <p className="text-gray-700">{model.dataNeeded}</p>
//                           <span className="font-medium block mt-2 mb-1">Complexity:</span>
//                           <p className="text-gray-700">{model.complexity}</p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </motion.div>
//         )}
//       </div>
      
//       <div className="flex justify-between">
//         <motion.button
//           whileHover={{ scale: 1.02 }}
//           whileTap={{ scale: 0.98 }}
//           className="btn-outline flex items-center"
//           onClick={handleBack}
//         >
//           <ArrowLeft size={18} className="mr-2" />
//           Back
//         </motion.button>
        
//         <motion.button
//           whileHover={{ scale: 1.02 }}
//           whileTap={{ scale: 0.98 }}
//           className="btn-primary"
//           onClick={handleContinue}
//         >
//           Generate Forecast
//         </motion.button>
//       </div>
//     </div>
//   );
// };

// export default ModelSelectionScreen;
