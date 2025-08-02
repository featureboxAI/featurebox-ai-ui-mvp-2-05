// API configuration for market trends
const config = {
  // Use proxy endpoint to avoid CORS issues
  apiBaseUrl: '/api/trends',
  
  // Function to get headers for API calls
  getHeaders: async () => {
    return {
      'Content-Type': 'application/json'
    };
  }
};

export default config; 