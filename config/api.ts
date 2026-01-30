// API Configuration
// Update these values based on your deployment environment

const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

// Production backend URL
const PRODUCTION_API_URL = 'https://backend-production-2987.up.railway.app';

// Configure your API endpoints here
const API_CONFIG = {
  // Base URL for your API
  BASE_URL: isDevelopment 
    ? 'http://localhost:3001' // Your local backend server
    : PRODUCTION_API_URL, // Railway production backend
  
  // Google OAuth Client ID
  GOOGLE_CLIENT_ID: '1022885462325-705kc6vuv96f828iegacs6p8csjr09dk.apps.googleusercontent.com',
  
  // Specific endpoints
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    GOOGLE_AUTH: '/api/auth/google',
    ME: '/api/auth/me',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    // Dashboard endpoints
    DASHBOARD: '/api/dashboard',
    // Other endpoints
    UPLOAD: '/api/upload',
    VIDEOS: '/api/videos',
    USER: '/api/user',
    HEALTH: '/health',
  }
};

// Helper function to construct full API URLs
export const getApiUrl = (endpoint: keyof typeof API_CONFIG.ENDPOINTS): string => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS[endpoint]}`;
};

// Export the config for direct access if needed
export default API_CONFIG;