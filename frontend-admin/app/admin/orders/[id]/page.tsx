'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft, FiTruck, FiCheckCircle, FiFileText, FiDownload, FiMail, FiEye, FiPackage, FiUser, FiMapPin, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Order, Invoice } from '@/lib/types';
import { ordersAPI, invoicesAPI } from '@/lib/api';

const OrderDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadOrder();
    }
  }, [params.id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await ordersAPI.getById(Number(params.id));
      setOrder(data);
    } catch (error: any) {
      toast.error('Failed to load order details');
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: Order['status']) => {
    if (!order) return;

    try {
      setUpdating(true);
      let trackingNumber: string | undefined;
      let estimatedDelivery: string | undefined;
      let generateInvoice = false;

      switch (newStatus) {
        case 'processing':
          if (order.status === 'pending') {
            // From pending to processing
          }
          break;
        case 'out_for_delivery':
          if (order.status === 'processing') {
            trackingNumber = `TRK${Date.now()}`;
            estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
            generateInvoice = true;
          }
          break;
        case 'delivered':
          if (order.status === 'out_for_delivery') {
            // From out_for_delivery to delivered
          }
          break;
        default:
          return;
      }

      await ordersAPI.updateStatus(order.id, {
        status: newStatus,
        tracking_number: trackingNumber,
        estimated_delivery: estimatedDelivery,
        generate_invoice: generateInvoice
      });

      toast.success(`Order status updated to ${newStatus}`);
      if (generateInvoice) {
        toast.info('Invoice generated automatically');
      }
      loadOrder(); // Reload order data
    } catch (error) {
      toast.error('Failed to update order status');
      console.error('Error updating order status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!order) return;

    try {
      setUpdating(true);
      await ordersAPI.generateInvoice(order.id);
      toast.success('Invoice generated successfully');
      loadOrder(); // Reload to get updated order with invoice
    } catch (error) {
      toast.error('Failed to generate invoice');
      console.error('Error generating invoice:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!order?.invoice) {
      toast.error('No invoice available for this order');
      return;
    }

    try {
      const blob = await invoicesAPI.downloadPDF(order.invoice.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${order.invoice.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      toast.error('Failed to download invoice');
      console.error('Error downloading invoice:', error);
    }
  };

  const handleSendInvoice = async () => {
    if (!order?.invoice) {
      toast.error('No invoice available for this order');
      return;
    }

    try {
      await invoicesAPI.sendInvoice(order.invoice.id, order.customer_email);
      toast.success('Invoice sent to customer email');
    } catch (error) {
      toast.error('Failed to send invoice');
      console.error('Error sending invoice:', error);
    }
  };

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
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${config.color}`}>
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
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${config.color}`}>
        {config.icon} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getNextStatus = (currentStatus: Order['status']): Order['status'] | null => {
    switch (currentStatus) {
      case 'pending':
        return 'processing';
      case 'processing':
        return 'out_for_delivery';
      case 'out_for_delivery':
        return 'delivered';
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600">The order you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const nextStatus = getNextStatus(order.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order #{order.order_number}</h1>
            <p className="text-gray-600 mt-1">Order Details</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {nextStatus && (
            <button
              onClick={() => handleUpdateStatus(nextStatus)}
              disabled={updating}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FiTruck className="w-4 h-4" />
              <span>Update to {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}</span>
            </button>
          )}
          
          {!order.invoice && (order.status === 'out_for_delivery' || order.status === 'delivered') && (
            <button
              onClick={handleGenerateInvoice}
              disabled={updating}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FiFileText className="w-4 h-4" />
              <span>Generate Invoice</span>
            </button>
          )}
          
          {order.invoice && (
            <>
              <button
                onClick={handleDownloadInvoice}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <FiDownload className="w-4 h-4" />
                <span>Download Invoice</span>
              </button>
              <button
                onClick={handleSendInvoice}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <FiMail className="w-4 h-4" />
                <span>Send Invoice</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Order Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Current Status:</span>
                {getStatusBadge(order.status)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Payment Status:</span>
                {getPaymentStatusBadge(order.payment_status)}
              </div>
              {order.tracking_number && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tracking Number:</span>
                  <span className="font-medium">{order.tracking_number}</span>
                </div>
              )}
              {order.estimated_delivery && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Estimated Delivery:</span>
                  <span className="font-medium">{new Date(order.estimated_delivery).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <FiPackage className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.product_name}</p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ${parseFloat(item.total).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No items found</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiUser className="w-5 h-5 mr-2" />
              Customer Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{order.customer_email}</p>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiMapPin className="w-5 h-5 mr-2" />
              Shipping Address
            </h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">{order.shipping_address}</p>
              <p className="text-sm text-gray-600">
                {order.shipping_city}, {order.shipping_state} {order.shipping_zip_code}
              </p>
              <p className="text-sm text-gray-600">{order.shipping_country}</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiDollarSign className="w-5 h-5 mr-2" />
              Order Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span className="font-medium">{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium capitalize">{order.payment_method}</span>
              </div>
              {order.advance_amount && parseFloat(order.advance_amount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Advance Amount:</span>
                  <span className="font-medium">${parseFloat(order.advance_amount).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>${parseFloat(order.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Information */}
          {order.invoice && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiFileText className="w-5 h-5 mr-2" />
                Invoice Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice Number:</span>
                  <span className="font-medium">{order.invoice.invoice_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    order.invoice.status === 'generated' ? 'bg-green-100 text-green-800' :
                    order.invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.invoice.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Generated:</span>
                  <span className="font-medium">{new Date(order.invoice.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
