
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ProductImpactChart: React.FC = () => {
  // Sample SHAP-like feature importance data
  const featureImportanceData = [
    { feature: 'Season (Q4)', impact: 35 },
    { feature: 'Recent Trend', impact: 25 },
    { feature: 'Marketing Campaign', impact: 15 },
    { feature: 'Price Changes', impact: 12 },
    { feature: 'Competitor Activity', impact: 8 },
    { feature: 'Weather Patterns', impact: 5 },
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Feature Importance (SHAP Analysis)</h3>
      <p className="text-sm text-muted-foreground">
        This chart shows which factors had the biggest impact on your forecast. 
        Higher values indicate stronger influence on the predictions.
      </p>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={featureImportanceData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 'dataMax']} />
            <YAxis dataKey="feature" type="category" width={90} />
            <Tooltip formatter={(value) => [`${value}%`, 'Impact']} />
            <Legend />
            <Bar 
              dataKey="impact" 
              name="Impact on Forecast (%)" 
              fill="#8884d8" 
              radius={[0, 4, 4, 0]} 
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg mt-4">
        <h4 className="font-medium text-blue-700 mb-1">Explanation</h4>
        <p className="text-sm text-blue-800">
          Your forecast is primarily driven by seasonal patterns (35% impact), which aligns with your product 
          category's typical Q4 spike. Recent sales trends are the second biggest factor, suggesting 
          your historical data is a reliable predictor for future demand. Marketing campaigns also 
          have a significant effect, indicating your promotional activities are effective at driving sales.
        </p>
      </div>
    </div>
  );
};

export default ProductImpactChart;
