
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  FileSpreadsheet
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { getAIInsights } from '@/utils/googleSheetsHelpers';
import ForecastTable from './ForecastTable';
import ProductImpactChart from './ProductImpactChart';
import AIInsightPanel from './AIInsightPanel';
import OrderOptimizationPanel from './OrderOptimizationPanel';

const DashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('forecast');
  
  const handleExportData = () => {
    // In a real app, this would trigger a data export
    console.log('Exporting forecast data...');
  };

  const handleNavigateToConstraints = () => {
    navigate('/constraints');
  };

  // Sample forecast data - in a real app this would come from an API or context
  const forecastChartData = [
    { date: '2023-06-01', actual: 120, forecast: 125, lower: 115, upper: 135 },
    { date: '2023-06-15', actual: 145, forecast: 140, lower: 130, upper: 150 },
    { date: '2023-07-01', actual: 160, forecast: 165, lower: 155, upper: 175 },
    { date: '2023-07-15', actual: 175, forecast: 180, lower: 170, upper: 190 },
    { date: '2023-08-01', actual: 190, forecast: 195, lower: 185, upper: 205 },
    { date: '2023-08-15', actual: 200, forecast: 210, lower: 200, upper: 220 },
    { date: '2023-09-01', forecast: 225, lower: 210, upper: 240 },
    { date: '2023-09-15', forecast: 240, lower: 225, upper: 255 },
    { date: '2023-10-01', forecast: 255, lower: 240, upper: 270 },
    { date: '2023-10-15', forecast: 270, lower: 255, upper: 285 },
  ];

  // AI insights from our helper
  const insights = getAIInsights([]);

  return (
    <div className="px-6 py-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Forecast Results & Explanation</h1>
          <p className="text-muted-foreground">View and analyze your demand forecast predictions</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleNavigateToConstraints}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Adjust Constraints
          </Button>
          <Button onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export Results
          </Button>
        </div>
      </div>

      <Tabs defaultValue="forecast" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="forecast">Forecast Overview</TabsTrigger>
          <TabsTrigger value="explanation">Model Explanation</TabsTrigger>
          <TabsTrigger value="optimization">Order Optimization</TabsTrigger>
        </TabsList>
        
        <TabsContent value="forecast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Forecast Visualization</CardTitle>
              <CardDescription>Historical data (solid) vs forecast (dashed) with 95% confidence interval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecastChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#4f46e5" 
                      strokeWidth={2} 
                      name="Actual Sales" 
                      dot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="forecast" 
                      stroke="#10b981" 
                      strokeWidth={2} 
                      strokeDasharray="5 5" 
                      name="Forecast" 
                      dot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="upper" 
                      stroke="#d1d5db" 
                      strokeWidth={1} 
                      name="Upper Bound" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="lower" 
                      stroke="#d1d5db" 
                      strokeWidth={1} 
                      name="Lower Bound" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <ForecastTable />
          
          <AIInsightPanel insights={insights} />
        </TabsContent>
        
        <TabsContent value="explanation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Model Explanation</CardTitle>
              <CardDescription>Understanding why the forecast model made these predictions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">Key Factors Influencing This Forecast:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Historical sales patterns show a strong upward trend (+15% YoY)</li>
                  <li>Seasonal peak detected during October-November period</li>
                  <li>Recent marketing campaigns have increased demand by approximately 8%</li>
                  <li>Product lifecycle analysis suggests these items are in growth phase</li>
                </ul>
              </div>
              
              <ProductImpactChart />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="optimization" className="space-y-6">
          <OrderOptimizationPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default DashboardScreen;
