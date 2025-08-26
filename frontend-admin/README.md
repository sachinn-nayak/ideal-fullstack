# Frontend Admin Panel

This is the admin panel for the IDeals e-commerce platform, built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Dashboard**: Overview of products, orders, and revenue
- **Product Management**: Add, edit, delete, and view products
- **Order Management**: View and update order statuses
- **Customer Management**: View customer information
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **Icons**: React Icons
- **Notifications**: React Toastify
- **Backend**: Django REST Framework

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Django backend running (see backend setup)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend-admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:8001/api
   
   # Authentication (for future use)
   NEXT_PUBLIC_AUTH_USERNAME=admin
   NEXT_PUBLIC_AUTH_PASSWORD=admin123
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8001/api` |
| `NEXT_PUBLIC_AUTH_USERNAME` | Admin username | `admin` |
| `NEXT_PUBLIC_AUTH_PASSWORD` | Admin password | `admin123` |

## Project Structure

```
frontend-admin/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel pages
│   │   ├── page.tsx       # Dashboard
│   │   ├── products/      # Product management
│   │   ├── orders/        # Order management
│   │   └── customers/     # Customer management
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── Sidebar.tsx        # Navigation sidebar
│   ├── ProductTable.tsx   # Products table
│   ├── OrderTable.tsx     # Orders table
│   └── ...
├── lib/                   # Utility functions
│   ├── api.ts            # API functions
│   ├── axios.ts          # Axios configuration
│   ├── config.ts         # Environment configuration
│   └── types.ts          # TypeScript interfaces
├── public/               # Static assets
└── ...
```

## API Configuration

The application uses a centralized configuration system:

### `lib/config.ts`
- Environment variables management
- API endpoints configuration
- Authentication settings

### `lib/axios.ts`
- Axios instance configuration
- Request/response interceptors
- Authentication headers

### `lib/api.ts`
- API function definitions
- Type-safe API calls
- Error handling

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Backend Integration

This frontend connects to a Django REST Framework backend. Make sure the backend is running on the configured URL before using the admin panel.

### Backend Requirements
- Django 5.2+
- Django REST Framework
- SQLite database (for development)
- CORS configured for frontend domain

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
