import React from 'react';
import { FiPackage, FiShoppingCart, FiSearch } from 'react-icons/fi';

interface EmptyStateProps {
  type: 'products' | 'cart' | 'orders' | 'search';
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  type, 
  title, 
  description, 
  action 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'products':
        return <FiPackage className="w-16 h-16 text-gray-400" />;
      case 'cart':
        return <FiShoppingCart className="w-16 h-16 text-gray-400" />;
      case 'orders':
        return <FiPackage className="w-16 h-16 text-gray-400" />;
      case 'search':
        return <FiSearch className="w-16 h-16 text-gray-400" />;
      default:
        return <FiPackage className="w-16 h-16 text-gray-400" />;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'products':
        return 'No products found';
      case 'cart':
        return 'Your cart is empty';
      case 'orders':
        return 'No orders yet';
      case 'search':
        return 'No results found';
      default:
        return 'Nothing to show';
    }
  };

  const getDefaultDescription = () => {
    switch (type) {
      case 'products':
        return 'We couldn\'t find any products matching your criteria.';
      case 'cart':
        return 'Add some products to your cart to get started.';
      case 'orders':
        return 'Your order history will appear here once you make your first purchase.';
      case 'search':
        return 'Try adjusting your search terms or browse our categories.';
      default:
        return 'There\'s nothing to display at the moment.';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="mb-6">
        {getIcon()}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title || getDefaultTitle()}
      </h3>
      <p className="text-gray-600 text-center max-w-md mb-6">
        {description || getDefaultDescription()}
      </p>
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;

