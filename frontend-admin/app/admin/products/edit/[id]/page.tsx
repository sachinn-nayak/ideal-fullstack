'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiArrowLeft, FiSave, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Product, ProductFormData } from '@/lib/types';
import { productsAPI } from '@/lib/api';

const ProductEditPage = () => {
  const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    is_active: true,
  });

  useEffect(() => {
    if (params.id) {
      loadProduct(Number(params.id));
    }
  }, [params.id]);

  const loadProduct = async (id: number) => {
    try {
      setLoading(true);
      const data = await productsAPI.getById(id);
      setProduct(data);
      setFormData({
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        wholesale_price: data.wholesale_price ? parseFloat(data.wholesale_price) : 0,
        category: data.category,
        stock: data.stock,
        brand: data.brand,
        model: data.model,
        color: data.color,
        storage: data.storage || '',
        ram: data.ram || '',
        battery: data.battery || '',
        connectivity: data.connectivity || '',
        image: data.images ? data.images.join('\n') : '',
        is_active: data.is_active,
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load product';
      toast.error(errorMessage);
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    try {
      setSaving(true);
      await productsAPI.update(product.id, formData);
      toast.success('Product updated successfully');
      router.push(`/admin/products/${product.id}`);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update product';
      toast.error(errorMessage);
      console.error('Error updating product:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (product) {
      router.push(`/admin/products/${product.id}`);
    } else {
      router.push('/admin/products');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Product not found</p>
        <button 
          onClick={() => router.push('/admin/products')}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-600">Update product information</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <FiX className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          <button 
            onClick={handleSubmit}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FiSave className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="mobile">Mobile</option>
                <option value="laptop">Laptop</option>
                <option value="watch">Watch</option>
                <option value="headset">Headset</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Stock</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Retail Price ($)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Wholesale Price ($)</label>
              <input
                type="number"
                name="wholesale_price"
                value={formData.wholesale_price || ''}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00 (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Storage</label>
              <input
                type="text"
                name="storage"
                value={formData.storage}
                onChange={handleInputChange}
                placeholder="e.g., 128GB, 256GB"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">RAM</label>
              <input
                type="text"
                name="ram"
                value={formData.ram}
                onChange={handleInputChange}
                placeholder="e.g., 8GB, 16GB"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Battery</label>
              <input
                type="text"
                name="battery"
                value={formData.battery}
                onChange={handleInputChange}
                placeholder="e.g., 4000mAh"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Connectivity</label>
              <input
                type="text"
                name="connectivity"
                value={formData.connectivity}
                onChange={handleInputChange}
                placeholder="e.g., 5G, WiFi 6, Bluetooth 5.0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image URLs (one per line)</label>
            <textarea
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;https://example.com/image3.jpg"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter multiple image URLs, one per line. First image will be the main product image.
            </p>
            {formData.image && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Current Images:</h4>
                <div className="grid grid-cols-4 gap-2">
                  {formData.image.split('\n').filter(url => url.trim()).map((url, index) => (
                    <div key={index} className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={url.trim()} 
                        alt={`Product preview ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductEditPage;
