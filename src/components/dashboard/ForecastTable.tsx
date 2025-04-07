
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

const ForecastTable: React.FC = () => {
  // Sample forecast data - would come from API in real app
  const forecastData = [
    { 
      sku: 'SHIRT-001', 
      product: 'Classic T-Shirt', 
      forecast: 450, 
      ciLow: 425, 
      ciHigh: 475, 
      optimizedOrder: 460,
      inStock: 120,
      status: 'growth'
    },
    { 
      sku: 'BAG-022', 
      product: 'Canvas Tote Bag', 
      forecast: 320, 
      ciLow: 290, 
      ciHigh: 350, 
      optimizedOrder: 340,
      inStock: 75,
      status: 'growth'
    },
    { 
      sku: 'SHOE-153', 
      product: 'Running Sneakers', 
      forecast: 180, 
      ciLow: 160, 
      ciHigh: 200, 
      optimizedOrder: 160,
      inStock: 210,
      status: 'overstock'
    },
    { 
      sku: 'HAT-064', 
      product: 'Baseball Cap', 
      forecast: 210, 
      ciLow: 195, 
      ciHigh: 225, 
      optimizedOrder: 215,
      inStock: 50,
      status: 'stable'
    },
    { 
      sku: 'JACKET-045', 
      product: 'Denim Jacket', 
      forecast: 125, 
      ciLow: 110, 
      ciHigh: 140, 
      optimizedOrder: 130,
      inStock: 40,
      status: 'stable'
    },
  ];

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Product</TableHead>
            <TableHead className="text-right">Forecasted Demand</TableHead>
            <TableHead className="text-right">95% CI Low</TableHead>
            <TableHead className="text-right">95% CI High</TableHead>
            <TableHead className="text-right">Optimized Order Qty</TableHead>
            <TableHead className="text-right">Current Stock</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {forecastData.map((item) => (
            <TableRow key={item.sku}>
              <TableCell className="font-medium">{item.sku}</TableCell>
              <TableCell>{item.product}</TableCell>
              <TableCell className="text-right">{item.forecast}</TableCell>
              <TableCell className="text-right">{item.ciLow}</TableCell>
              <TableCell className="text-right">{item.ciHigh}</TableCell>
              <TableCell className="text-right font-medium">{item.optimizedOrder}</TableCell>
              <TableCell className="text-right">{item.inStock}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <div className={`h-2 w-2 rounded-full mr-2 ${
                    item.status === 'growth' ? 'bg-green-500' : 
                    item.status === 'overstock' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <span className="capitalize">{item.status}</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ForecastTable;
