export interface Product {
  id: number;
  name: string;
  description: string;
  price: string; // Django returns Decimal as string
  category: 'mobile' | 'laptop' | 'headphones';
  image: string;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Specifications (direct fields in Django model)
  brand: string;
  model: string;
  color: string;
  storage?: string;
  ram?: string;
  battery?: string;
  connectivity?: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  items: OrderItem[];
  total: string; // Django returns Decimal as string
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip_code: string;
  shipping_country: string;
  created_at: string;
  updated_at: string;
  estimated_delivery?: string;
  tracking_number?: string;
}

export interface OrderItem {
  id: number;
  product_name: string;
  product_image: string;
  quantity: number;
  price: string; // Django returns Decimal as string
  total: string; // Django returns Decimal as string
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'manager';
  is_active: boolean;
  last_login?: string;
}

export interface DashboardStats {
  total_products: number;
  total_orders: number;
  total_revenue: string; // Django returns Decimal as string
  pending_orders: number;
  low_stock_products: number;
  recent_orders: Order[];
  top_products: {
    product_id: number;
    product_name: string;
    total_sold: number;
    revenue: string; // Django returns Decimal as string
  }[];
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: 'mobile' | 'laptop' | 'headphones';
  stock: number;
  brand: string;
  model: string;
  color: string;
  storage?: string;
  ram?: string;
  battery?: string;
  connectivity?: string;
  image: string;
  is_active: boolean;
}

export interface OrderUpdateData {
  status: Order['status'];
  payment_status?: Order['payment_status'];
  tracking_number?: string;
  estimated_delivery?: string;
}
