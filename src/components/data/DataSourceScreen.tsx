import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Database, Upload, FileSpreadsheet, ShoppingBag, ArrowLeft, Download } from 'lucide-react';
import GlassMorphCard from '../ui/GlassMorphCard';
import ProgressIndicator from '../ui/ProgressIndicator';
import { staggerContainer, staggerItem } from '@/utils/transitions';

const steps = ["Onboarding", "Data Source", "Model Selection", "Forecast Setup", "Dashboard"];

const DataSourceScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleSourceSelect = (source: string) => {
    setSelectedSource(source);
    
    // Simulate file upload if a file source is selected
    if (source === 'csv' || source === 'excel') {
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
      }, 2000);
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
      </motion.div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={staggerItem}>
          <GlassMorphCard 
            className={`h-full ${selectedSource === 'sheets' ? 'ring-2 ring-primary' : ''}`}
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
            className={`h-full ${['shopify', 'csv', 'excel'].includes(selectedSource || '') ? 'ring-2 ring-primary' : ''}`}
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
                  className={`p-4 rounded-lg border transition-all ${
                    selectedSource === 'shopify' 
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                  } flex flex-col items-center`}
                  onClick={() => handleSourceSelect('shopify')}
                >
                  <ShoppingBag size={24} className="text-gray-700 mb-2" />
                  <span className="text-sm font-medium">Shopify</span>
                </button>
                
                <button 
                  className={`p-4 rounded-lg border transition-all ${
                    selectedSource === 'csv' 
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                  } flex flex-col items-center`}
                  onClick={() => handleSourceSelect('csv')}
                >
                  <Upload size={24} className="text-gray-700 mb-2" />
                  <span className="text-sm font-medium">CSV</span>
                </button>
                
                <button 
                  className={`p-4 rounded-lg border transition-all ${
                    selectedSource === 'excel' 
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                  } flex flex-col items-center`}
                  onClick={() => handleSourceSelect('excel')}
                >
                  <FileSpreadsheet size={24} className="text-gray-700 mb-2" />
                  <span className="text-sm font-medium">Excel</span>
                </button>
              </div>
              
              {isUploading && (
                <div className="bg-blue-50 p-4 rounded-lg mt-auto">
                  <div className="flex items-center mb-2">
                    <div className="mr-2 animate-pulse">
                      <Upload size={18} className="text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-blue-700">Uploading file...</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-shimmer bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 background-size-200" style={{ width: '60%' }}></div>
                  </div>
                </div>
              )}
              
              {selectedSource === 'shopify' && (
                <div className="bg-blue-50 p-4 rounded-lg mt-auto">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">Connect your Shopify store:</span> You'll be prompted to authorize access to your store data.
                  </p>
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
          className={`btn-primary ${!selectedSource ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!selectedSource}
          onClick={handleContinue}
        >
          Continue to Model Selection
        </motion.button>
      </div>
    </div>
  );
};

export default DataSourceScreen;
