import { Product, Order, DashboardStats, ProductFormData, OrderUpdateData, Payment, OnlinePayment, OfflinePayment, CODPayment } from './types';
import api from './axios';
import { API_ENDPOINTS } from './config';

// API functions
export const productsAPI = {
  getAll: async (): Promise<Product[]> => {
    try {
      const response = await api.get(API_ENDPOINTS.PRODUCTS);
      console.log('API Response:', response.data);
      
      // Handle response structure (pagination disabled in backend)
      let data;
      if (response.data.results && response.data.results.results) {
        // Paginated response (fallback)
        data = response.data.results.results;
      } else if (response.data.results) {
        // Direct results (expected after disabling pagination)
        data = response.data.results;
      } else {
        // Fallback
        data = response.data;
      }
      
      console.log('Processed data:', data);
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error('API Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please check your credentials.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. You do not have permission to access this resource.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error('Failed to fetch products. Please check your connection.');
      }
    }
  },

  getById: async (id: number): Promise<Product> => {
    const response = await api.get(`${API_ENDPOINTS.PRODUCTS}${id}/`);
    // Handle nested response structure
    return response.data.product || response.data;
  },

  create: async (data: ProductFormData): Promise<Product> => {
    console.log('Creating product with data:', data);
    const response = await api.post(API_ENDPOINTS.PRODUCTS, data);
    // Handle nested response structure
    return response.data.product || response.data;
  },
  

  update: async (id: number, data: Partial<ProductFormData>): Promise<Product> => {
    const response = await api.patch(`${API_ENDPOINTS.PRODUCTS}${id}/`, data);
    // Handle nested response structure
    return response.data.product || response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.PRODUCTS}${id}/`);
  }
};

export const ordersAPI = {
  getAll: async (): Promise<Order[]> => {
    try {
      const response = await api.get(API_ENDPOINTS.ORDERS);
      console.log('Orders API Response:', response.data);
      
      // Handle response structure (pagination disabled in backend)
      let data;
      if (response.data.results && response.data.results.results) {
        // Paginated response (fallback)
        data = response.data.results.results;
      } else if (response.data.results) {
        // Direct results (expected after disabling pagination)
        data = response.data.results;
      } else {
        // Fallback
        data = response.data;
      }
      
      console.log('Orders processed data:', data);
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error('Orders API Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please check your credentials.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. You do not have permission to access this resource.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error('Failed to fetch orders. Please check your connection.');
      }
    }
  },

  getById: async (id: number): Promise<Order> => {
    const response = await api.get(`${API_ENDPOINTS.ORDERS}${id}/`);
    // Handle nested response structure
    return response.data.order || response.data;
  },

  updateStatus: async (id: number, data: OrderUpdateData): Promise<Order> => {
    const response = await api.patch(`${API_ENDPOINTS.ORDERS}${id}/update_status/`, data);
    return response.data;
  }
};

export const dashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      const response = await api.get(API_ENDPOINTS.DASHBOARD);
      console.log("Dashboard response.data", response.data);
      return response.data;
    } catch (error: any) {
      console.error('Dashboard API Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please check your credentials.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. You do not have permission to access this resource.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error('Failed to fetch dashboard stats. Please check your connection.');
      }
    }
  },

  getDashboard: async (): Promise<any> => {
    try {
      const response = await api.get(API_ENDPOINTS.DASHBOARD);
      console.log("Dashboard response.data", response.data);
      return response.data;
    } catch (error: any) {
      console.error('Dashboard API Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }
};

export const customersAPI = {
  getAll: async (): Promise<any[]> => {
    const response = await api.get(API_ENDPOINTS.CUSTOMERS);
    return response.data.results || response.data;
  },

  getById: async (id: number): Promise<any> => {
    const response = await api.get(`${API_ENDPOINTS.CUSTOMERS}${id}/`);
    return response.data;
  }
};

export const paymentsAPI = {
  getAll: async (): Promise<Payment[]> => {
    try {
      const response = await api.get(API_ENDPOINTS.PAYMENTS);
      console.log('Payments API Response:', response.data);
      
      // Handle response structure (pagination disabled in backend)
      let data;
      if (response.data.results && response.data.results.results) {
        // Paginated response (fallback)
        data = response.data.results.results;
      } else if (response.data.results) {
        // Direct results (expected after disabling pagination)
        data = response.data.results;
      } else {
        // Fallback
        data = response.data;
      }
      
      console.log('Payments processed data:', data);
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error('Payments API Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please check your credentials.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. You do not have permission to access this resource.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error('Failed to fetch payments. Please check your connection.');
      }
    }
  },

  getById: async (id: number): Promise<Payment> => {
    const response = await api.get(`${API_ENDPOINTS.PAYMENTS}${id}/`);
    return response.data;
  },

  verifyPayment: async (id: number): Promise<void> => {
    await api.patch(`${API_ENDPOINTS.PAYMENTS}${id}/verify_payment/`);
  },

  rejectPayment: async (id: number): Promise<void> => {
    await api.patch(`${API_ENDPOINTS.PAYMENTS}${id}/reject_payment/`);
  },

  verifyCODAdvance: async (id: number): Promise<void> => {
    await api.patch(`${API_ENDPOINTS.PAYMENTS}${id}/verify_cod_advance/`);
  },

  processRefund: async (id: number, refundAmount?: number): Promise<void> => {
    const data = refundAmount ? { refund_amount: refundAmount } : {};
    await api.post(`${API_ENDPOINTS.PAYMENTS}${id}/process_refund/`, data);
  }
};

export const onlinePaymentsAPI = {
  getAll: async (): Promise<OnlinePayment[]> => {
    const response = await api.get(API_ENDPOINTS.ONLINE_PAYMENTS);
    return response.data.results || response.data;
  },

  getById: async (id: number): Promise<OnlinePayment> => {
    const response = await api.get(`${API_ENDPOINTS.ONLINE_PAYMENTS}${id}/`);
    return response.data;
  }
};

export const offlinePaymentsAPI = {
  getAll: async (): Promise<OfflinePayment[]> => {
    const response = await api.get(API_ENDPOINTS.OFFLINE_PAYMENTS);
    return response.data.results || response.data;
  },

  getById: async (id: number): Promise<OfflinePayment> => {
    const response = await api.get(`${API_ENDPOINTS.OFFLINE_PAYMENTS}${id}/`);
    return response.data;
  }
};

export const codPaymentsAPI = {
  getAll: async (): Promise<CODPayment[]> => {
    const response = await api.get(API_ENDPOINTS.COD_PAYMENTS);
    return response.data.results || response.data;
  },

  getById: async (id: number): Promise<CODPayment> => {
    const response = await api.get(`${API_ENDPOINTS.COD_PAYMENTS}${id}/`);
    return response.data;
  }
};

export default api;
