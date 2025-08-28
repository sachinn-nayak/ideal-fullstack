'use client';

import React, { useEffect, useState } from 'react';
import { FiSearch, FiFilter, FiDownload } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Order } from '@/lib/types';
import { ordersAPI } from '@/lib/api';
import OrderTable from '@/components/OrderTable';

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersAPI.getAll();
      console.log('Orders data received:', data);
      // Ensure data is always an array
      setOrders(Array.isArray(data) ? data : []);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load orders';
      toast.error(errorMessage);
      console.error('Error loading orders:', error);
      setOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleView = (order: Order) => {
    // Navigate to order details page or open modal
    toast.info('Order details view will be implemented');
  };

  const handleUpdateStatus = async (order: Order) => {
    try {
      let newStatus: Order['status'];
      let trackingNumber: string | undefined;
      let estimatedDelivery: string | undefined;

      switch (order.status) {
        case 'paid':
          newStatus = 'processing';
          break;
        case 'processing':
          newStatus = 'shipped';
          trackingNumber = `TRK${Date.now()}`;
          estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'shipped':
          newStatus = 'delivered';
          break;
        default:
          return;
      }

      await ordersAPI.updateStatus(order.id, {
        status: newStatus,
        trackingNumber,
        estimatedDelivery
      });

      toast.success(`Order status updated to ${newStatus}`);
      loadOrders();
    } catch (error) {
      toast.error('Failed to update order status');
      console.error('Error updating order status:', error);
    }
  };

     const filteredOrders = (Array.isArray(orders) ? orders : []).filter(order => {
     const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
     const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
     const matchesPayment = paymentFilter === 'all' || order.payment_status === paymentFilter;
     
     return matchesSearch && matchesStatus && matchesPayment;
   });

  const getStatusCount = (status: Order['status']) => {
    return (Array.isArray(orders) ? orders : []).filter(order => order.status === status).length;
  };

     const getPaymentCount = (status: Order['payment_status']) => {
     return (Array.isArray(orders) ? orders : []).filter(order => order.payment_status === status).length;
   };

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
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-2">Manage customer orders and fulfillment</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <FiDownload className="w-4 h-4" />
          <span>Export Orders</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Payment Status</option>
            <option value="pending">Payment Pending</option>
            <option value="paid">Payment Paid</option>
            <option value="failed">Payment Failed</option>
          </select>

          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <FiFilter className="w-4 h-4 mr-2" />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-blue-600 font-semibold">{Array.isArray(orders) ? orders.length : 0}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-lg font-semibold text-gray-900">{Array.isArray(orders) ? orders.length : 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-yellow-600 font-semibold">{getStatusCount('pending')}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-lg font-semibold text-gray-900">{getStatusCount('pending')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-purple-600 font-semibold">{getStatusCount('processing')}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Processing</p>
              <p className="text-lg font-semibold text-gray-900">{getStatusCount('processing')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-indigo-600 font-semibold">{getStatusCount('shipped')}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Shipped</p>
              <p className="text-lg font-semibold text-gray-900">{getStatusCount('shipped')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-green-600 font-semibold">{getStatusCount('delivered')}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-lg font-semibold text-gray-900">{getStatusCount('delivered')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-red-600 font-semibold">{getPaymentCount('failed')}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Failed Payments</p>
              <p className="text-lg font-semibold text-gray-900">{getPaymentCount('failed')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Orders ({filteredOrders.length})
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select className="text-sm border border-gray-300 rounded px-2 py-1">
                <option>Date</option>
                <option>Order Number</option>
                <option>Customer</option>
                <option>Total</option>
                <option>Status</option>
              </select>
            </div>
          </div>
        </div>
        
        {filteredOrders.length > 0 ? (
          <OrderTable
            orders={filteredOrders}
            onView={handleView}
            onUpdateStatus={handleUpdateStatus}
          />
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiSearch className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'No orders have been placed yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
