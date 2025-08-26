'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ordersAPI, mockProducts } from '@/lib/api';
import { FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, FiClock, FiMapPin } from 'react-icons/fi';
import Loader from '@/components/Loader';
import EmptyState from '@/components/EmptyState';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (user && params.id) {
        try {
          const orderData = await ordersAPI.getOrderById(params.id as string);
          setOrder(orderData);
        } catch (error) {
          console.error('Failed to fetch order:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [user, params.id]);

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

  const getProductName = (productId: number) => {
    const product = mockProducts.find(p => p.id === productId);
    return product ? product.name : 'Product not found';
  };

  const getTrackingSteps = (status: string) => {
    const steps = [
      { name: 'Order Placed', status: 'completed', icon: FiCheckCircle },
      { name: 'Processing', status: status === 'processing' || status === 'shipped' || status === 'delivered' ? 'completed' : 'pending', icon: FiClock },
      { name: 'Shipped', status: status === 'shipped' || status === 'delivered' ? 'completed' : 'pending', icon: FiTruck },
      { name: 'Delivered', status: status === 'delivered' ? 'completed' : 'pending', icon: FiPackage }
    ];
    return steps;
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
            description="You need to be logged in to view order details."
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

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EmptyState
            type="orders"
            title="Order not found"
            description="The order you're looking for doesn't exist."
            action={
              <Link
                href="/orders"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View All Orders
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const trackingSteps = getTrackingSteps(order.status);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/orders"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Order #{order.id}</h1>
          <p className="text-gray-600 mt-2">
            Placed on {new Date(order.orderDate).toLocaleDateString()}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Status</h2>
              
              {/* Status Badge */}
              <div className="mb-6">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>

              {/* Tracking Steps */}
              <div className="space-y-4">
                {trackingSteps.map((step, index) => (
                  <div key={step.name} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                      step.status === 'completed' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      <step.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${
                        step.status === 'completed' ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.name}
                      </p>
                    </div>
                    {index < trackingSteps.length - 1 && (
                      <div className={`w-px h-8 ml-4 ${
                        step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Items</h2>
              
              <div className="space-y-4">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="flex items-center space-x-4 py-4 border-b border-gray-100 last:border-b-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-xs">Img</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {getProductName(item.productId)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ${(item.quantity * item.price).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Address</h2>
              
              <div className="flex items-start space-x-3">
                <FiMapPin className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-gray-900">
                    {order.address?.street || 'Address not available'}
                  </p>
                  <p className="text-gray-600">
                    {order.address?.city}, {order.address?.state} {order.address?.zipCode}
                  </p>
                  <p className="text-gray-600">
                    {order.address?.country}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>

              {/* Order Info */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID</span>
                  <span className="font-medium">#{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date</span>
                  <span className="font-medium">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </span>
                </div>
                {order.deliveryDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Date</span>
                    <span className="font-medium">
                      {new Date(order.deliveryDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {order.trackingNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tracking</span>
                    <span className="font-medium text-blue-600">
                      {order.trackingNumber}
                    </span>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${order.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${(order.total * 0.08).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">
                      ${(order.total * 1.08).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-3">
                <Link
                  href="/products"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center block"
                >
                  Shop Again
                </Link>
                <Link
                  href="/orders"
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center block"
                >
                  View All Orders
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

