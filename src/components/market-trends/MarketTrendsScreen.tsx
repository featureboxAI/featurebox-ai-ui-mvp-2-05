import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, BarChart3, Activity } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import Plot from 'react-plotly.js';
import GlassMorphCard from '@/components/ui/GlassMorphCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import YouTubeSection from './YouTubeSection';
import config from './config';

interface TrendsData {
  interest_over_time: {
    [keyword: string]: {
      dates: string[];
      values: number[];
    };
  };
  interest_by_region: {
    [keyword: string]: {
      [region: string]: number;
    };
  };
}

interface Categories {
  [category: string]: {
    id: number;
    subcategories: string[];
  };
}

const MarketTrendsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth0();
  const [categories, setCategories] = useState<Categories>({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedKeyword, setSelectedKeyword] = useState('');
  const [timeframe, setTimeframe] = useState('today 12-m');
  const [trendsData, setTrendsData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSource, setSelectedSource] = useState('google');
  const [shouldFetchYouTube, setShouldFetchYouTube] = useState(false);
  const [readyToRenderPlot, setReadyToRenderPlot] = useState(false);

  // Delay rendering plots by 200ms after loading finishes
  useEffect(() => {
    if (!loading && trendsData) {
      const timer = setTimeout(() => setReadyToRenderPlot(true), 200);
      return () => clearTimeout(timer);
    } else {
      setReadyToRenderPlot(false);
    }
  }, [loading, trendsData]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('Fetching categories from:', `${config.apiBaseUrl}/categories`);
        const headers = await config.getHeaders();
        console.log('Headers:', headers);
        
        const response = await fetch(`${config.apiBaseUrl}/categories`, { 
          headers,
          mode: 'cors'
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response error text:', errorText);
          throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Categories data:', data);
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError(`Error fetching categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    fetchCategories();
  }, []);

  const handleKeywordSubmit = async () => {
    if (!selectedKeyword.trim()) return;

    setLoading(true);
    setError('');
    setTrendsData(null);

    if (selectedSource === 'google') {
      try {
        const response = await fetch(
          `${config.apiBaseUrl}/trends/${encodeURIComponent(selectedCategory)}/${encodeURIComponent(selectedKeyword)}?timeframe=${timeframe}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to fetch trends data');
        }

        const data = await response.json();
        setTrendsData(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred while fetching data');
        console.error('Error fetching trends data:', error);
      }
    } else {
      // For YouTube source, trigger the fetch
      setShouldFetchYouTube(true);
    }
    setLoading(false);
  };

  // Reset shouldFetchYouTube when source changes or keyword changes
  useEffect(() => {
    setShouldFetchYouTube(false);
  }, [selectedSource, selectedKeyword]);

  const renderTimeSeriesChart = () => {
    if (
      loading ||
      !readyToRenderPlot ||
      !trendsData?.interest_over_time ||
      !selectedKeyword
    ) {
      return null;
    }
    const timeData = trendsData.interest_over_time[selectedKeyword];
    if (!timeData || !timeData.dates || !timeData.values) return null;
    
    return (
      <Plot
        key={selectedKeyword + timeframe} // forces clean remount
        data={[
          {
            x: timeData.dates,
            y: timeData.values,
            type: 'scatter',
            mode: 'lines+markers',
            name: selectedKeyword,
            line: { color: '#4F46E5' }
          }
        ]}
        layout={{
          title: {
            text: `Interest Over Time: ${selectedKeyword}`,
            font: { size: 20 }
          },
          xaxis: { title: 'Date', gridcolor: '#E5E7EB' },
          yaxis: { title: 'Interest', gridcolor: '#E5E7EB' },
          paper_bgcolor: 'white',
          plot_bgcolor: 'white',
          margin: { t: 50, r: 20, b: 50, l: 50 }
        } as any}
        style={{ width: '100%', height: '400px' }}
        config={{
          displayModeBar: true,
          modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d'],
          displaylogo: false,
          responsive: true,
          scrollZoom: false,  // disable scroll zoom to prevent errors
        }}
      />
    );
  };

  const renderRegionalMap = () => {
    if (
      loading ||
      !readyToRenderPlot ||
      !trendsData?.interest_by_region ||
      !selectedKeyword
    ) {
      return null;
    }
    const regionData = trendsData.interest_by_region[selectedKeyword];
    if (!regionData || Object.keys(regionData).length === 0) {
      return (
        <div className="text-gray-500 text-center py-8">
          No regional data available for this keyword
        </div>
      );
    }
    const locations = Object.keys(regionData);
    const values = Object.values(regionData);
    const maxValue = Math.max(...values);
    
    return (
      <Plot
        key={selectedKeyword + timeframe} // forces clean remount
        data={[
          {
            type: 'choropleth',
            locationmode: 'USA-states',
            locations: locations,
            z: values,
            text: locations.map(state => `${state}: ${regionData[state]}`),
            colorscale: [
              [0, '#f7fbff'],
              [0.2, '#deebf7'],
              [0.4, '#c6dbef'],
              [0.6, '#9ecae1'],
              [0.8, '#6baed6'],
              [1, '#2171b5']
            ],
            colorbar: { title: 'Interest' as any, thickness: 20, len: 0.9 },
            hoverinfo: 'text',
            showscale: true,
            zmin: 0,
            zmax: maxValue
          }
        ]}
        layout={{
          title: {
            text: `Regional Interest: ${selectedKeyword}`,
            font: { size: 20 }
          },
          geo: {
            scope: 'usa',
            showlakes: true,
            lakecolor: 'rgb(255, 255, 255)',
            showland: true,
            landcolor: 'rgb(250, 250, 250)',
            showframe: false,
            projection: { type: 'albers usa' }
          },
          paper_bgcolor: 'white',
          plot_bgcolor: 'white',
          margin: { t: 50, r: 20, b: 20, l: 20 },
          width: 800,
          height: 500
        }}
        config={{
          displayModeBar: true,
          modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d'],
          displaylogo: false,
          responsive: true,
          scrollZoom: false,  // disable scroll zoom to prevent errors
        }}
      />
    );
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setSelectedKeyword('');
  };

  const handleSubcategoryClick = (subcategory: string) => {
    setSelectedKeyword(subcategory);
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedKeyword(e.target.value);
    // Reset YouTube fetch when keyword changes
    if (selectedSource === 'youtube') {
      setShouldFetchYouTube(false);
    }
  };

  const handleBack = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="container max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button onClick={handleBack} variant="outline" size="sm">
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Market Trends</h1>
              <p className="text-lg text-gray-600">Analyze market trends and insights</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
            <Button 
              onClick={() => logout({
                logoutParams: { returnTo: window.location.origin }
              })}
              variant="outline"
              size="sm"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Search Controls */}
        <GlassMorphCard className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Category</option>
                  {Object.keys(categories).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Keyword</label>
                <input
                  type="text"
                  value={selectedKeyword}
                  onChange={handleKeywordChange}
                  placeholder="Enter keyword..."
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="today 1-m">Last Month</option>
                  <option value="today 3-m">Last 3 Months</option>
                  <option value="today 12-m">Last Year</option>
                  <option value="today 5-y">Last 5 Years</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="google">Google Trends</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>
            </div>

            {/* Example Keywords */}
            {selectedCategory && categories[selectedCategory]?.subcategories && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Example Keywords
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories[selectedCategory].subcategories.map((subcategory) => (
                    <button
                      key={subcategory}
                      onClick={() => handleSubcategoryClick(subcategory)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedKeyword === subcategory
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {subcategory}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button 
              onClick={handleKeywordSubmit}
              disabled={loading || !selectedCategory || !selectedKeyword}
              className="w-full"
            >
              {loading ? 'Loading...' : 'Analyze Trends'}
            </Button>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700">{error}</p>
              </div>
            )}
          </CardContent>
        </GlassMorphCard>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {selectedKeyword && (
              <>
                {selectedSource === 'google' && trendsData && (
                  <div className="space-y-8">
                    <GlassMorphCard>
                      <CardHeader>
                        <CardTitle>Interest Over Time</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {renderTimeSeriesChart()}
                      </CardContent>
                    </GlassMorphCard>
                    
                    <GlassMorphCard>
                      <CardHeader>
                        <CardTitle>Regional Interest</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {renderRegionalMap()}
                      </CardContent>
                    </GlassMorphCard>
                  </div>
                )}
                
                {selectedSource === 'youtube' && (
                  <YouTubeSection 
                    keyword={selectedKeyword} 
                    shouldFetch={shouldFetchYouTube} 
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MarketTrendsScreen; 