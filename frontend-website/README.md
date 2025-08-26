# iDeals - Premium Apple Accessories Store

A modern, responsive e-commerce storefront for Apple accessories built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

### ✅ Core Functionality
- **Homepage**: Hero banner, featured products, and category navigation
- **Product Catalog**: Browse products with search, filtering, and sorting
- **Product Details**: Detailed product pages with specifications and add to cart
- **Shopping Cart**: Persistent cart with quantity management and localStorage
- **User Authentication**: Login/register with mock API
- **Checkout Process**: Address and payment forms with order creation
- **Order Management**: Order history and tracking with status updates

### 🎨 Design & UX
- **Apple-inspired Design**: Clean, modern UI with white backgrounds and gray tones
- **Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- **Smooth Animations**: Hover effects and transitions throughout
- **Loading States**: Skeleton loaders and spinners for better UX
- **Toast Notifications**: User feedback for actions and errors

### 🛠 Technical Features
- **Next.js 14 App Router**: Latest Next.js with App Router architecture
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first styling with custom components
- **Context API**: State management for authentication and cart
- **Mock API**: Simulated backend with Axios for development
- **React Icons**: Consistent iconography throughout
- **React Toastify**: Toast notifications for user feedback

## 📁 Project Structure

```
frontend-website/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Homepage
│   ├── layout.tsx                # Root layout with providers
│   ├── globals.css               # Global styles
│   ├── auth/                     # Authentication pages
│   │   ├── login/page.tsx        # Login form
│   │   └── register/page.tsx     # Registration form
│   ├── products/                 # Product pages
│   │   ├── page.tsx              # Product listing
│   │   └── [id]/page.tsx         # Product details
│   ├── cart/page.tsx             # Shopping cart
│   ├── checkout/page.tsx         # Checkout process
│   └── orders/                   # Order management
│       ├── page.tsx              # Order history
│       └── [id]/page.tsx         # Order details
├── components/                   # Reusable components
│   ├── Header.tsx                # Navigation header
│   ├── Footer.tsx                # Site footer
│   ├── ProductCard.tsx           # Product display card
│   ├── CartItem.tsx              # Cart item component
│   ├── Loader.tsx                # Loading spinner
│   └── EmptyState.tsx            # Empty state component
├── context/                      # React Context providers
│   ├── AuthContext.tsx           # Authentication state
│   └── CartContext.tsx           # Shopping cart state
├── lib/                          # Utilities and API
│   ├── api.ts                    # Mock API functions
│   └── types.ts                  # TypeScript type definitions
└── public/                       # Static assets
```

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Icons**: React Icons
- **Notifications**: React Toastify
- **Development**: ESLint, PostCSS

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎯 Demo Credentials

For testing the authentication system:

- **Email**: `demo@example.com`
- **Password**: `password123`

## 📱 Pages & Features

### Homepage (`/`)
- Hero banner with call-to-action
- Featured products showcase
- Category navigation
- Company features section

### Products (`/products`)
- Product grid/list view
- Search functionality
- Category filtering
- Price and rating sorting
- Responsive design

### Product Details (`/products/[id]`)
- Product images and specifications
- Add to cart functionality
- Product reviews and ratings
- Related products

### Shopping Cart (`/cart`)
- Cart item management
- Quantity updates
- Price calculations
- Checkout button

### Authentication (`/auth/login`, `/auth/register`)
- Form validation
- Error handling
- Responsive design
- Password visibility toggle

### Checkout (`/checkout`)
- Shipping address form
- Payment method selection
- Order summary
- Form validation

### Orders (`/orders`)
- Order history
- Order status tracking
- Order details view
- Tracking information

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Secondary**: Gray tones
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)

### Typography
- **Font**: Geist Sans (system fallback)
- **Headings**: Bold weights
- **Body**: Regular weights
- **Captions**: Smaller sizes

### Components
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Blue primary, gray secondary
- **Forms**: Clean inputs with focus states
- **Navigation**: Sticky header with dropdown

## 🔧 Customization

### Adding New Products
Edit `lib/api.ts` to add products to the `mockProducts` array:

```typescript
{
  id: 7,
  name: 'New Product',
  category: 'iPhone',
  price: 299.99,
  originalPrice: 349.99,
  image: '/images/new-product.jpg',
  description: 'Product description...',
  specs: {
    // Product specifications
  },
  inStock: true,
  rating: 4.5,
  reviews: 100
}
```

### Styling Changes
- Modify `app/globals.css` for global styles
- Update Tailwind classes in components
- Customize color scheme in `tailwind.config.js`

### API Integration
Replace mock API calls in `lib/api.ts` with real backend endpoints:

```typescript
// Replace mock functions with real API calls
export const productsAPI = {
  getAll: async () => {
    const response = await fetch('/api/products');
    return response.json();
  }
};
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically

### Other Platforms
1. Build the project: `npm run build`
2. Start production server: `npm run start`
3. Deploy to your preferred platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
