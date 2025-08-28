'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiUpload } from 'react-icons/fi';
import { Product, ProductFormData } from '@/lib/types';

interface ProductFormProps {
  product?: Product;
  onSave: (data: ProductFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSave,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    wholesale_price: 0,
    category: 'mobile',
    stock: 0,
    brand: '',
    model: '',
    color: '',
    storage: '',
    ram: '',
    battery: '',
    connectivity: '',
    image: '',
    is_active: true
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        wholesale_price: product.wholesale_price ? parseFloat(product.wholesale_price) : 0,
        category: product.category,
        stock: product.stock,
        brand: product.brand,
        model: product.model,
        color: product.color,
        storage: product.storage || '',
        ram: product.ram || '',
        battery: product.battery || '',
        connectivity: product.connectivity || '',
        image: product.images ? product.images.join('\n') : '',
        is_active: product.is_active
      });
    }
  }, [product]);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="mobile">Mobile</option>
                <option value="laptop">Laptop</option>
                <option value="watch">Watch</option>
                <option value="headset">Headset</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Retail Price ($) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wholesale Price ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.wholesale_price || ''}
                onChange={(e) => handleInputChange('wholesale_price', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00 (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter product description"
            />
          </div>

                     {/* Images */}
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Image URLs (one per line)
             </label>
             <textarea
               value={formData.image}
               onChange={(e) => handleInputChange('image', e.target.value)}
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
               placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;https://example.com/image3.jpg"
               rows={4}
             />
             <p className="text-sm text-gray-500 mt-1">
               Enter multiple image URLs, one per line. First image will be the main product image.
             </p>
           </div>

          {/* Specifications */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Brand *
                 </label>
                 <input
                   type="text"
                   required
                   value={formData.brand}
                   onChange={(e) => handleInputChange('brand', e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   placeholder="e.g., Apple"
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Model *
                 </label>
                 <input
                   type="text"
                   required
                   value={formData.model}
                   onChange={(e) => handleInputChange('model', e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   placeholder="e.g., iPhone 15 Pro"
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Color *
                 </label>
                 <input
                   type="text"
                   required
                   value={formData.color}
                   onChange={(e) => handleInputChange('color', e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   placeholder="e.g., Natural Titanium"
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Storage
                 </label>
                 <input
                   type="text"
                   value={formData.storage || ''}
                   onChange={(e) => handleInputChange('storage', e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   placeholder="e.g., 128GB"
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   RAM
                 </label>
                 <input
                   type="text"
                   value={formData.ram || ''}
                   onChange={(e) => handleInputChange('ram', e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   placeholder="e.g., 8GB"
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Battery
                 </label>
                 <input
                   type="text"
                   value={formData.battery || ''}
                   onChange={(e) => handleInputChange('battery', e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   placeholder="e.g., Up to 23 hours"
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Connectivity
                 </label>
                 <input
                   type="text"
                   value={formData.connectivity || ''}
                   onChange={(e) => handleInputChange('connectivity', e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   placeholder="e.g., 5G, Wi-Fi 6"
                 />
               </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleInputChange('is_active', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Product is active and available for purchase
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FiSave className="w-4 h-4" />
              <span>{loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;

