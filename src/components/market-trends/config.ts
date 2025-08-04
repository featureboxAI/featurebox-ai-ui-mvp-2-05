// API configuration for market trends

const config = {
  // Use direct backend URL instead of proxy
  apiBaseUrl: 'https://trends-dashboard-backend-766707302238.europe-west1.run.app',
  
  // Function to get headers for API calls
  getHeaders: async () => {
    return {
      'Content-Type': 'application/json'
    };
  }
};

export default config; 