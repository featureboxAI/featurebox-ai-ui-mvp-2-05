import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LineChart, ShoppingCart, Briefcase, TrendingUp, ArrowRight, LogIn, LogOut } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import GlassMorphCard from '@/components/ui/GlassMorphCard';
import { staggerContainer, staggerItem } from '@/utils/transitions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useForecast } from '@/context/ForecastContext';

const Index = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth0();
  const { setForecastType } = useForecast();
  const [selectedGoal, setSelectedGoal] = useState('');
  const [isDemandForecastingSelected, setIsDemandForecastingSelected] = useState(false);
  
  // New state for the updated inputs
  const [lengthOfData, setLengthOfData] = useState('');
  const [customLengthData, setCustomLengthData] = useState({ years: '', months: '' });
  const [frequencyOfData, setFrequencyOfData] = useState('');
  const [customFrequencyData, setCustomFrequencyData] = useState('');
  const [forecastingHorizon, setForecastingHorizon] = useState('');
  const [customForecastingHorizon, setCustomForecastingHorizon] = useState('');
  const [forecastingFrequency, setForecastingFrequency] = useState('');
  const [customForecastingFrequency, setCustomForecastingFrequency] = useState('');

  const handleCardClick = (path: string, isEnabled: boolean = true) => {
    if (isEnabled) {
      if (path === '/data-source') {
        setIsDemandForecastingSelected(true);
      } else {
        navigate(path);
      }
    }
  };

  // Allow navigation regardless of form completion
  const canNavigate = () => {
    return isDemandForecastingSelected;
  };

  const handleContinue = () => {
    if (canNavigate()) {
      console.log('Navigating to next screen');
      navigate('/data-source');
    }
  };

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
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
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1"></div>
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <img 
                  src="/FeatureBox_Logo.png" 
                  alt="FeatureBox AI" 
                  className="h-10 w-10 object-contain"
                />
                <h1 className="text-3xl font-bold tracking-tight">FeatureBox AI</h1>
              </div>
            </div>
            <div className="flex-1 flex justify-end">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </Button>
              </div>
            </div>
          </div>
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
              className={`h-full ${isDemandForecastingSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
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
              className="h-full"
              onClick={() => navigate('/market-trends')}
            >
              <div className="flex flex-col items-center text-center h-full">
                <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp size={28} />
                </div>
                <h3 className="text-xl font-medium mb-3">Market Trends</h3>
                <p className="text-gray-600">
                  Analyze market trends and insights.
                </p>
              </div>
            </GlassMorphCard>
          </motion.div>
        </motion.div>

        <Card className={`mb-8 transition-all duration-300 ${isDemandForecastingSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'opacity-50'}`}>
          <CardContent className="pt-6">
            <h2 className={`text-xl font-semibold mb-6 ${isDemandForecastingSelected ? 'text-gray-900' : 'text-gray-500'}`}>
              Business Context
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              {/* Length of Data */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDemandForecastingSelected ? 'text-gray-700' : 'text-gray-400'}`}>
                  Length of Data
                </label>
                <select 
                  className={`w-full p-2 border rounded-md ${
                    isDemandForecastingSelected 
                      ? 'border-gray-300 bg-white text-gray-900' 
                      : 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  value={lengthOfData}
                  onChange={(e) => setLengthOfData(e.target.value)}
                  disabled={!isDemandForecastingSelected}
                >
                  <option value="">Select Length</option>
                  <option value="year">Year</option>
                  <option value="custom">Custom</option>
                </select>
                {lengthOfData === 'custom' && isDemandForecastingSelected && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="number"
                      placeholder="Years"
                      className="flex-1 p-2 border border-gray-300 rounded-md"
                      value={customLengthData.years}
                      onChange={(e) => setCustomLengthData({...customLengthData, years: e.target.value})}
                    />
                    <input
                      type="number"
                      placeholder="Months"
                      className="flex-1 p-2 border border-gray-300 rounded-md"
                      value={customLengthData.months}
                      onChange={(e) => setCustomLengthData({...customLengthData, months: e.target.value})}
                    />
                  </div>
                )}
              </div>

              {/* Frequency of Data */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDemandForecastingSelected ? 'text-gray-700' : 'text-gray-400'}`}>
                  Frequency of Data
                </label>
                <select 
                  className={`w-full p-2 border rounded-md ${
                    isDemandForecastingSelected 
                      ? 'border-gray-300 bg-white text-gray-900' 
                      : 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  value={frequencyOfData}
                  onChange={(e) => setFrequencyOfData(e.target.value)}
                  disabled={!isDemandForecastingSelected}
                >
                  <option value="">Select Frequency</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Biweekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="custom">Custom</option>
                </select>
                {frequencyOfData === 'custom' && isDemandForecastingSelected && (
                  <input
                    type="text"
                    placeholder="Enter custom frequency"
                    className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                    value={customFrequencyData}
                    onChange={(e) => setCustomFrequencyData(e.target.value)}
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              {/* Forecasting Horizon */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDemandForecastingSelected ? 'text-gray-700' : 'text-gray-400'}`}>
                  Forecasting Horizon
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {[30, 60, 90, 180].map((days) => (
                    <label 
                      key={days}
                      className={`flex items-center justify-center p-2 border rounded-md transition-colors ${
                        isDemandForecastingSelected
                          ? forecastingHorizon === days.toString()
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'border-gray-300 hover:bg-gray-50 cursor-pointer'
                          : 'cursor-not-allowed bg-gray-100 border-gray-300 text-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        name="forecastingHorizon"
                        value={days}
                        checked={forecastingHorizon === days.toString()}
                        onChange={(e) => setForecastingHorizon(e.target.value)}
                        disabled={!isDemandForecastingSelected}
                      />
                      <span>{days} days</span>
                    </label>
                  ))}
                </div>
                <label 
                  className={`flex items-center justify-center p-2 border rounded-md transition-colors ${
                    isDemandForecastingSelected
                      ? forecastingHorizon === 'custom'
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'border-gray-300 hover:bg-gray-50 cursor-pointer'
                      : 'cursor-not-allowed bg-gray-100 border-gray-300 text-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    name="forecastingHorizon"
                    value="custom"
                    checked={forecastingHorizon === 'custom'}
                    onChange={(e) => setForecastingHorizon(e.target.value)}
                    disabled={!isDemandForecastingSelected}
                  />
                  <span>Custom</span>
                </label>
                {forecastingHorizon === 'custom' && isDemandForecastingSelected && (
                  <input
                    type="text"
                    placeholder="Enter custom horizon"
                    className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                    value={customForecastingHorizon}
                    onChange={(e) => setCustomForecastingHorizon(e.target.value)}
                  />
                )}
              </div>

              {/* Forecasting Frequency */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDemandForecastingSelected ? 'text-gray-700' : 'text-gray-400'}`}>
                  Forecasting Frequency
                </label>
                <select 
                  className={`w-full p-2 border rounded-md ${
                    isDemandForecastingSelected 
                      ? 'border-gray-300 bg-white text-gray-900' 
                      : 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  value={forecastingFrequency}
                  onChange={(e) => setForecastingFrequency(e.target.value)}
                  disabled={!isDemandForecastingSelected}
                >
                  <option value="">Select Frequency</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Biweekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="custom">Custom</option>
                </select>
                {forecastingFrequency === 'custom' && isDemandForecastingSelected && (
                  <input
                    type="text"
                    placeholder="Enter custom frequency"
                    className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                    value={customForecastingFrequency}
                    onChange={(e) => setCustomForecastingFrequency(e.target.value)}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button 
            onClick={handleContinue}
            className={`flex items-center gap-2 transition-all duration-300 ${
              canNavigate() 
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!canNavigate()}
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