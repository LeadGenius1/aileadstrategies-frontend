// API Configuration
// Update these values based on your deployment environment

const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

// Configure your API endpoints here
const API_CONFIG = {
  // Base URL for your API
  // For production, this might be a different domain or subdomain
  BASE_URL: isDevelopment 
    ? 'http://localhost:3001' // Your local backend server
    : window.location.origin, // Same domain in production
  
  // Specific endpoints
  ENDPOINTS: {
    UPLOAD: '/api/upload',
    VIDEOS: '/api/videos',
    USER: '/api/user',
  }
};

// Helper function to construct full API URLs
export const getApiUrl = (endpoint: keyof typeof API_CONFIG.ENDPOINTS): string => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS[endpoint]}`;
};

// Export the config for direct access if needed
export default API_CONFIG;