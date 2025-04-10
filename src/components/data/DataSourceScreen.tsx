
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Database, Upload, FileSpreadsheet, ShoppingBag, ArrowLeft, Download, Check } from 'lucide-react';
import GlassMorphCard from '../ui/GlassMorphCard';
import ProgressIndicator from '../ui/ProgressIndicator';
import { staggerContainer, staggerItem } from '@/utils/transitions';
import FileUploadModal from '../ui/FileUploadModal';
import { useForecast } from '@/context/ForecastContext';

const steps = ["Onboarding", "Data Source", "Model Selection", "Forecast Setup", "Dashboard"];

const DataSourceScreen: React.FC = () => {
  const navigate = useNavigate();
  const { forecastType, uploadedFile, isUploadSuccessful } = useForecast();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  useEffect(() => {
    // Log the forecast type coming from the context
    console.log('DataSourceScreen - Forecast Type:', forecastType);
  }, [forecastType]);
  
  const handleSourceSelect = (source: string) => {
    if (source === 'csv') {
      setIsUploadModalOpen(true);
    }
  };
  
  const handleBack = () => {
    navigate('/');
  };
  
  const handleContinue = () => {
    navigate('/model-selection');
  };

  return (
    <div className="container max-w-5xl px-4 py-12 mx-auto">
      <ProgressIndicator steps={steps} currentStep={1} />
      
      <motion.div 
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight mb-2">Connect Your Data</h1>
        <p className="text-lg text-gray-600">Choose how you want to import your sales and inventory data.</p>
        {forecastType && (
          <p className="mt-2 text-sm font-medium text-primary">Selected forecast type: {forecastType}</p>
        )}
      </motion.div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={staggerItem}>
          <GlassMorphCard 
            className={`h-full ${isUploadSuccessful ? 'ring-2 ring-green-500' : ''}`}
            onClick={() => handleSourceSelect('sheets')}
          >
            <div className="flex flex-col items-center text-center h-full">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
                <FileSpreadsheet size={28} />
              </div>
              <h3 className="text-xl font-medium mb-3">Use Current Sheet Data</h3>
              <p className="text-gray-600 mb-6">
                We will read the data from your currently active sheet. Please ensure it follows the template structure.
              </p>
              <div className="bg-green-50 p-4 rounded-lg w-full mt-auto">
                <p className="text-sm text-green-700">
                  <span className="font-medium">Ready to use:</span> This option works with your existing sheet data.
                </p>
              </div>
            </div>
          </GlassMorphCard>
        </motion.div>
        
        <motion.div variants={staggerItem}>
          <GlassMorphCard 
            className={`h-full`}
            onClick={() => {}}
            hover={false}
          >
            <div className="flex flex-col h-full">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Database size={28} />
                </div>
                <h3 className="text-xl font-medium mb-3">Connect External Source</h3>
                <p className="text-gray-600">
                  Import data from external sources like Shopify, CSV, or other spreadsheets.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <button 
                  className={`p-4 rounded-lg border transition-all
                    border-gray-200 hover:border-primary/50 hover:bg-gray-50
                    flex flex-col items-center`}
                >
                  <ShoppingBag size={24} className="text-gray-700 mb-2" />
                  <span className="text-sm font-medium">Shopify</span>
                </button>
                
                <button 
                  className={`p-4 rounded-lg border transition-all
                    ${isUploadSuccessful ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'}
                    flex flex-col items-center`}
                  onClick={() => handleSourceSelect('csv')}
                >
                  {isUploadSuccessful ? (
                    <Check size={24} className="text-green-600 mb-2" />
                  ) : (
                    <Upload size={24} className="text-gray-700 mb-2" />
                  )}
                  <span className="text-sm font-medium">
                    {isUploadSuccessful ? 'Uploaded CSV' : 'CSV'}
                  </span>
                </button>
                
                <button 
                  className={`p-4 rounded-lg border transition-all
                    border-gray-200 hover:border-primary/50 hover:bg-gray-50
                    flex flex-col items-center`}
                >
                  <FileSpreadsheet size={24} className="text-gray-700 mb-2" />
                  <span className="text-sm font-medium">Excel</span>
                </button>
              </div>
              
              {isUploadSuccessful && uploadedFile && (
                <div className="bg-green-50 p-4 rounded-lg mt-auto">
                  <div className="flex items-center mb-2">
                    <Check size={18} className="text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-700">File uploaded successfully</span>
                  </div>
                  <p className="text-xs text-green-600">
                    File: {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(2)} KB)
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Forecast type: {forecastType}
                  </p>
                  <button 
                    onClick={() => setIsUploadModalOpen(true)}
                    className="mt-2 text-xs text-primary underline"
                  >
                    Upload a different file
                  </button>
                </div>
              )}
            </div>
          </GlassMorphCard>
        </motion.div>
      </motion.div>
      
      <GlassMorphCard className="mb-12" hover={false}>
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-4">
            <Download size={24} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Download Template</h3>
            <p className="text-gray-600 mb-4">
              For best results, your data should include these columns:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {['SKU', 'Product Name', 'Category', 'Price', 'Cost', 'Daily Sales', 'Lead Time', 'Min Stock'].map((column) => (
                <div key={column} className="bg-gray-100 px-3 py-2 rounded-md text-sm">{column}</div>
              ))}
            </div>
            <button className="inline-flex items-center px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/5 transition-colors">
              <Download size={18} className="mr-2" />
              Download Sample Template
            </button>
          </div>
        </div>
      </GlassMorphCard>
      
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
          Continue to Model Selection
        </motion.button>
      </div>
      
      <FileUploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={() => {}}
      />
    </div>
  );
};

export default DataSourceScreen;
