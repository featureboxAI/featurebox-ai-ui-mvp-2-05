
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LineChart, ShoppingCart, Briefcase, PlusCircle, ArrowRight } from 'lucide-react';
import GlassMorphCard from '@/components/ui/GlassMorphCard';
import { staggerContainer, staggerItem } from '@/utils/transitions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useForecast } from '@/context/ForecastContext';

const Index = () => {
  const navigate = useNavigate();
  const { setForecastType } = useForecast();
  const [businessType, setBusinessType] = useState('');
  const [salesChannels, setSalesChannels] = useState({ online: '', offline: '' });
  const [forecastingHorizon, setForecastingHorizon] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');

  const handleCardClick = (path: string, isEnabled: boolean = true) => {
    if (isEnabled) {
      navigate(path);
    }
  };

  const handleGoalSelect = (goal: string) => {
    setSelectedGoal(goal);
    // Update the global context with the selected forecast type
    setForecastType(goal);
    console.log('Selected forecast type:', goal);
  };

  const handleContinue = () => {
    // Update the global context with the selected forecast type
    setForecastType(selectedGoal);
    console.log('Navigating to next screen with forecast type:', selectedGoal);
    navigate('/data-source');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="container max-w-5xl mx-auto py-8">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold tracking-tight mb-2">FeatureBox AI</h1>
          <p className="text-lg text-gray-600">Welcome to your intelligent demand forecasting assistant</p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <motion.div variants={staggerItem}>
            <GlassMorphCard 
              className="h-full"
              onClick={() => handleCardClick('/data-source', true)}
            >
              <div className="flex flex-col items-center text-center h-full">
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <LineChart size={28} />
                </div>
                <h3 className="text-xl font-medium mb-3">Demand Forecasting</h3>
                <p className="text-gray-600">
                  Generate forecasts for your upcoming periods based on historical data.
                </p>
              </div>
            </GlassMorphCard>
          </motion.div>

          <motion.div variants={staggerItem}>
            <GlassMorphCard 
              className="h-full opacity-50 cursor-not-allowed"
              onClick={() => handleCardClick('/data-source', false)}
            >
              <div className="flex flex-col items-center text-center h-full">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Briefcase size={28} />
                </div>
                <h3 className="text-xl font-medium mb-3 text-gray-500">Scenario Planning</h3>
                <p className="text-gray-400">
                  Test for "What-if" scenarios.
                </p>
              </div>
            </GlassMorphCard>
          </motion.div>

          <motion.div variants={staggerItem}>
            <GlassMorphCard 
              className="h-full opacity-50 cursor-not-allowed"
              onClick={() => handleCardClick('/data-source', false)}
            >
              <div className="flex flex-col items-center text-center h-full">
                <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4">
                  <PlusCircle size={28} />
                </div>
                <h3 className="text-xl font-medium mb-3 text-gray-500">New Product Introduction</h3>
                <p className="text-gray-400">
                  Estimate the quantity of product without historical data.
                </p>
              </div>
            </GlassMorphCard>
          </motion.div>
        </motion.div>

        <Card className="mb-8 opacity-50">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-500">Business Context</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Business Type</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-400 cursor-not-allowed"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  disabled
                >
                  <option value="">Select Type</option>
                  <option value="apparel">Apparel</option>
                  <option value="beauty">Beauty</option>
                  <option value="electronics">Electronics</option>
                  <option value="homeGoods">Home Goods</option>
                  <option value="food">Food & Beverage</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Forecasting Horizon</label>
                <div className="grid grid-cols-4 gap-2">
                  {[30, 60, 90, 180].map((days) => (
                    <label 
                      key={days}
                      className="flex items-center justify-center p-2 border rounded-md cursor-not-allowed bg-gray-100 border-gray-300 text-gray-400"
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        name="forecastingHorizon"
                        value={days}
                        checked={forecastingHorizon === days.toString()}
                        onChange={(e) => setForecastingHorizon(e.target.value)}
                        disabled
                      />
                      <span>{days} days</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">Sales Channel Split (%)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Online</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g. 60"
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-400 cursor-not-allowed"
                    value={salesChannels.online}
                    onChange={(e) => setSalesChannels({...salesChannels, online: e.target.value})}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Offline</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g. 40"
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-400 cursor-not-allowed"
                    value={salesChannels.offline}
                    onChange={(e) => setSalesChannels({...salesChannels, offline: e.target.value})}
                    disabled
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Forecasting Goals</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'Promotion', label: 'Promotion' },
                  { id: 'Seasonality', label: 'Seasonality' }
                ].map((goal) => (
                  <label 
                    key={goal.id}
                    className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${
                      selectedGoal === goal.id 
                        ? 'bg-blue-50 border-blue-500 text-blue-700' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      name="forecastGoal"
                      checked={selectedGoal === goal.id}
                      onChange={() => handleGoalSelect(goal.id)}
                    />
                    <span className="text-sm">{goal.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button 
            onClick={handleContinue}
            className="flex items-center gap-2"
          >
            Next
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
