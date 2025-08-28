'use client';

import React, { useEffect, useState } from 'react';
import { FiPackage, FiShoppingCart, FiDollarSign, FiAlertTriangle, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { DashboardStats } from '@/lib/types';
import { dashboardAPI } from '@/lib/api';
import StatsCard from '@/components/StatsCard';

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardAPI.getStats();
      console.log('Dashboard stats received:', data);
      setStats(data);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load dashboard stats';
      toast.error(errorMessage);
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats || !stats.stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your iDeals admin panel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatsCard
           title="Total Products"
           value={stats.stats.total_products}
           change="+12%"
           changeType="positive"
           icon={FiPackage}
           color="bg-blue-500"
         />
         <StatsCard
           title="Total Orders"
           value={stats.stats.total_orders}
           change="+8%"
           changeType="positive"
           icon={FiShoppingCart}
           color="bg-green-500"
         />
         <StatsCard
           title="Total Revenue"
           value={`$${parseFloat(stats.stats.total_revenue).toLocaleString()}`}
           change="+15%"
           changeType="positive"
           icon={FiDollarSign}
           color="bg-purple-500"
         />
         <StatsCard
           title="Pending Orders"
           value={stats.stats.pending_orders}
           change="+3"
           changeType="neutral"
           icon={FiAlertTriangle}
           color="bg-yellow-500"
         />
      </div>

      {/* Charts and Recent Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </button>
          </div>
                     <div className="space-y-4">
             {Array.isArray(stats.recent_orders) && stats.recent_orders.length > 0 ? (
               stats.recent_orders.map((order) => (
                 <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                   <div>
                     <p className="font-medium text-gray-900">{order.order_number}</p>
                     <p className="text-sm text-gray-500">{order.customer_name}</p>
                   </div>
                   <div className="text-right">
                     <p className="font-medium text-gray-900">${parseFloat(order.total).toFixed(2)}</p>
                     <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                       order.status === 'paid' ? 'bg-green-100 text-green-800' :
                       order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                       'bg-gray-100 text-gray-800'
                     }`}>
                       {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                     </span>
                   </div>
                 </div>
               ))
             ) : (
               <div className="text-center py-8">
                 <p className="text-gray-500">No recent orders</p>
               </div>
             )}
           </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </button>
          </div>
                     <div className="space-y-4">
             {Array.isArray(stats.top_products) && stats.top_products.length > 0 ? (
               stats.top_products.map((product, index) => (
                 <div key={product.product_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                   <div className="flex items-center">
                     <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                       {index + 1}
                     </span>
                     <div>
                       <p className="font-medium text-gray-900">{product.product_name}</p>
                       <p className="text-sm text-gray-500">{product.total_sold} sold</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="font-medium text-gray-900">${parseFloat(product.revenue).toLocaleString()}</p>
                     <p className="text-sm text-gray-500">Revenue</p>
                   </div>
                 </div>
               ))
             ) : (
               <div className="text-center py-8">
                 <p className="text-gray-500">No top products data</p>
               </div>
             )}
           </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FiPackage className="w-6 h-6 text-blue-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Add New Product</p>
              <p className="text-sm text-gray-500">Create a new product listing</p>
            </div>
          </button>
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FiShoppingCart className="w-6 h-6 text-green-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">View Orders</p>
              <p className="text-sm text-gray-500">Manage customer orders</p>
            </div>
          </button>
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FiTrendingUp className="w-6 h-6 text-purple-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Analytics</p>
              <p className="text-sm text-gray-500">View detailed reports</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
