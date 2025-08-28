import axios from 'axios';
import { Product } from './types';

// Create axios instance for backend API
const backendApi = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000,
});

// Add request interceptor to include auth token
backendApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
backendApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post('http://localhost:8000/api/auth/refresh/', {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return backendApi(originalRequest);
        } catch (refreshError) {
          // Refresh token failed, redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/auth/login';
          return Promise.reject(refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Create axios instance for frontend API
const frontendApi = axios.create({
  baseURL: '/api',
  timeout: 5000,
});

// Authentication API functions
export const authAPI = {
  // Login with username/password
  login: async (username: string, password: string) => {
    try {
      const response = await backendApi.post('/auth/login-custom/', {
        username,
        password
      });
      
      const { tokens, user } = response.data;
      
      // Store tokens and user data
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Register new user
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    password2: string;
    first_name?: string;
    last_name?: string;
    name: string;
    phone?: string;
    address?: string;
  }) => {
    try {
      const response = await backendApi.post('/auth/register/', userData);
      
      const { tokens, user } = response.data;
      
      // Store tokens and user data
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await backendApi.get('/auth/profile/');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData: any) => {
    try {
      const response = await backendApi.put('/auth/profile/', profileData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await backendApi.post('/auth/logout/', {
          refresh_token: refreshToken
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

// Product API functions
export const productsAPI = {
  // Get all products from backend
  getAll: async () => {
    try {
      const response = await backendApi.get('/products/');
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get featured products (first 4 active products)
  getFeatured: async () => {
    try {
      const response = await backendApi.get('/products/?status=active');
      const products = response.data.results || response.data;
      return products.slice(0, 4);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  },

  // Get product by ID
  getById: async (id: number) => {
    try {
      const response = await backendApi.get(`/products/${id}/`);
      return response.data.product || response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Get products by category
  getByCategory: async (category: string) => {
    try {
      const response = await backendApi.get(`/products/?category=${category}&status=active`);
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  }
};

// Order API functions
export const ordersAPI = {
  // Create new order
  createOrder: async (orderData: any) => {
    try {
      const response = await backendApi.post('/orders/', orderData);
      return response.data.order || response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Get user orders
  getUserOrders: async () => {
    try {
      const response = await backendApi.get('/orders/');
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },

  // Get order by ID
  getOrderById: async (id: string) => {
    try {
      const response = await backendApi.get(`/orders/${id}/`);
      return response.data.order || response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (id: string, status: string) => {
    try {
      const response = await backendApi.patch(`/orders/${id}/`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }
};

// Payment API functions
export const paymentsAPI = {
  // Create payment
  createPayment: async (paymentData: any) => {
    try {
      const response = await backendApi.post('/payments/', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },

  // Get payment by ID
  getPaymentById: async (id: string) => {
    try {
      const response = await backendApi.get(`/payments/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  },

  // Create Razorpay order
  createRazorpayOrder: async (amount: number, orderId: string) => {
    try {
      const response = await backendApi.post('/payments/create_razorpay_order/', {
        amount,
        order_id: orderId,
        currency: 'INR'
      });
      return response.data;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  },

  // Verify Razorpay payment
  verifyRazorpayPayment: async (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    order_id: string;
  }) => {
    try {
      const response = await backendApi.post('/payments/verify_razorpay_payment/', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error verifying Razorpay payment:', error);
      throw error;
    }
  },

  // Upload payment screenshot
  uploadScreenshot: async (file: File, paymentId: string, bankName?: string, transactionRef?: string) => {
    try {
      const formData = new FormData();
      formData.append('screenshot', file);
      formData.append('payment_id', paymentId);
      if (bankName) formData.append('bank_name', bankName);
      if (transactionRef) formData.append('transaction_reference', transactionRef);

      const response = await backendApi.post('/payments/upload_screenshot/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading screenshot:', error);
      throw error;
    }
  },

  // Verify payment (for offline payments)
  verifyPayment: async (id: string) => {
    try {
      const response = await backendApi.patch(`/payments/${id}/verify_payment/`);
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  },

  // Reject payment (for offline payments)
  rejectPayment: async (id: string) => {
    try {
      const response = await backendApi.patch(`/payments/${id}/reject_payment/`);
      return response.data;
    } catch (error) {
      console.error('Error rejecting payment:', error);
      throw error;
    }
  },

  // Verify COD advance payment
  verifyCODAdvance: async (id: string) => {
    try {
      const response = await backendApi.patch(`/payments/${id}/verify_cod_advance/`);
      return response.data;
    } catch (error) {
      console.error('Error verifying COD advance:', error);
      throw error;
    }
  }
};

// Address API functions
export const addressesAPI = {
  // Get all addresses for current user
  getAll: async () => {
    try {
      const response = await backendApi.get('/addresses/');
      console.log('Raw addresses response:', response.data);
      
      // Handle different response structures
      if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data)) {
          return response.data;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          return response.data.results;
        } else if (response.data.addresses && Array.isArray(response.data.addresses)) {
          return response.data.addresses;
        } else {
          return [];
        }
      }
      return [];
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw error;
    }
  },

  // Get billing addresses
  getBilling: async () => {
    try {
      const response = await backendApi.get('/addresses/billing/');
      return response.data;
    } catch (error) {
      console.error('Error fetching billing addresses:', error);
      throw error;
    }
  },

  // Get shipping addresses
  getShipping: async () => {
    try {
      const response = await backendApi.get('/addresses/shipping/');
      return response.data;
    } catch (error) {
      console.error('Error fetching shipping addresses:', error);
      throw error;
    }
  },

  // Create new address
  create: async (addressData: {
    address_type: 'billing' | 'shipping';
    street_address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    is_default?: boolean;
  }) => {
    try {
      const response = await backendApi.post('/addresses/', addressData);
      return response.data;
    } catch (error) {
      console.error('Error creating address:', error);
      throw error;
    }
  },

  // Update address
  update: async (id: number, addressData: any) => {
    try {
      const response = await backendApi.put(`/addresses/${id}/`, addressData);
      return response.data;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  },

  // Delete address
  delete: async (id: number) => {
    try {
      const response = await backendApi.delete(`/addresses/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  },

  // Set address as default
  setDefault: async (id: number) => {
    try {
      const response = await backendApi.post(`/addresses/${id}/set_default/`);
      return response.data;
    } catch (error) {
      console.error('Error setting default address:', error);
      throw error;
    }
  }
};

// Transform backend product to frontend product format
export const transformProduct = (backendProduct: any): Product => {
  return {
    id: backendProduct.id,
    name: backendProduct.name || 'Unknown Product',
    category: backendProduct.category || 'mobile',
    price: parseFloat(backendProduct.price) || 0,
    originalPrice: backendProduct.wholesale_price ? parseFloat(backendProduct.wholesale_price) : parseFloat(backendProduct.price) || 0,
    image: backendProduct.images && backendProduct.images.length > 0 ? backendProduct.images[0] : backendProduct.image || '/images/placeholder.jpg',
    description: backendProduct.description || 'No description available',
    specs: {
      storage: String(backendProduct.storage || 'N/A'),
      color: String(backendProduct.color || 'N/A'),
      screen: String(backendProduct.connectivity || 'N/A'),
      chip: String(backendProduct.ram || 'N/A'),
      battery: String(backendProduct.battery || 'N/A'),
      brand: String(backendProduct.brand || 'N/A'),
      model: String(backendProduct.model || 'N/A')
    },
    inStock: (backendProduct.stock || 0) > 0,
    rating: 4.5, // Default rating since backend doesn't have this
    reviews: Math.floor(Math.random() * 1000) + 100 // Random reviews for demo
  };
};

// Mock data (fallback)
export const mockProducts = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max',
    category: 'mobile',
    price: 1199.99,
    originalPrice: 1299.99,
    image: '/images/iphone-15-pro-max.jpg',
    description: 'The most advanced iPhone ever with A17 Pro chip, titanium design, and pro camera system.',
    specs: {
      storage: '256GB',
      color: 'Natural Titanium',
      screen: '6.7" Super Retina XDR',
      chip: 'A17 Pro',
      battery: 'Up to 29 hours',
      brand: 'Apple',
      model: 'iPhone 15 Pro Max'
    },
    inStock: true,
    rating: 4.8,
    reviews: 1247
  },
  {
    id: 2,
    name: 'MacBook Air M3',
    category: 'laptop',
    price: 1099.99,
    originalPrice: 1199.99,
    image: '/images/macbook-air-m3.jpg',
    description: 'Powerful M3 chip, all-day battery life, and stunning Liquid Retina display.',
    specs: {
      storage: '512GB',
      color: 'Space Gray',
      screen: '13.6" Liquid Retina',
      chip: 'M3',
      battery: 'Up to 18 hours',
      brand: 'Apple',
      model: 'MacBook Air M3'
    },
    inStock: true,
    rating: 4.9,
    reviews: 892
  },
  {
    id: 3,
    name: 'AirPods Pro 2nd Gen',
    category: 'headset',
    price: 249.99,
    originalPrice: 279.99,
    image: '/images/airpods-pro-2.jpg',
    description: 'Active noise cancellation, spatial audio, and sweat and water resistance.',
    specs: {
      storage: 'N/A',
      color: 'White',
      screen: 'N/A',
      chip: 'H2',
      battery: 'Up to 6 hours',
      brand: 'Apple',
      model: 'AirPods Pro 2nd Gen'
    },
    inStock: true,
    rating: 4.7,
    reviews: 2156
  },
  {
    id: 4,
    name: 'Apple Watch Series 9',
    category: 'watch',
    price: 399.99,
    originalPrice: 449.99,
    image: '/images/apple-watch-9.jpg',
    description: 'S9 chip, faster on-device Siri, and new Double Tap gesture.',
    specs: {
      storage: '64GB',
      color: 'Midnight',
      screen: 'Always-On Retina',
      chip: 'S9',
      battery: 'Up to 18 hours',
      brand: 'Apple',
      model: 'Apple Watch Series 9'
    },
    inStock: true,
    rating: 4.8,
    reviews: 1567
  }
];

export const mockUsers = [
  {
    id: 1,
    email: 'demo@example.com',
    password: 'password123',
    name: 'John Doe',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    }
  }
];

export const mockOrders = [
  {
    id: 'ORD-001',
    userId: 1,
    items: [
      { productId: 1, quantity: 1, price: 1199.99 },
      { productId: 3, quantity: 2, price: 249.99 }
    ],
    total: 1699.97,
    status: 'delivered',
    orderDate: '2024-01-15',
    deliveryDate: '2024-01-18',
    trackingNumber: '1Z999AA1234567890'
  },
  {
    id: 'ORD-002',
    userId: 1,
    items: [
      { productId: 2, quantity: 1, price: 1099.99 }
    ],
    total: 1099.99,
    status: 'shipped',
    orderDate: '2024-01-20',
    deliveryDate: null,
    trackingNumber: '1Z999AA1234567891'
  }
];

export default frontendApi;

