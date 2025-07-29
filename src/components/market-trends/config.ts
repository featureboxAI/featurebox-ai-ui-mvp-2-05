// API configuration for market trends
const config = {
  // Backend URL - use proxy in development, direct URL in production
  apiBaseUrl: import.meta.env.DEV 
    ? '/api/trends' 
    : 'https://trends-dashboard-backend-766707302238.europe-west1.run.app',
  
  // Function to get headers for API calls
  getHeaders: async () => {
    return {
      'Content-Type': 'application/json'
    };
  }
};

export default config; 