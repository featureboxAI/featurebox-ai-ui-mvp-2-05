import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, LineChart, Download, AlertTriangle } from 'lucide-react';
import GlassMorphCard from '../ui/GlassMorphCard';
import ProgressIndicator from '../ui/ProgressIndicator';
import { pageTransition } from '@/utils/transitions';

const steps = ["Onboarding", "Data Source", "Model Selection", "Forecast Setup", "Constraints", "Dashboard"];

// Sample forecast data
const sampleForecastData = [
  { sku: 'ALX-001', name: 'Men\'s Basic Tee', forecast: 215, confidence: '±35', stockout: 'None', suggested: 250 },
  { sku: 'ALX-002', name: 'Women\'s V-Neck Tee', forecast: 340, confidence: '±42', stockout: 'July 15', suggested: 400 },
  { sku: 'ALX-003', name: 'Slim Fit Jeans', forecast: 120, confidence: '±18', stockout: 'None', suggested: 130 },
  { sku: 'ALX-004', name: 'Hooded Sweatshirt', forecast: 85, confidence: '±12', stockout: 'None', suggested: 100 },
  { sku: 'ALX-005', name: 'Casual Shorts', forecast: 175, confidence: '±28', stockout: 'July 22', suggested: 210 },
];

const ForecastSetupScreen: React.FC = () => {
  const navigate = useNavigate();
  const [horizonDays, setHorizonDays] = useState<number>(30);
  const [customRange, setCustomRange] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [forecastGenerated, setForecastGenerated] = useState(false);
  
  const handleGenerateForecast = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setForecastGenerated(true);
    }, 3000);
  };
  
  const handleBack = () => {
    navigate('/model-selection');
  };
  
  const handleContinue = () => {
    navigate('/dashboard');
  };

  return (
    <motion.div 
      className="container max-w-5xl px-4 py-12 mx-auto"
      {...pageTransition}
    >
      <ProgressIndicator steps={steps} currentStep={3} />
      
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Demand Forecast Setup</h1>
        <p className="text-lg text-gray-600">Configure your forecast horizon and generate predictions.</p>
      </div>
      
      <GlassMorphCard className="mb-8" hover={false}>
        <h2 className="text-xl font-semibold mb-6">Forecast Horizon</h2>
        
        <div className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
            {[30, 60, 90, 180].map((days) => (
              <button
                key={days}
                className={`p-4 rounded-lg border transition-all ${
                  !customRange && horizonDays === days 
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                } flex flex-col items-center`}
                onClick={() => {
                  setHorizonDays(days);
                  setCustomRange(false);
                }}
              >
                <span className="text-lg font-semibold">{days}</span>
                <span className="text-sm text-gray-600">Days</span>
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-2 mb-4">
            <div className={`w-5 h-5 rounded-full border cursor-pointer ${
              customRange ? 'border-primary' : 'border-gray-300'
            } flex items-center justify-center`}
            onClick={() => setCustomRange(true)}>
              {customRange && <div className="w-3 h-3 rounded-full bg-primary" />}
            </div>
            <span className="text-sm font-medium" onClick={() => setCustomRange(true)}>Custom Range</span>
          </div>
          
          {customRange && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`btn-primary flex items-center ${isGenerating ? 'opacity-80' : ''}`}
            onClick={handleGenerateForecast}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin mr-2">
                  <LineChart size={20} />
                </div>
                Generating Forecast...
              </>
            ) : (
              <>
                <LineChart size={18} className="mr-2" />
                Generate Forecast
              </>
            )}
          </motion.button>
        </div>
        
        {isGenerating && (
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div className="bg-primary h-2 rounded-full animate-shimmer bg-gradient-to-r from-blue-500 via-primary to-blue-500 background-size-200" style={{ width: '70%' }}></div>
            </div>
            <div className="text-center text-sm text-gray-600">Processing data and generating forecast...</div>
          </div>
        )}
      </GlassMorphCard>
      
      {forecastGenerated && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-xl p-6 shadow-sm mb-8 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Forecast Results</h2>
              <button className="text-primary flex items-center text-sm font-medium">
                <Download size={16} className="mr-1" />
                Export to CSV
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
                  {sampleForecastData.map((item, index) => (
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
                Showing 5 of 5 products • Generated on {new Date().toLocaleDateString()}
              </div>
              <button className="text-primary underline text-sm" onClick={() => {/* Add logic to view full details */}}>
                View Full Details
              </button>
            </div>
          </div>
        </motion.div>
      )}
      
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
          className={`btn-primary ${!forecastGenerated ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!forecastGenerated}
          onClick={handleContinue}
        >
          Continue to Dashboard
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ForecastSetupScreen;
