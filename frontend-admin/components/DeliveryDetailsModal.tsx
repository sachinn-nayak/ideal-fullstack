'use client';

import React, { useState } from 'react';
import { FiX, FiTruck, FiMapPin, FiPhone, FiUser } from 'react-icons/fi';
import { Order } from '@/lib/types';

interface DeliveryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onConfirm: (deliveryDetails: DeliveryDetails) => void;
}

interface DeliveryDetails {
  deliveryMethod: string;
  courierName: string;
  courierPhone: string;
  trackingNumber: string;
  estimatedDelivery: string;
  notes: string;
}

const DeliveryDetailsModal: React.FC<DeliveryDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
  onConfirm
}) => {
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails>({
    deliveryMethod: '',
    courierName: '',
    courierPhone: '',
    trackingNumber: '',
    estimatedDelivery: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(deliveryDetails);
    onClose();
  };

  const handleChange = (field: keyof DeliveryDetails, value: string) => {
    setDeliveryDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <FiTruck className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Delivery Details</h2>
              <p className="text-sm text-gray-600">Order #{order.order_number}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Delivery Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Method
            </label>
            <select
              value={deliveryDetails.deliveryMethod}
              onChange={(e) => handleChange('deliveryMethod', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="">Select delivery method</option>
              <option value="porter">Porter</option>
              <option value="bus_agency">Bus Agency</option>
              <option value="courier">Courier Service</option>
              <option value="local_delivery">Local Delivery</option>
              <option value="pickup">Customer Pickup</option>
            </select>
          </div>

          {/* Courier Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Courier/Driver Name
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={deliveryDetails.courierName}
                onChange={(e) => handleChange('courierName', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter courier name"
                required
              />
            </div>
          </div>

          {/* Courier Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Courier Phone Number
            </label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="tel"
                value={deliveryDetails.courierPhone}
                onChange={(e) => handleChange('courierPhone', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter phone number"
                required
              />
            </div>
          </div>

          {/* Tracking Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tracking Number
            </label>
            <div className="relative">
              <FiTruck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={deliveryDetails.trackingNumber}
                onChange={(e) => handleChange('trackingNumber', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter tracking number"
                required
              />
            </div>
          </div>

          {/* Estimated Delivery */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Delivery Date
            </label>
            <input
              type="date"
              value={deliveryDetails.estimatedDelivery}
              onChange={(e) => handleChange('estimatedDelivery', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Notes
            </label>
            <textarea
              value={deliveryDetails.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={3}
              placeholder="Any special delivery instructions or notes..."
            />
          </div>

          {/* Customer Address Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <FiMapPin className="w-4 h-4 mr-1" />
              Delivery Address
            </h3>
            <p className="text-sm text-gray-600">
              {order.shipping_address}<br />
              {order.shipping_city}, {order.shipping_state} {order.shipping_zip_code}<br />
              {order.shipping_country}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Confirm Delivery
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryDetailsModal;
