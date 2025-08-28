'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiSearch, FiFilter, FiPackage } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Product } from '@/lib/types';
import { productsAPI } from '@/lib/api';
import ProductTable from '@/components/ProductTable';

const ProductsPage = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsAPI.getAll();
      console.log('Products data received:', data);
      // Ensure data is always an array
      setProducts(Array.isArray(data) ? data : []);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load products';
      toast.error(errorMessage);
      console.error('Error loading products:', error);
      setProducts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.delete(id);
        toast.success('Product deleted successfully');
        loadProducts();
      } catch (error) {
        toast.error('Failed to delete product');
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleEdit = (product: Product) => {
    // Navigate to edit page
    router.push(`/admin/products/edit/${product.id}`);
  };

  const handleView = (product: Product) => {
    // Navigate to view page
    router.push(`/admin/products/${product.id}`);
  };

  const filteredProducts = (Array.isArray(products) ? products : []).filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
         const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && product.is_active) ||
                          (statusFilter === 'inactive' && !product.is_active);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2">Manage your product catalog</p>
        </div>
        <button 
          onClick={() => router.push('/admin/products/add')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="mobile">Mobile</option>
            <option value="laptop">Laptop</option>
            <option value="headset">Headphones</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <FiFilter className="w-4 h-4 mr-2" />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-blue-600 font-semibold">{products.length}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-lg font-semibold text-gray-900">{products.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
                         <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
               <span className="text-green-600 font-semibold">{products.filter(p => p.is_active).length}</span>
             </div>
             <div>
               <p className="text-sm font-medium text-gray-600">Active Products</p>
               <p className="text-lg font-semibold text-gray-900">{products.filter(p => p.is_active).length}</p>
             </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-yellow-600 font-semibold">{products.filter(p => p.stock < 10).length}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-lg font-semibold text-gray-900">{products.filter(p => p.stock < 10).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-red-600 font-semibold">{products.filter(p => p.stock === 0).length}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-lg font-semibold text-gray-900">{products.filter(p => p.stock === 0).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Products ({filteredProducts.length})
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select className="text-sm border border-gray-300 rounded px-2 py-1">
                <option>Name</option>
                <option>Price</option>
                <option>Stock</option>
                <option>Created Date</option>
              </select>
            </div>
          </div>
        </div>
        
        {filteredProducts.length > 0 ? (
          <ProductTable
            products={filteredProducts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiPackage className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by adding your first product.'}
            </p>
            {!searchTerm && categoryFilter === 'all' && statusFilter === 'all' && (
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                Add Your First Product
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
