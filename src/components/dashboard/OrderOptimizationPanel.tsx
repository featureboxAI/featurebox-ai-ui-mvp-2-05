
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const OrderOptimizationPanel: React.FC = () => {
  // Sample order optimization data
  const inventoryForecastData = [
    { month: 'Jun', demand: 1200, optimalInventory: 1500, currentPlan: 1400 },
    { month: 'Jul', demand: 1350, optimalInventory: 1700, currentPlan: 1500 },
    { month: 'Aug', demand: 1500, optimalInventory: 1900, currentPlan: 1700 },
    { month: 'Sep', demand: 1700, optimalInventory: 2100, currentPlan: 1800 },
    { month: 'Oct', demand: 2000, optimalInventory: 2500, currentPlan: 2200 },
    { month: 'Nov', demand: 2500, optimalInventory: 3100, currentPlan: 2600 },
    { month: 'Dec', demand: 3000, optimalInventory: 3700, currentPlan: 3200 },
  ];

  const riskAnalysisData = [
    { sku: 'SHIRT-001', stockoutRisk: 15, overstockRisk: 5, potential: 95 },
    { sku: 'BAG-022', stockoutRisk: 10, overstockRisk: 8, potential: 92 },
    { sku: 'SHOE-153', stockoutRisk: 5, overstockRisk: 35, potential: 70 },
    { sku: 'HAT-064', stockoutRisk: 8, overstockRisk: 12, potential: 85 },
    { sku: 'JACKET-045', stockoutRisk: 12, overstockRisk: 10, potential: 88 },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Inventory Optimization</CardTitle>
          <CardDescription>
            Optimal inventory levels based on your forecasted demand and business constraints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={inventoryForecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="demand" 
                  stackId="1" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  name="Forecasted Demand"
                />
                <Area 
                  type="monotone" 
                  dataKey="optimalInventory" 
                  stackId="2" 
                  stroke="#82ca9d" 
                  fill="#82ca9d" 
                  name="Optimal Inventory"
                />
                <Area 
                  type="monotone" 
                  dataKey="currentPlan" 
                  stackId="3" 
                  stroke="#ffc658" 
                  fill="#ffc658" 
                  name="Current Inventory Plan"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risk Analysis</CardTitle>
          <CardDescription>
            Stockout risks vs. overstock risks based on current inventory levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={riskAnalysisData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sku" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="stockoutRisk" name="Stockout Risk (%)" fill="#ef4444" />
                <Bar dataKey="overstockRisk" name="Overstock Risk (%)" fill="#f97316" />
                <Bar dataKey="potential" name="Service Level (%)" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-red-50 p-3 rounded-lg">
              <h4 className="font-medium text-red-700">Stockout Risk</h4>
              <p className="text-sm text-red-600 mt-1">
                SHIRT-001 and JACKET-045 have the highest stockout risks. Consider increasing order quantities.
              </p>
            </div>
            
            <div className="bg-orange-50 p-3 rounded-lg">
              <h4 className="font-medium text-orange-700">Overstock Risk</h4>
              <p className="text-sm text-orange-600 mt-1">
                SHOE-153 has a 35% overstock risk. Consider reducing future orders.
              </p>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg">
              <h4 className="font-medium text-green-700">Service Level</h4>
              <p className="text-sm text-green-600 mt-1">
                SHIRT-001 and BAG-022 are meeting target service levels. Current strategy effective.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderOptimizationPanel;
