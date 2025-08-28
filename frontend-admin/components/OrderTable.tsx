'use client';

import React from 'react';
import { Order } from '@/lib/types';
import { FiEye, FiTruck, FiCheckCircle, FiXCircle, FiFileText, FiDownload, FiMail } from 'react-icons/fi';

type OrderStage = 'all' | 'processing' | 'dispatch' | 'bill_generated' | 'out_for_delivery' | 'completed';

interface OrderTableProps {
  orders: Order[];
  onView: (order: Order) => void;
  onUpdateStatus: (order: Order) => void;
  onGenerateInvoice: (order: Order) => void;
  onDownloadInvoice: (order: Order) => void;
  onSendInvoice: (order: Order) => void;
  stage: OrderStage;
  stageActions: {
    primaryAction?: string;
    primaryStatus?: Order['status'];
    secondaryAction?: string;
    secondaryStatus?: Order['status'];
  };
}

const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  onView,
  onUpdateStatus,
  onGenerateInvoice,
  onDownloadInvoice,
  onSendInvoice,
  stage,
  stageActions
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

  const getActionButtons = (order: Order) => {
    const buttons = [];

    // Primary action button
    if (stageActions.primaryAction) {
      buttons.push(
        <button
          key="primary"
          onClick={() => onUpdateStatus(order)}
          className="text-blue-600 hover:text-blue-900 p-1 rounded"
          title={stageActions.primaryAction}
        >
          {stageActions.primaryAction === 'Generate Bill' && <FiFileText className="w-4 h-4" />}
          {stageActions.primaryAction === 'View Details' && <FiEye className="w-4 h-4" />}
          {stageActions.primaryAction === 'Send to Dispatch' && <FiTruck className="w-4 h-4" />}
          {stageActions.primaryAction === 'Add Delivery Details' && <FiTruck className="w-4 h-4" />}
          {stageActions.primaryAction === 'Mark Delivered' && <FiCheckCircle className="w-4 h-4" />}
        </button>
      );
    }

    // Secondary action button (Send to Bill Generated)
    if (stageActions.secondaryAction === 'Send to Bill Generated') {
      buttons.push(
        <button
          key="secondary"
          onClick={() => onUpdateStatus(order)}
          className="text-green-600 hover:text-green-900 p-1 rounded"
          title="Send to Bill Generated"
        >
          <FiFileText className="w-4 h-4" />
        </button>
      );
    }

    // Invoice buttons for bill_generated and later stages
    if (stage === 'bill_generated' || stage === 'out_for_delivery' || stage === 'completed') {
      if (order.invoice) {
        buttons.push(
          <button
            key="download"
            onClick={() => onDownloadInvoice(order)}
            className="text-purple-600 hover:text-purple-900 p-1 rounded"
            title="Download Invoice"
          >
            <FiDownload className="w-4 h-4" />
          </button>
        );
        buttons.push(
          <button
            key="send"
            onClick={() => onSendInvoice(order)}
            className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
            title="Send Invoice"
          >
            <FiMail className="w-4 h-4" />
          </button>
        );
      }
    }

    // View details button (always available)
    buttons.push(
      <button
        key="view"
        onClick={() => onView(order)}
        className="text-gray-600 hover:text-gray-900 p-1 rounded"
        title="View Details"
      >
        <FiEye className="w-4 h-4" />
      </button>
    );

    return buttons;
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
                Invoice
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
                                 <td className="px-6 py-4 whitespace-nowrap">
                   {order.invoice ? (
                     <div className="flex items-center space-x-2">
                       <span className="text-green-600 text-sm font-medium">
                         {order.invoice.invoice_number}
                       </span>
                       <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                         order.invoice.status === 'generated' ? 'bg-green-100 text-green-800' :
                         order.invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                         'bg-gray-100 text-gray-800'
                       }`}>
                         {order.invoice.status}
                       </span>
                     </div>
                   ) : (
                     <span className="text-gray-400 text-sm">No invoice</span>
                   )}
                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                   {new Date(order.created_at).toLocaleDateString()}
                 </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {getActionButtons(order)}
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
