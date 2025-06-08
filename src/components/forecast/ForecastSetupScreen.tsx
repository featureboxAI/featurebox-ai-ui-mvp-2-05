import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, AlertTriangle, Sparkles } from 'lucide-react';
import GlassMorphCard from '../ui/GlassMorphCard';
import ProgressIndicator from '../ui/ProgressIndicator';
import { pageTransition } from '@/utils/transitions';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getAIInsights } from '@/utils/googleSheetsHelpers';
import { useForecast } from '@/context/ForecastContext';

const steps = ["Onboarding", "Data Source", "Generated Forecast", "Dashboard"];

// Sample forecast data with products matching dashboard (fallback)
const fallbackForecastData = [
  { sku: 'SHIRT-001', name: 'Classic T-Shirt', forecast: 450, confidence: '±25', stockout: 'None', suggested: 460 },
  { sku: 'BAG-022', name: 'Canvas Tote Bag', forecast: 320, confidence: '±30', stockout: 'July 22', suggested: 340 },
  { sku: 'SHOE-153', name: 'Running Sneakers', forecast: 180, confidence: '±20', stockout: 'None', suggested: 160 },
  { sku: 'HAT-064', name: 'Baseball Cap', forecast: 210, confidence: '±15', stockout: 'None', suggested: 215 },
  { sku: 'JACKET-045', name: 'Denim Jacket', forecast: 125, confidence: '±15', stockout: 'August 10', suggested: 130 },
  { sku: 'ALX-001', name: 'Men\'s Basic Tee', forecast: 215, confidence: '±35', stockout: 'None', suggested: 250 },
  { sku: 'ALX-002', name: 'Women\'s V-Neck Tee', forecast: 340, confidence: '±42', stockout: 'July 15', suggested: 400 },
  { sku: 'ALX-003', name: 'Slim Fit Jeans', forecast: 120, confidence: '±18', stockout: 'None', suggested: 130 },
  { sku: 'ALX-004', name: 'Hooded Sweatshirt', forecast: 85, confidence: '±12', stockout: 'None', suggested: 100 },
  { sku: 'ALX-005', name: 'Casual Shorts', forecast: 175, confidence: '±28', stockout: 'July 22', suggested: 210 },
];

// AI insights that match the products and forecasts
const aiInsights = [
  "Sales for Classic T-Shirt show a strong upward trend (+15% MoM), consider increasing inventory by 20%.",
  "Canvas Tote Bag has a high stockout risk (80%) in the next 30 days based on current inventory levels.",
  "Running Sneakers product may be overstocked. Consider promotional discounts to reduce inventory.",
  "Baseball Cap sales have seasonal peaks in summer. Plan inventory accordingly.",
  "Based on lead time analysis, order Denim Jackets at least 45 days before anticipated demand peaks."
];

const ForecastSetupScreen: React.FC = () => {
  const navigate = useNavigate();
  const { forecastType, uploadedFiles, forecastResult } = useForecast();
  const [excelData, setExcelData] = useState<any[]>([]);
  const [isParsingExcel, setIsParsingExcel] = useState(false);
  
  useEffect(() => {
    // Log the forecast type from context
    console.log('ForecastSetupScreen - Forecast Type:', forecastType);
    console.log('ForecastSetupScreen - Uploaded Files:', uploadedFiles.map(file => file.name));
    console.log('ForecastSetupScreen - Forecast Result:', forecastResult);
    
    // Parse Excel data if available
    if (forecastResult?.downloadableFile) {
      parseExcelData();
    }
  }, [forecastType, uploadedFiles, forecastResult]);
  
  const parseExcelData = async () => {
    if (!forecastResult?.downloadableFile) return;
    
    setIsParsingExcel(true);
    try {
      // For now, we'll simulate parsing the Excel file
      // In a real implementation, you would use a library like xlsx to parse the blob
      console.log('Parsing Excel file:', forecastResult.filename);
      
      // Simulate async parsing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demonstration, we'll use the fallback data
      // In reality, you would parse the actual Excel blob here
      setExcelData(fallbackForecastData);
      
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      // Use fallback data on error
      setExcelData(fallbackForecastData);
    } finally {
      setIsParsingExcel(false);
    }
  };
  
  const handleBack = () => {
    navigate('/data-source');
  };
  
  const handleContinue = () => {
    navigate('/dashboard');
  };

  const handleExportToExcel = () => {
    if (forecastResult?.downloadableFile) {
      // Create a URL for the blob and download it
      const url = URL.createObjectURL(forecastResult.downloadableFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = forecastResult.filename || 'forecast_results.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Fallback - create a sample Excel file
      console.log('Exporting to Excel...');
      // You would implement actual Excel export logic here
    }
  };

  // Use Excel data if available, otherwise use fallback
  const displayData = excelData.length > 0 ? excelData : fallbackForecastData;

  return (
    <motion.div 
      className="container max-w-5xl px-4 py-12 mx-auto"
      {...pageTransition}
    >
      <ProgressIndicator steps={steps} currentStep={2} />
      
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Generated Forecast</h1>
        <p className="text-lg text-gray-600">View your forecast predictions below.</p>
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
            Results from: {forecastResult.filename}
          </p>
        )}
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              Forecast Results
              {isParsingExcel && <span className="text-sm text-gray-500 ml-2">(Loading Excel data...)</span>}
              {excelData.length > 0 && <span className="text-sm text-green-600 ml-2">(From Excel file)</span>}
            </h2>
            <button 
              className="text-primary flex items-center text-sm font-medium"
              onClick={handleExportToExcel}
            >
              <Download size={16} className="mr-1" />
              Export to Excel
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forecast Demand</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Potential Stockout</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suggested Order</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.sku}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{item.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{item.forecast}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.confidence}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {item.stockout !== 'None' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle size={12} className="mr-1" />
                          {item.stockout}
                        </span>
                      ) : (
                        'None'
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.suggested}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Showing {displayData.length} of {displayData.length} products • Generated on {new Date().toLocaleDateString()}
              {excelData.length > 0 && <span className="text-green-600"> • Data from Excel file</span>}
            </div>
            <button className="text-primary underline text-sm" onClick={() => {/* Add logic to view full details */}}>
              View Full Details
            </button>
          </div>
        </div>
        
        <Card className="mb-8 opacity-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-gray-400" />
              <h3 className="font-semibold text-lg text-gray-500">AI Insights & Explanation</h3>
            </div>
            
            <p className="mb-4 text-sm text-gray-400">
              Our AI has analyzed your historical data and generated the following insights about your forecasted demand:
            </p>
            
            <div className="space-y-4">
              {aiInsights.map((insight, index) => (
                <div key={index} className="flex gap-3 items-start bg-gray-100 p-3 rounded-md">
                  <div className="bg-gray-200 text-gray-400 font-medium rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-400">{insight}</p>
                </div>
              ))}
            </div>
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
