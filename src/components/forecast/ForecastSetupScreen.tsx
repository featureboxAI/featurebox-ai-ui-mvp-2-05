
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, AlertTriangle } from 'lucide-react';
import GlassMorphCard from '../ui/GlassMorphCard';
import ProgressIndicator from '../ui/ProgressIndicator';
import { pageTransition } from '@/utils/transitions';

const steps = ["Onboarding", "Data Source", "Model Selection", "Generated Forecast", "Dashboard"];

// Sample forecast data with more products
const forecastData = [
  { sku: 'ALX-001', name: 'Men\'s Basic Tee', forecast: 215, confidence: '±35', stockout: 'None', suggested: 250 },
  { sku: 'ALX-002', name: 'Women\'s V-Neck Tee', forecast: 340, confidence: '±42', stockout: 'July 15', suggested: 400 },
  { sku: 'ALX-003', name: 'Slim Fit Jeans', forecast: 120, confidence: '±18', stockout: 'None', suggested: 130 },
  { sku: 'ALX-004', name: 'Hooded Sweatshirt', forecast: 85, confidence: '±12', stockout: 'None', suggested: 100 },
  { sku: 'ALX-005', name: 'Casual Shorts', forecast: 175, confidence: '±28', stockout: 'July 22', suggested: 210 },
  { sku: 'ALX-006', name: 'Athletic Socks', forecast: 420, confidence: '±45', stockout: 'None', suggested: 450 },
  { sku: 'ALX-007', name: 'Premium Polo Shirt', forecast: 155, confidence: '±25', stockout: 'August 5', suggested: 190 },
  { sku: 'ALX-008', name: 'Leather Belt', forecast: 90, confidence: '±15', stockout: 'None', suggested: 100 },
  { sku: 'ALX-009', name: 'Wool Beanie', forecast: 110, confidence: '±20', stockout: 'None', suggested: 120 },
  { sku: 'ALX-010', name: 'Women\'s Blouse', forecast: 280, confidence: '±35', stockout: 'July 30', suggested: 320 },
];

const ForecastSetupScreen: React.FC = () => {
  const navigate = useNavigate();
  
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
        <h1 className="text-3xl font-bold tracking-tight mb-2">Generated Forecast</h1>
        <p className="text-lg text-gray-600">View your forecast predictions below.</p>
      </div>
      
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
                {forecastData.map((item, index) => (
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
              Showing {forecastData.length} of {forecastData.length} products • Generated on {new Date().toLocaleDateString()}
            </div>
            <button className="text-primary underline text-sm" onClick={() => {/* Add logic to view full details */}}>
              View Full Details
            </button>
          </div>
        </div>
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
