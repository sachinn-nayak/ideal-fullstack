'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FiDownload, FiMail, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';

interface Invoice {
  id: number;
  invoice_number: string;
  order: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  subtotal: string;
  tax_amount: string;
  shipping_amount: string;
  discount_amount: string;
  total_amount: string;
  status: 'draft' | 'generated' | 'sent' | 'paid' | 'cancelled';
  invoice_date: string;
  due_date?: string;
  notes?: string;
  terms_conditions?: string;
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  company_gst?: string;
  shipping_address: string;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: number;
  product_name: string;
  product_image: string;
  quantity: number;
  price: string;
  total: string;
}

const InvoicePage = () => {
  const params = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadInvoice();
    }
  }, [params.id]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/invoices/${params.id}/`);
      if (response.ok) {
        const data = await response.json();
        setInvoice(data);
        
        // Load order items
        const orderResponse = await fetch(`http://localhost:8000/api/orders/${data.order}/`);
        if (orderResponse.ok) {
          const orderData = await orderResponse.json();
          setOrderItems(orderData.items || []);
        }
      } else {
        toast.error('Failed to load invoice');
      }
    } catch (error) {
      toast.error('Error loading invoice');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!invoice) return;

    try {
      const response = await fetch(`http://localhost:8000/api/invoices/${invoice.id}/download/`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoice.invoice_number}.pdf`;
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

  const handleSendEmail = async () => {
    if (!invoice) return;

    try {
      const response = await fetch(`http://localhost:8000/api/invoices/${invoice.id}/send/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: invoice.customer_email }),
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h2>
          <p className="text-gray-600">The invoice you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Invoice #{invoice.invoice_number}</h1>
              <p className="text-gray-600 mt-2">Order #{invoice.order_number}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleDownload}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <FiDownload className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
              
              <button
                onClick={handleSendEmail}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <FiMail className="w-4 h-4" />
                <span>Send Email</span>
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Company Header */}
          <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{invoice.company_name}</h2>
                <p className="text-gray-600 mt-1">{invoice.company_address}</p>
                <p className="text-gray-600">Phone: {invoice.company_phone}</p>
                <p className="text-gray-600">Email: {invoice.company_email}</p>
                {invoice.company_gst && (
                  <p className="text-gray-600">GST: {invoice.company_gst}</p>
                )}
              </div>
              
              <div className="text-right">
                <h3 className="text-xl font-bold text-gray-900">INVOICE</h3>
                <p className="text-gray-600 mt-1">#{invoice.invoice_number}</p>
                <p className="text-gray-600">Date: {new Date(invoice.invoice_date).toLocaleDateString()}</p>
                {invoice.due_date && (
                  <p className="text-gray-600">Due: {new Date(invoice.due_date).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          </div>

          {/* Customer and Order Info */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Bill To:</h4>
                <p className="text-gray-900 font-medium">{invoice.customer_name}</p>
                <p className="text-gray-600">{invoice.customer_email}</p>
                <p className="text-gray-600 mt-2">{invoice.shipping_address}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Order Details:</h4>
                <p className="text-gray-600">Order Number: {invoice.order_number}</p>
                <p className="text-gray-600">Status: <span className="capitalize">{invoice.status}</span></p>
                <p className="text-gray-600">Created: {new Date(invoice.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="px-8 py-6">
            <h4 className="font-semibold text-gray-900 mb-4">Items:</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orderItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.product_image && (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-10 h-10 rounded-lg object-cover mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.product_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${parseFloat(item.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${parseFloat(item.total).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${parseFloat(invoice.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">${parseFloat(invoice.tax_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium">${parseFloat(invoice.shipping_amount).toFixed(2)}</span>
                </div>
                {parseFloat(invoice.discount_amount) > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium text-red-600">-${parseFloat(invoice.discount_amount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-3 border-t border-gray-300">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-lg font-bold text-gray-900">${parseFloat(invoice.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes and Terms */}
          {(invoice.notes || invoice.terms_conditions) && (
            <div className="px-8 py-6 border-t border-gray-200">
              {invoice.notes && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Notes:</h4>
                  <p className="text-gray-600">{invoice.notes}</p>
                </div>
              )}
              
              {invoice.terms_conditions && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Terms & Conditions:</h4>
                  <p className="text-gray-600">{invoice.terms_conditions}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
