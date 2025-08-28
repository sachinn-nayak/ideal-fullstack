export interface Product {
  id: number;
  name: string;
  description: string;
  price: string; // Django returns Decimal as string
  wholesale_price?: string; // Django returns Decimal as string
  category: 'mobile' | 'laptop' | 'watch' | 'headset';
  images: string[]; // Array of image URLs
  stock: number;
  is_active: boolean;
  is_deleted: boolean;
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
  status: 'pending' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'verified' | 'failed';
  payment_method: 'online' | 'offline' | 'cod';
  advance_amount: string; // For COD orders
  advance_verified: boolean; // For COD advance verification
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip_code: string;
  shipping_country: string;
  created_at: string;
  updated_at: string;
  estimated_delivery?: string;
  tracking_number?: string;
  invoice?: Invoice; // Related invoice
}

export interface OrderItem {
  id: number;
  product_name: string;
  product_image: string;
  quantity: number;
  price: string; // Django returns Decimal as string
  total: string; // Django returns Decimal as string
}

export interface Invoice {
  id: number;
  invoice_number: string;
  order: number; // Order ID
  subtotal: string;
  tax_amount: string;
  shipping_amount: string;
  discount_amount: string;
  total_amount: string;
  status: 'draft' | 'generated' | 'sent' | 'paid' | 'cancelled';
  invoice_date: string;
  due_date?: string;
  notes?: string;
  terms_conditions?: string;
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  company_gst?: string;
  pdf_file?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'manager';
  is_active: boolean;
  last_login?: string;
}

export interface DashboardStatsData {
  total_products: number;
  total_orders: number;
  total_customers: number;
  total_revenue: string; // Django returns Decimal as string
  online_revenue: string;
  offline_revenue: string;
  cod_revenue: string;
  pending_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  verified_payments: number;
  pending_payments: number;
  failed_payments: number;
  low_stock_products: number;
}

export interface DashboardStats {
  stats: DashboardStatsData;
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
  wholesale_price?: number;
  category: 'mobile' | 'laptop' | 'watch' | 'headset';
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

export interface Payment {
  id: number;
  payment_id: string;
  order: number; // Order ID
  order_number: string;
  customer_name: string;
  amount: string; // Django returns Decimal as string
  payment_method: 'online' | 'offline' | 'cod';
  payment_status: 'pending' | 'verified' | 'failed';
  transaction_id?: string;
  screenshot?: string;
  advance_amount?: string;
  verified_by?: number;
  verified_at?: string;
  created_at: string;
  updated_at: string;
  
  // Related payment details
  online_payment?: OnlinePayment;
  offline_payment?: OfflinePayment;
  cod_payment?: CODPayment;
}

export interface OnlinePayment {
  id: number;
  payment: number; // Payment ID
  transaction_id: string;
  gateway: string;
  gateway_response: any;
  refund_id?: string;
  refund_amount?: string;
  refund_status: 'pending' | 'processed' | 'failed';
}

export interface OfflinePayment {
  id: number;
  payment: number; // Payment ID
  screenshot: string;
  bank_name?: string;
  account_number?: string;
  transaction_reference?: string;
  notes?: string;
}

export interface CODPayment {
  id: number;
  payment: number; // Payment ID
  advance_amount: string;
  advance_verified: boolean;
  advance_screenshot?: string;
  delivery_charges: string;
  notes?: string;
}

export interface OrderUpdateData {
  status: Order['status'];
  payment_status?: Order['payment_status'];
  tracking_number?: string;
  estimated_delivery?: string;
  generate_invoice?: boolean;
}
