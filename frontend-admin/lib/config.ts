// API Configuration
export const API_CONFIG = {
  // Get API URL from environment variable, fallback to default
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api',
  
  // Authentication
  AUTH: {
    USERNAME: process.env.NEXT_PUBLIC_AUTH_USERNAME || 'admin',
    PASSWORD: process.env.NEXT_PUBLIC_AUTH_PASSWORD || 'admin123',
  },
  


  
  // Timeout settings
  TIMEOUT: 10000,
  
  // Headers
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

// Environment check
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// API Endpoints
export const API_ENDPOINTS = {
  PRODUCTS: '/products/',
  ORDERS: '/orders/',
  CUSTOMERS: '/customers/',
  DASHBOARD: '/dashboard/stats/',
  CATEGORIES: '/categories/',
} as const;

