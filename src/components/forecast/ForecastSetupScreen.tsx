import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Sparkles, CheckCircle } from 'lucide-react';
import GlassMorphCard from '../ui/GlassMorphCard';
import ProgressIndicator from '../ui/ProgressIndicator';
import { pageTransition } from '@/utils/transitions';
import { Card, CardContent } from '@/components/ui/card';
import { useForecast } from '@/context/ForecastContext';

const steps = ["Onboarding", "Data Source", "Generated Forecast", "Dashboard"];

const ForecastSetupScreen: React.FC = () => {
  const navigate = useNavigate();
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

  const handleExportToExcel = () => {
    if (!forecastResult?.download_url) {
      console.error("❌ Excel download failed: No download URL found in forecast result.");
      toast({
        title: "Download failed",
        description: "Failed to download forecast result. Please try again.",
        variant: "destructive",
      });
      return;
    }
  
    const link = document.createElement('a');
    link.href = forecastResult.download_url;
    link.download = forecastResult.filename || 'forecast_results.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  
      
    
  return (
    <motion.div 
      className="container max-w-5xl px-4 py-12 mx-auto"
      {...pageTransition}
    >
      <ProgressIndicator steps={steps} currentStep={2} />

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Generated Forecast</h1>
        <p className="text-lg text-gray-600">Your forecast has been generated successfully.</p>
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
            disabled={!forecastResult?.download_url} // ✅ only allow if path available
          >
            <Download size={24} className="mr-3" />
            Download Forecast Results
          </motion.button>
        </div>

        <Card className="mb-8 opacity-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-gray-400" />
              <h3 className="font-semibold text-lg text-gray-500">AI Insights & Analysis</h3>
            </div>

            <p className="text-sm text-gray-400">
              Detailed AI insights and recommendations will be available in the dashboard after you continue.
              The downloaded Excel file contains your complete forecast data with predictions and confidence intervals.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <div className="flex justify-between">
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
          className="btn-primary"
          onClick={handleContinue}
        >
          Continue to Dashboard
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ForecastSetupScreen;



// import React, { useEffect, useState } from 'react';
// import { motion } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';
// import { ArrowLeft, Download, Sparkles, CheckCircle } from 'lucide-react';
// import GlassMorphCard from '../ui/GlassMorphCard';
// import ProgressIndicator from '../ui/ProgressIndicator';
// import { pageTransition } from '@/utils/transitions';
// import { Card, CardContent } from '@/components/ui/card';
// import { useForecast } from '@/context/ForecastContext';

// const steps = ["Onboarding", "Data Source", "Generated Forecast", "Dashboard"];

// const ForecastSetupScreen: React.FC = () => {
//   const navigate = useNavigate();
//   const { forecastType, uploadedFiles, forecastResult } = useForecast();
  
//   useEffect(() => {
//     console.log('ForecastSetupScreen - Forecast Type:', forecastType);
//     console.log('ForecastSetupScreen - Uploaded Files:', uploadedFiles.map(file => file.name));
//     console.log('ForecastSetupScreen - Forecast Result:', forecastResult);
//   }, [forecastType, uploadedFiles, forecastResult]);
  
//   const handleBack = () => {
//     navigate('/data-source');
//   };
  
//   const handleContinue = () => {
//     navigate('/dashboard');
//   };

//   const handleExportToExcel = () => {
//     // ✅ NEW: Use blob from forecastResult (already downloaded in DataSourceScreen)
//     const blob = forecastResult?.downloadableFile;
//     if (!blob) {
//       alert("No downloadable forecast available.");
//       return;
//     }

//     const filename = forecastResult?.filename || "forecast_results.xlsx";

//     // ✅ Create and trigger download from blob
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = filename;
//     document.body.appendChild(a);
//     a.click();
//     a.remove();
//     window.URL.revokeObjectURL(url);
//   };

//   return (
//     <motion.div 
//       className="container max-w-5xl px-4 py-12 mx-auto"
//       {...pageTransition}
//     >
//       <ProgressIndicator steps={steps} currentStep={2} />

//       <div className="mb-8 text-center">
//         <h1 className="text-3xl font-bold tracking-tight mb-2">Generated Forecast</h1>
//         <p className="text-lg text-gray-600">Your forecast has been generated successfully.</p>
//         {forecastType && (
//           <p className="mt-2 text-sm font-medium text-primary">Using forecast type: {forecastType}</p>
//         )}
//         {uploadedFiles && uploadedFiles.length > 0 && (
//           <p className="mt-1 text-sm text-gray-500">
//             {uploadedFiles.length === 1 
//               ? `File: ${uploadedFiles[0].name}` 
//               : `Files: ${uploadedFiles.length} files uploaded`}
//           </p>
//         )}
//         {forecastResult?.filename && (
//           <p className="mt-1 text-sm text-green-600">
//             Results generated: {forecastResult.filename}
//           </p>
//         )}
//       </div>

//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         <div className="bg-white rounded-xl p-8 shadow-sm mb-8 border border-gray-100 text-center">
//           <div className="flex justify-center mb-6">
//             <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
//               <CheckCircle size={32} />
//             </div>
//           </div>

//           <h2 className="text-2xl font-semibold mb-4">Forecast Generated Successfully!</h2>
//           <p className="text-gray-600 mb-8">
//             Your demand forecast has been processed and is ready for download. 
//             Click the button below to download your results as an Excel file.
//           </p>

//           <motion.button 
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             className="btn-primary flex items-center mx-auto text-lg px-8 py-4"
//             onClick={handleExportToExcel}
//             disabled={!forecastResult?.downloadableFile}  // ✅ disable if blob isn't ready
//           >
//             <Download size={24} className="mr-3" />
//             Download Forecast Results
//           </motion.button>

//           {forecastResult?.downloadableFile && (
//             <p className="mt-4 text-sm text-gray-500">
//               File size: {(forecastResult.downloadableFile.size / 1024).toFixed(2)} KB
//             </p>
//           )}
//         </div>

//         <Card className="mb-8 opacity-50">
//           <CardContent className="p-6">
//             <div className="flex items-center gap-2 mb-4">
//               <Sparkles className="h-5 w-5 text-gray-400" />
//               <h3 className="font-semibold text-lg text-gray-500">AI Insights & Analysis</h3>
//             </div>

//             <p className="text-sm text-gray-400">
//               Detailed AI insights and recommendations will be available in the dashboard after you continue.
//               The downloaded Excel file contains your complete forecast data with predictions and confidence intervals.
//             </p>
//           </CardContent>
//         </Card>
//       </motion.div>

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
//           Continue to Dashboard
//         </motion.button>
//       </div>
//     </motion.div>
//   );
// };

// export default ForecastSetupScreen;




























// //   const handleExportToExcel = async () => {
// //     try {
// //       // const response = await fetch("https://your-cloud-run-url/get-result");
// //       // const response = await fetch("http://localhost:8000/get-result");
// //       const blob = forecastResult?.downloadableFile;

// //       if (!blob) throw new Error("Download failed");
  
// //       const blob = await response.blob();
// //       const contentDisposition = response.headers.get("Content-Disposition");
// //       console.log("Header Disposition:", contentDisposition);
// //       console.log("Blob type/size:", blob.type, blob.size);
// //       console.log("Blob type:", blob.type); // Should be Excel MIME


// //       const filenameMatch = contentDisposition?.match(/filename="?(.+)"?/);
// //       const filename = filenameMatch?.[1] || "forecast_results.xlsx";
  
// //       const url = window.URL.createObjectURL(blob);
// //       const a = document.createElement("a");
// //       a.href = url;
// //       a.download = filename;
// //       document.body.appendChild(a);
// //       a.click();
// //       a.remove();
// //       window.URL.revokeObjectURL(url);
// //     } catch (err) {
// //       console.error("Download failed:", err);
// //       alert("Failed to download forecast result.");
// //     }
// //   };

// //   return (
// //     <motion.div 
// //       className="container max-w-5xl px-4 py-12 mx-auto"
// //       {...pageTransition}
// //     >
// //       <ProgressIndicator steps={steps} currentStep={2} />
      
// //       <div className="mb-8 text-center">
// //         <h1 className="text-3xl font-bold tracking-tight mb-2">Generated Forecast</h1>
// //         <p className="text-lg text-gray-600">Your forecast has been generated successfully.</p>
// //         {forecastType && (
// //           <p className="mt-2 text-sm font-medium text-primary">Using forecast type: {forecastType}</p>
// //         )}
// //         {uploadedFiles && uploadedFiles.length > 0 && (
// //           <p className="mt-1 text-sm text-gray-500">
// //             {uploadedFiles.length === 1 
// //               ? `File: ${uploadedFiles[0].name}` 
// //               : `Files: ${uploadedFiles.length} files uploaded`}
// //           </p>
// //         )}
// //         {forecastResult?.filename && (
// //           <p className="mt-1 text-sm text-green-600">
// //             Results generated: {forecastResult.filename}
// //           </p>
// //         )}
// //       </div>
      
// //       <motion.div
// //         initial={{ opacity: 0, y: 20 }}
// //         animate={{ opacity: 1, y: 0 }}
// //         transition={{ duration: 0.5 }}
// //       >
// //         <div className="bg-white rounded-xl p-8 shadow-sm mb-8 border border-gray-100 text-center">
// //           <div className="flex justify-center mb-6">
// //             <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
// //               <CheckCircle size={32} />
// //             </div>
// //           </div>
          
// //           <h2 className="text-2xl font-semibold mb-4">Forecast Generated Successfully!</h2>
// //           <p className="text-gray-600 mb-8">
// //             Your demand forecast has been processed and is ready for download. 
// //             Click the button below to download your results as an Excel file.
// //           </p>
          
// //           <motion.button 
// //             whileHover={{ scale: 1.05 }}
// //             whileTap={{ scale: 0.95 }}
// //             className="btn-primary flex items-center mx-auto text-lg px-8 py-4"
// //             onClick={handleExportToExcel}
// //             // disabled={!forecastResult?.downloadableFile}
// //             disabled = {false}
// //           >
// //             <Download size={24} className="mr-3" />
// //             Download Forecast Results
// //           </motion.button>
          
// //           {forecastResult?.downloadableFile && (
// //             <p className="mt-4 text-sm text-gray-500">
// //               File size: {(forecastResult.downloadableFile.size / 1024).toFixed(2)} KB
// //             </p>
// //           )}
// //         </div>
        
// //         <Card className="mb-8 opacity-50">
// //           <CardContent className="p-6">
// //             <div className="flex items-center gap-2 mb-4">
// //               <Sparkles className="h-5 w-5 text-gray-400" />
// //               <h3 className="font-semibold text-lg text-gray-500">AI Insights & Analysis</h3>
// //             </div>
            
// //             <p className="text-sm text-gray-400">
// //               Detailed AI insights and recommendations will be available in the dashboard after you continue.
// //               The downloaded Excel file contains your complete forecast data with predictions and confidence intervals.
// //             </p>
// //           </CardContent>
// //         </Card>
// //       </motion.div>
      
// //       <div className="flex justify-between">
// //         <motion.button
// //           whileHover={{ scale: 1.02 }}
// //           whileTap={{ scale: 0.98 }}
// //           className="btn-outline flex items-center"
// //           onClick={handleBack}
// //         >
// //           <ArrowLeft size={18} className="mr-2" />
// //           Back
// //         </motion.button>
        
// //         <motion.button
// //           whileHover={{ scale: 1.02 }}
// //           whileTap={{ scale: 0.98 }}
// //           className="btn-primary"
// //           onClick={handleContinue}
// //         >
// //           Continue to Dashboard
// //         </motion.button>
// //       </div>
// //     </motion.div>
// //   );
// // };

// // export default ForecastSetupScreen;
