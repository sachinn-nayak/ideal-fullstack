'use client';

import React from 'react';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { CartItem as CartItemType } from '@/lib/types';
import { useCart } from '@/context/CartContext';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    updateQuantity(item.product.id, newQuantity);
  };

  const handleRemove = () => {
    removeFromCart(item.product.id);
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
      {/* Product Image */}
      <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
          Image
        </div>
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">
          {item.product.name}
        </h3>
        <p className="text-sm text-gray-500">
          {item.product.category}
        </p>
        <div className="flex items-center mt-1">
          <span className="text-lg font-bold text-gray-900">
            ${item.product.price.toFixed(2)}
          </span>
          {item.product.originalPrice > item.product.price && (
            <span className="text-sm text-gray-500 line-through ml-2">
              ${item.product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleQuantityChange(item.quantity - 1)}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
          disabled={item.quantity <= 1}
        >
          <FiMinus className="w-3 h-3 text-gray-600" />
        </button>
        
        <span className="w-12 text-center font-semibold text-gray-900">
          {item.quantity}
        </span>
        
        <button
          onClick={() => handleQuantityChange(item.quantity + 1)}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <FiPlus className="w-3 h-3 text-gray-600" />
        </button>
      </div>

      {/* Total Price */}
      <div className="text-right min-w-0">
        <div className="font-bold text-gray-900">
          ${(item.product.price * item.quantity).toFixed(2)}
        </div>
        <div className="text-sm text-gray-500">
          ${item.product.price.toFixed(2)} each
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={handleRemove}
        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
      >
        <FiTrash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default CartItem;

