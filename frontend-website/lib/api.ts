import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  timeout: 5000,
});

// Mock data
export const mockProducts = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max',
    category: 'iPhone',
    price: 1199.99,
    originalPrice: 1299.99,
    image: '/images/iphone-15-pro-max.jpg',
    description: 'The most advanced iPhone ever with A17 Pro chip, titanium design, and pro camera system.',
    specs: {
      storage: '256GB',
      color: 'Natural Titanium',
      screen: '6.7" Super Retina XDR',
      chip: 'A17 Pro'
    },
    inStock: true,
    rating: 4.8,
    reviews: 1247
  },
  {
    id: 2,
    name: 'MacBook Air M3',
    category: 'MacBook',
    price: 1099.99,
    originalPrice: 1199.99,
    image: '/images/macbook-air-m3.jpg',
    description: 'Powerful M3 chip, all-day battery life, and stunning Liquid Retina display.',
    specs: {
      storage: '512GB',
      color: 'Space Gray',
      screen: '13.6" Liquid Retina',
      chip: 'M3'
    },
    inStock: true,
    rating: 4.9,
    reviews: 892
  },
  {
    id: 3,
    name: 'AirPods Pro 2nd Gen',
    category: 'Headphones',
    price: 249.99,
    originalPrice: 279.99,
    image: '/images/airpods-pro-2.jpg',
    description: 'Active noise cancellation, spatial audio, and sweat and water resistance.',
    specs: {
      type: 'Wireless Earbuds',
      color: 'White',
      battery: 'Up to 6 hours',
      features: 'Active Noise Cancellation'
    },
    inStock: true,
    rating: 4.7,
    reviews: 2156
  },
  {
    id: 4,
    name: 'iPad Air 5th Gen',
    category: 'iPad',
    price: 599.99,
    originalPrice: 649.99,
    image: '/images/ipad-air-5.jpg',
    description: 'M1 chip, 10.9-inch Liquid Retina display, and all-day battery life.',
    specs: {
      storage: '256GB',
      color: 'Space Gray',
      screen: '10.9" Liquid Retina',
      chip: 'M1'
    },
    inStock: true,
    rating: 4.6,
    reviews: 743
  },
  {
    id: 5,
    name: 'Apple Watch Series 9',
    category: 'Apple Watch',
    price: 399.99,
    originalPrice: 449.99,
    image: '/images/apple-watch-9.jpg',
    description: 'S9 chip, faster on-device Siri, and new Double Tap gesture.',
    specs: {
      size: '45mm',
      color: 'Midnight',
      material: 'Aluminum',
      features: 'Heart Rate Monitor'
    },
    inStock: true,
    rating: 4.8,
    reviews: 1567
  },
  {
    id: 6,
    name: 'MacBook Pro 14" M3 Pro',
    category: 'MacBook',
    price: 1999.99,
    originalPrice: 2199.99,
    image: '/images/macbook-pro-14-m3.jpg',
    description: 'M3 Pro chip, Liquid Retina XDR display, and up to 22 hours battery life.',
    specs: {
      storage: '1TB',
      color: 'Space Black',
      screen: '14.2" Liquid Retina XDR',
      chip: 'M3 Pro'
    },
    inStock: true,
    rating: 4.9,
    reviews: 634
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

// Mock API functions
export const authAPI = {
  login: async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = mockUsers.find(u => u.email === email && u.password === password);
    if (user) {
      return {
        user: { id: user.id, email: user.email, name: user.name },
        token: 'mock-jwt-token-' + Date.now()
      };
    }
    throw new Error('Invalid credentials');
  },
  
  register: async (email: string, password: string, name: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    const newUser = {
      id: mockUsers.length + 1,
      email,
      password,
      name,
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      }
    };
    
    mockUsers.push(newUser);
    
    return {
      user: { id: newUser.id, email: newUser.email, name: newUser.name },
      token: 'mock-jwt-token-' + Date.now()
    };
  }
};

export const productsAPI = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockProducts;
  },
  
  getById: async (id: number) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const product = mockProducts.find(p => p.id === id);
    if (!product) throw new Error('Product not found');
    return product;
  },
  
  getByCategory: async (category: string) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockProducts.filter(p => p.category === category);
  }
};

export const ordersAPI = {
  getOrders: async (userId: number) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return mockOrders.filter(order => order.userId === userId);
  },
  
  getOrderById: async (orderId: string) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const order = mockOrders.find(o => o.id === orderId);
    if (!order) throw new Error('Order not found');
    return order;
  },
  
  createOrder: async (orderData: any) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newOrder = {
      id: `ORD-${Date.now()}`,
      ...orderData,
      orderDate: new Date().toISOString().split('T')[0],
      status: 'processing',
      trackingNumber: `1Z999AA${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };
    mockOrders.push(newOrder);
    return newOrder;
  }
};

export default api;

