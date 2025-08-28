'use client';

import React from 'react';
import { Order } from '@/lib/types';
import { FiEye, FiTruck, FiCheckCircle, FiXCircle } from 'react-icons/fi';

interface OrderTableProps {
  orders: Order[];
  onView: (order: Order) => void;
  onUpdateStatus: (order: Order) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  onView,
  onUpdateStatus
}) => {
  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      processing: { color: 'bg-purple-100 text-purple-800', icon: '⚙️' },
      out_for_delivery: { color: 'bg-indigo-100 text-indigo-800', icon: '📦' },
      delivered: { color: 'bg-green-100 text-green-800', icon: '✅' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: '❌' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.icon} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

     const getPaymentStatusBadge = (status: Order['payment_status']) => {
     const statusConfig = {
       pending: { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
       verified: { color: 'bg-green-100 text-green-800', icon: '✅' },
       failed: { color: 'bg-red-100 text-red-800', icon: '❌' }
     };

     const config = statusConfig[status] || statusConfig.pending;
     return (
       <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
         {config.icon} {status.charAt(0).toUpperCase() + status.slice(1)}
       </span>
     );
   };

  const getActionButton = (order: Order) => {
    switch (order.status) {
      case 'pending':
        return (
          <button
            onClick={() => onUpdateStatus(order)}
            className="text-purple-600 hover:text-purple-900 p-1 rounded"
            title="Start Processing"
          >
            <FiTruck className="w-4 h-4" />
          </button>
        );
      case 'processing':
        return (
          <button
            onClick={() => onUpdateStatus(order)}
            className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
            title="Mark as Out for Delivery"
          >
            <FiTruck className="w-4 h-4" />
          </button>
        );
      case 'out_for_delivery':
        return (
          <button
            onClick={() => onUpdateStatus(order)}
            className="text-green-600 hover:text-green-900 p-1 rounded"
            title="Mark as Delivered"
          >
            <FiCheckCircle className="w-4 h-4" />
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                                 <td className="px-6 py-4 whitespace-nowrap">
                   <div className="text-sm font-medium text-gray-900">
                     {order.order_number}
                   </div>
                   <div className="text-sm text-gray-500">
                     #{order.id}
                   </div>
                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                   <div className="text-sm font-medium text-gray-900">
                     {order.customer_name}
                   </div>
                   <div className="text-sm text-gray-500">
                     {order.customer_email}
                   </div>
                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                   <div className="text-sm text-gray-900">
                     {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                   </div>
                   <div className="text-sm text-gray-500">
                     {order.items?.[0]?.product_name || 'No items'}
                     {order.items && order.items.length > 1 && ` +${order.items.length - 1} more`}
                   </div>
                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                   <div className="text-sm font-medium text-gray-900">
                     ${parseFloat(order.total).toFixed(2)}
                   </div>
                 </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(order.status)}
                </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                   {getPaymentStatusBadge(order.payment_status)}
                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                   {new Date(order.created_at).toLocaleDateString()}
                 </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onView(order)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded"
                      title="View Details"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                    {getActionButton(order)}
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

export default OrderTable;
