'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { authAPI, ordersAPI } from '@/lib/api';
import { FiPackage, FiCalendar, FiDollarSign, FiArrowRight, FiFileText, FiDownload, FiMail } from 'react-icons/fi';
import Loader from '@/components/Loader';
import EmptyState from '@/components/EmptyState';
import { toast } from 'react-toastify';

export default function OrdersPage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const currentUser = authAPI.getCurrentUser();
        const isAuth = authAPI.isAuthenticated();
        
        if (isAuth && currentUser) {
          setUser(currentUser);
          const userOrders = await ordersAPI.getUserOrders();
          setOrders(userOrders);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getProductName = (productName: string) => {
    return productName || 'Product not found';
  };

  const handleDownloadInvoice = async (order: any) => {
    if (!order.invoice) {
      toast.error('No invoice available for this order');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/invoices/${order.invoice.id}/download/`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${order.invoice.invoice_number}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Invoice downloaded successfully');
      } else {
        toast.error('Failed to download invoice');
      }
    } catch (error) {
      toast.error('Error downloading invoice');
      console.error('Error:', error);
    }
  };

  const handleSendInvoice = async (order: any) => {
    if (!order.invoice) {
      toast.error('No invoice available for this order');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/invoices/${order.invoice.id}/send/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: order.customer_email }),
      });

      if (response.ok) {
        toast.success('Invoice sent to your email');
      } else {
        toast.error('Failed to send invoice');
      }
    } catch (error) {
      toast.error('Error sending invoice');
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EmptyState
            type="orders"
            title="Please log in"
            description="You need to be logged in to view your orders."
            action={
              <Link
                href="/auth/login"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">
            Track your orders and view order history
          </p>
        </div>

        {orders.length === 0 ? (
          <EmptyState
            type="orders"
            title="No orders yet"
            description="You haven't placed any orders yet. Start shopping to see your order history here."
            action={
              <Link
                href="/products"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Shopping
              </Link>
            }
          />
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FiPackage className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.order_number}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <FiCalendar className="w-4 h-4 mr-1" />
                            <span>{new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center">
                            <FiDollarSign className="w-4 h-4 mr-1" />
                            <span>₹{order.total}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                </div>

                                 {/* Order Items */}
                 <div className="p-6">
                   <div className="space-y-4">
                     {order.items && order.items.length > 0 ? (
                       order.items.map((item: any, index: number) => (
                         <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                           <div className="flex items-center space-x-4">
                             <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                               <span className="text-gray-500 text-xs">Img</span>
                             </div>
                             <div>
                               <p className="font-medium text-gray-900">
                                 {getProductName(item.product_name)}
                               </p>
                               <p className="text-sm text-gray-600">
                                 Qty: {item.quantity} × ₹{item.price}
                               </p>
                             </div>
                           </div>
                           <div className="text-right">
                             <p className="font-medium text-gray-900">
                               ₹{(item.quantity * item.price).toFixed(2)}
                             </p>
                           </div>
                         </div>
                       ))
                     ) : (
                       <div className="text-center py-4 text-gray-500">
                         <p>Items: {order.items_count || 0} product(s)</p>
                         <p className="text-sm">Click "View Details" to see full order information</p>
                       </div>
                     )}
                   </div>

                  {/* Order Actions */}
                  <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-gray-600">
                      {order.tracking_number && (
                        <p>Tracking: {order.tracking_number}</p>
                      )}
                      {order.invoice && (
                        <p className="text-green-600 font-medium">
                          Invoice: {order.invoice.invoice_number}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center space-x-2">
                      {order.invoice && (
                        <>
                          <button
                            onClick={() => handleDownloadInvoice(order)}
                            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            title="Download Invoice"
                          >
                            <FiDownload className="w-4 h-4 mr-1" />
                            Download
                          </button>
                          <button
                            onClick={() => handleSendInvoice(order)}
                            className="inline-flex items-center text-green-600 hover:text-green-700 font-medium transition-colors"
                            title="Send Invoice"
                          >
                            <FiMail className="w-4 h-4 mr-1" />
                            Send
                          </button>
                        </>
                      )}
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        View Details
                        <FiArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

