
// Mock helper functions for Google Sheets API integration

/**
 * Get AI insights from the data
 * In a real app, this would call an actual AI service or Google Sheets API
 */
export const getAIInsights = (data: any[]): string[] => {
  // Mock insights - in a real app, these would be generated based on actual data
  return [
    "Sales for Men's Basic Tee show a strong upward trend (+15% MoM), consider increasing inventory by 20%.",
    "The Canvas Tote Bag has a high stockout risk (80%) in the next 30 days based on current inventory levels.",
    "Women's V-Neck Tee sales have seasonal peaks in April and October. Plan inventory accordingly.",
    "The Running Sneakers product may be overstocked. Consider promotional discounts to reduce inventory.",
    "Based on lead time analysis, order Baseball Caps at least 45 days before anticipated demand peaks.",
  ];
};

/**
 * Get forecast accuracy metrics
 */
export const getForecastAccuracy = (): { mape: number; rmse: number } => {
  // Mock accuracy metrics - in a real app, these would be calculated from actual vs. predicted data
  return {
    mape: 12.4, // Mean Absolute Percentage Error
    rmse: 18.7, // Root Mean Square Error
  };
};

/**
 * Get sales data for charts
 */
export const getSalesData = () => {
  // Mock sales data - in a real app, this would be fetched from the sheet
  return [
    { date: '2023-01-01', sales: 120, forecastedSales: 125 },
    { date: '2023-02-01', sales: 150, forecastedSales: 145 },
    { date: '2023-03-01', sales: 200, forecastedSales: 180 },
    { date: '2023-04-01', sales: 210, forecastedSales: 220 },
    { date: '2023-05-01', sales: 190, forecastedSales: 200 },
    { date: '2023-06-01', sales: 220, forecastedSales: 210 },
  ];
};
