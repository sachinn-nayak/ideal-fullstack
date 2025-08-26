import axios from 'axios';
import { API_CONFIG } from './config';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Add request interceptor for authentication

api.interceptors.request.use(
  (config) => {
    // For now, we'll use basic auth with the admin user
    // In a real app, you'd use JWT tokens or session cookies
    config.auth = {
      username: API_CONFIG.AUTH.USERNAME,
      password: API_CONFIG.AUTH.PASSWORD
    };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
