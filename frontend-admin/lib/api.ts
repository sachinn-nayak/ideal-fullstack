import { Product, Order, DashboardStats, ProductFormData, OrderUpdateData } from './types';
import api from './axios';
import { API_ENDPOINTS } from './config';

// API functions
export const productsAPI = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get(API_ENDPOINTS.PRODUCTS);
    return response.data.results || response.data;
  },

  getById: async (id: number): Promise<Product> => {
    const response = await api.get(`${API_ENDPOINTS.PRODUCTS}${id}/`);
    return response.data;
  },

  create: async (data: ProductFormData): Promise<Product> => {
    const response = await api.post(API_ENDPOINTS.PRODUCTS, data);
    return response.data;
  },
  

  update: async (id: number, data: Partial<ProductFormData>): Promise<Product> => {
    const response = await api.patch(`${API_ENDPOINTS.PRODUCTS}${id}/`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.PRODUCTS}${id}/`);
  }
};

export const ordersAPI = {
  getAll: async (): Promise<Order[]> => {
    const response = await api.get(API_ENDPOINTS.ORDERS);
    return response.data.results || response.data;
  },

  getById: async (id: number): Promise<Order> => {
    const response = await api.get(`${API_ENDPOINTS.ORDERS}${id}/`);
    return response.data;
  },

  updateStatus: async (id: number, data: OrderUpdateData): Promise<Order> => {
    const response = await api.patch(`${API_ENDPOINTS.ORDERS}${id}/update_status/`, data);
    return response.data;
  }
};

export const dashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get(API_ENDPOINTS.DASHBOARD);
    console.log("response.data", response.data);
    return response.data.stats;
  },

  getDashboard: async (): Promise<any> => {
    const response = await api.get(API_ENDPOINTS.DASHBOARD);
    console.log("response.data", response.data);
    return response.data;
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

export default api;
