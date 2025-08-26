'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { FiEdit, FiTrash2, FiEye, FiMoreVertical } from 'react-icons/fi';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onView: (product: Product) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEdit,
  onDelete,
  onView
}) => {
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);

  const getStatusBadge = (is_active: boolean) => (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
      is_active 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
    }`}>
      {is_active ? 'Active' : 'Inactive'}
    </span>
  );

  const getStockBadge = (stock: number) => (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
      stock > 10 
        ? 'bg-green-100 text-green-800' 
        : stock > 0 
        ? 'bg-yellow-100 text-yellow-800' 
        : 'bg-red-100 text-red-800'
    }`}>
      {stock > 0 ? `${stock} in stock` : 'Out of stock'}
    </span>
  );

  const getCategoryBadge = (category: string) => (
    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
      {category}
    </span>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center mr-3">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-8 h-8 rounded object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                                         <div>
                       <div className="text-sm font-medium text-gray-900">{product.name}</div>
                       <div className="text-sm text-gray-500">{product.brand}</div>
                     </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getCategoryBadge(product.category)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                                     <div className="text-sm font-medium text-gray-900">
                     ${parseFloat(product.price).toFixed(2)}
                   </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStockBadge(product.stock)}
                </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                   {getStatusBadge(product.is_active)}
                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                   {new Date(product.created_at).toLocaleDateString()}
                 </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onView(product)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded"
                      title="View"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(product)}
                      className="text-green-600 hover:text-green-900 p-1 rounded"
                      title="Edit"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(product.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded"
                      title="Delete"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
