'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiFilter, FiDownload, FiFileText, FiMail, FiTruck, FiCheckCircle, FiPackage, FiClock, FiUser, FiList } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Order, Invoice } from '@/lib/types';
import { ordersAPI, invoicesAPI } from '@/lib/api';
import OrderTable from '@/components/OrderTable';
import DeliveryDetailsModal from '@/components/DeliveryDetailsModal';

type OrderStage = 'all' | 'processing' | 'dispatch' | 'bill_generated' | 'out_for_delivery' | 'completed';

interface DeliveryDetails {
  deliveryMethod: string;
  courierName: string;
  courierPhone: string;
  trackingNumber: string;
  estimatedDelivery: string;
  notes: string;
}

const OrdersPage = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState<OrderStage>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersAPI.getAll();
      console.log('Orders data received:', data);
      setOrders(Array.isArray(data) ? data : []);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load orders';
      toast.error(errorMessage);
      console.error('Error loading orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (order: Order) => {
    router.push(`/admin/orders/${order.id}`);
  };

  const handleUpdateStatus = async (order: Order, newStatus: Order['status']) => {
    try {
      let trackingNumber: string | undefined;
      let estimatedDelivery: string | undefined;
      let generateInvoice = false;

      switch (newStatus) {
        case 'processing':
          // Move to processing
          break;
        case 'out_for_delivery':
          // Move to out_for_delivery
          trackingNumber = `TRK${Date.now()}`;
          estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'delivered':
          // Move to delivered
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

      toast.success(`Order moved to ${newStatus}`);
      loadOrders();
    } catch (error) {
      toast.error('Failed to update order status');
      console.error('Error updating order status:', error);
    }
  };

  const handleGenerateInvoice = async (order: Order) => {
    try {
      await ordersAPI.generateInvoice(order.id);
      toast.success('Invoice generated successfully');
      loadOrders();
    } catch (error) {
      toast.error('Failed to generate invoice');
      console.error('Error generating invoice:', error);
    }
  };

  const handleDownloadInvoice = async (order: Order) => {
    if (!order.invoice) {
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

  const handleSendInvoice = async (order: Order) => {
    if (!order.invoice) {
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

  const handleSendToDelivery = async (order: Order) => {
    setSelectedOrder(order);
    setDeliveryModalOpen(true);
  };

  const handleDeliveryConfirm = async (deliveryDetails: DeliveryDetails) => {
    if (!selectedOrder) return;

    try {
      // Update order with delivery details and move to out_for_delivery
      await ordersAPI.updateStatus(selectedOrder.id, {
        status: 'out_for_delivery',
        tracking_number: deliveryDetails.trackingNumber,
        estimated_delivery: deliveryDetails.estimatedDelivery,
        generate_invoice: false
      });

      toast.success('Order moved to Out for Delivery with delivery details');
      loadOrders();
    } catch (error) {
      toast.error('Failed to update order with delivery details');
      console.error('Error updating order:', error);
    }
  };

  const getOrdersByStage = (stage: OrderStage): Order[] => {
    const filteredOrders = orders.filter(order => {
      const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      switch (stage) {
        case 'all':
          return true;
        case 'processing':
          // All orders come here first (pending and processing)
          return order.status === 'pending' || order.status === 'processing';
        case 'dispatch':
          // Orders ready for bill generation
          return order.status === 'processing' && order.payment_status === 'verified';
        case 'bill_generated':
          // Orders with generated bills
          return order.status === 'processing' && order.invoice;
        case 'out_for_delivery':
          return order.status === 'out_for_delivery';
        case 'completed':
          return order.status === 'delivered';
        default:
          return false;
      }
    });

    return filteredOrders;
  };

  const getStageStats = () => {
    const allOrders = orders.length;
    const processingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
    const dispatchOrders = orders.filter(o => o.status === 'processing' && o.payment_status === 'verified').length;
    const billGeneratedOrders = orders.filter(o => o.status === 'processing' && o.invoice).length;
    const outForDeliveryOrders = orders.filter(o => o.status === 'out_for_delivery').length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;

    return {
      all: allOrders,
      processing: processingOrders,
      dispatch: dispatchOrders,
      bill_generated: billGeneratedOrders,
      out_for_delivery: outForDeliveryOrders,
      completed: completedOrders
    };
  };

  const getStageConfig = (stage: OrderStage) => {
    const configs = {
      all: {
        title: 'All Orders',
        description: 'View all orders',
        icon: FiList,
        color: 'bg-gray-500',
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-700'
      },
      processing: {
        title: 'Processing',
        description: 'View and update status / Send to dispatch',
        icon: FiClock,
        color: 'bg-yellow-500',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-700'
      },
      dispatch: {
        title: 'Dispatch',
        description: 'Generate bills and upload bills',
        icon: FiFileText,
        color: 'bg-purple-500',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-700'
      },
      bill_generated: {
        title: 'Bill Generated',
        description: 'Add delivery details and send to out for delivery',
        icon: FiFileText,
        color: 'bg-green-500',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700'
      },
      out_for_delivery: {
        title: 'Out for Delivery',
        description: 'Orders in transit',
        icon: FiTruck,
        color: 'bg-indigo-500',
        bgColor: 'bg-indigo-50',
        textColor: 'text-indigo-700'
      },
      completed: {
        title: 'Completed',
        description: 'All completed orders',
        icon: FiCheckCircle,
        color: 'bg-green-500',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700'
      }
    };
    return configs[stage];
  };

  const getStageActions = (stage: OrderStage) => {
    switch (stage) {
      case 'all':
        return {
          primaryAction: 'View Details'
        };
      case 'processing':
        return {
          primaryAction: 'Send to Dispatch',
          primaryStatus: 'processing' as Order['status']
        };
      case 'dispatch':
        return {
          primaryAction: 'Generate Bill',
          secondaryAction: 'Send to Bill Generated',
          secondaryStatus: 'processing' as Order['status']
        };
      case 'bill_generated':
        return {
          primaryAction: 'Add Delivery Details',
          primaryStatus: 'out_for_delivery' as Order['status']
        };
      case 'out_for_delivery':
        return {
          primaryAction: 'Mark Delivered',
          primaryStatus: 'delivered' as Order['status']
        };
      case 'completed':
        return {
          primaryAction: 'View Details'
        };
      default:
        return {};
    }
  };

  const handleStageAction = (order: Order) => {
    const stageActions = getStageActions(activeStage);
    
    if (stageActions.primaryAction === 'Generate Bill') {
      handleGenerateInvoice(order);
    } else if (stageActions.primaryAction === 'View Details') {
      handleView(order);
    } else if (stageActions.primaryAction === 'Add Delivery Details') {
      handleSendToDelivery(order);
    } else if (stageActions.secondaryAction === 'Send to Bill Generated') {
      // Move order to bill_generated stage (same status but with invoice)
      toast.success('Order moved to Bill Generated section');
      loadOrders();
    } else if (stageActions.primaryStatus) {
      handleUpdateStatus(order, stageActions.primaryStatus);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = getStageStats();
  const currentOrders = getOrdersByStage(activeStage);
  const stageConfig = getStageConfig(activeStage);
  const stageActions = getStageActions(activeStage);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Orders</h2>
          <nav className="space-y-2">
            {(['all', 'processing', 'dispatch', 'bill_generated', 'out_for_delivery', 'completed'] as OrderStage[]).map((stage) => {
              const config = getStageConfig(stage);
              const Icon = config.icon;
              const isActive = activeStage === stage;
              
              return (
                <button
                  key={stage}
                  onClick={() => setActiveStage(stage)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                    isActive 
                      ? `${config.bgColor} ${config.textColor} border-2 border-current`
                      : 'text-gray-600 hover:bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{config.title}</span>
                  </div>
                  <span className="text-sm font-semibold">{stats[stage]}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{stageConfig.title}</h1>
              <p className="text-gray-600 mt-2">{stageConfig.description}</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <FiDownload className="w-4 h-4" />
              <span>Export Orders</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search orders by number, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                />
              </div>
              <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <FiFilter className="w-4 h-4 mr-2" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {stageConfig.title} ({currentOrders.length})
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <select className="text-sm border border-gray-300 rounded px-2 py-1">
                    <option>Date</option>
                    <option>Order Number</option>
                    <option>Customer</option>
                    <option>Total</option>
                  </select>
                </div>
              </div>
            </div>
            
            {currentOrders.length > 0 ? (
              <OrderTable
                orders={currentOrders}
                onView={handleView}
                onUpdateStatus={handleStageAction}
                onGenerateInvoice={handleGenerateInvoice}
                onDownloadInvoice={handleDownloadInvoice}
                onSendInvoice={handleSendInvoice}
                stage={activeStage}
                stageActions={stageActions}
              />
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stageConfig.icon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No {stageConfig.title.toLowerCase()}</h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? 'Try adjusting your search terms.'
                    : `No orders are currently in the ${stageConfig.title.toLowerCase()} stage.`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Details Modal */}
      <DeliveryDetailsModal
        isOpen={deliveryModalOpen}
        onClose={() => {
          setDeliveryModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onConfirm={handleDeliveryConfirm}
      />
    </div>
  );
};

export default OrdersPage;

