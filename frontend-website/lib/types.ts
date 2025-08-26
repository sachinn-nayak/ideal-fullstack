export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  image: string;
  description: string;
  specs: Record<string, string>;
  inStock: boolean;
  rating: number;
  reviews: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: number;
  items: OrderItem[];
  total: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryDate: string | null;
  trackingNumber: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CheckoutData {
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: {
    type: 'card' | 'paypal';
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
  };
}

