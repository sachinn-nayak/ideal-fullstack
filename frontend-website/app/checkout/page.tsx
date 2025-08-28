'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiCreditCard, FiLock, FiMapPin, FiUpload, FiDollarSign, FiPlus, FiCheck, FiX } from 'react-icons/fi';
import { useCart } from '@/context/CartContext';
import { authAPI, ordersAPI, paymentsAPI, addressesAPI } from '@/lib/api';
import { toast } from 'react-toastify';
import Loader from '@/components/Loader';

interface Address {
  id: number;
  address_type: 'billing' | 'shipping';
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressFormType, setAddressFormType] = useState<'billing' | 'shipping'>('billing');

  // Get user from authAPI
  useEffect(() => {
    const checkAuth = () => {
      try {
        const currentUser = authAPI.getCurrentUser();
        const isAuth = authAPI.isAuthenticated();
        
        if (isAuth && currentUser) {
          setUser(currentUser);
          loadAddresses();
        } else {
          // Clear any invalid data
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/auth/login');
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const loadAddresses = async () => {
    try {
      const addressesData = await addressesAPI.getAll();
      console.log('Addresses API response:', addressesData);
      
      // Handle different response structures
      let addressesArray = addressesData;
      if (addressesData && typeof addressesData === 'object') {
        if (Array.isArray(addressesData)) {
          addressesArray = addressesData;
        } else if (addressesData.results && Array.isArray(addressesData.results)) {
          addressesArray = addressesData.results;
        } else if (addressesData.addresses && Array.isArray(addressesData.addresses)) {
          addressesArray = addressesData.addresses;
        } else {
          addressesArray = [];
        }
      } else {
        addressesArray = [];
      }
      
      console.log('Processed addresses array:', addressesArray);
      setAddresses(addressesArray);
    } catch (error) {
      console.error('Error loading addresses:', error);
      setAddresses([]);
    }
  };

  const [formData, setFormData] = useState({
    // Address selection
    billingAddressId: null as number | null,
    shippingAddressId: null as number | null,
    useSameAddress: true,
    
    // New address form
    newAddress: {
      street_address: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'India'
    },
    
    // Payment method
    paymentMethod: {
      type: 'online' as 'online' | 'offline' | 'cod',
      // Online payment fields
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
      // Offline payment fields
      bankName: '',
      transactionId: '',
      screenshot: null as File | null,
      // COD fields
      advanceAmount: 200,
      advancePaid: false
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = getTotalPrice();
  const shipping = 0; // Free shipping
  const tax = subtotal * 0.18; // 18% GST for India
  const total = subtotal + shipping + tax;

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  // Redirect if cart is empty
  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  // Redirect if not logged in
  if (!user) {
    router.push('/auth/login');
    return null;
  }

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => {
      if (section === '') {
        // Handle top-level fields like billingAddressId, shippingAddressId, useSameAddress
        return {
          ...prev,
          [field]: value
        };
      } else {
        // Handle nested fields like paymentMethod.type, newAddress.street_address
        return {
          ...prev,
          [section]: {
            ...prev[section as keyof typeof prev],
            [field]: value
          }
        };
      }
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleInputChange('paymentMethod', 'screenshot', file);
    }
  };

  const handleCreateAddress = async () => {
    try {
      const addressData = {
        address_type: addressFormType,
        ...formData.newAddress,
        is_default: addresses.filter(a => a.address_type === addressFormType).length === 0
      };

      await addressesAPI.create(addressData);
      await loadAddresses();
      
      // Reset form
      setFormData(prev => ({
        ...prev,
        newAddress: {
          street_address: '',
          city: '',
          state: '',
          zip_code: '',
          country: 'India'
        }
      }));
      setShowAddressForm(false);
      
      toast.success('Address created successfully!');
    } catch (error) {
      toast.error('Failed to create address');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Address validation
    if (!formData.billingAddressId && !showAddressForm) {
      newErrors.billingAddress = 'Please select or create a billing address';
    }
    if (!formData.useSameAddress && !formData.shippingAddressId && !showAddressForm) {
      newErrors.shippingAddress = 'Please select or create a shipping address';
    }

    // Payment validation based on type
    if (formData.paymentMethod.type === 'online') {
      // For Razorpay, no card details validation needed on frontend
      // Razorpay will handle the payment form
    } else if (formData.paymentMethod.type === 'offline') {
      if (!formData.paymentMethod.bankName) newErrors.bankName = 'Bank name is required';
      if (!formData.paymentMethod.transactionId) newErrors.transactionId = 'Transaction ID is required';
      if (!formData.paymentMethod.screenshot) newErrors.screenshot = 'Payment screenshot is required';
    } else if (formData.paymentMethod.type === 'cod') {
      if (!formData.paymentMethod.advancePaid) {
        newErrors.advance = '₹200 advance payment is required for COD orders';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Get selected addresses
      const billingAddress = addresses.find(a => a.id === formData.billingAddressId);
      const shippingAddress = formData.useSameAddress ? billingAddress : addresses.find(a => a.id === formData.shippingAddressId);

      if (!billingAddress || !shippingAddress) {
        toast.error('Please select billing and shipping addresses');
        setLoading(false);
        return;
      }

      // Validate that addresses exist in the database
      if (!billingAddress.id || !shippingAddress.id) {
        toast.error('Invalid addresses. Please create new addresses.');
        setLoading(false);
        return;
      }

      // Get customer ID from user data
      const customerId = user.customer_id || user.customer?.id;
      
      if (!customerId) {
        toast.error('Customer profile not found. Please contact support.');
        setLoading(false);
        return;
      }
      
      // Round total to 2 decimal places
      const roundedTotal = Math.round(total * 100) / 100;

      // Create order data
      const orderData = {
        customer: customerId,
        items: items.map(item => ({
          product: item.product.id,
          quantity: item.quantity,
          price: parseFloat(item.product.price.toFixed(2))
        })),
        total: roundedTotal,
        payment_method: formData.paymentMethod.type,
        billing_address: billingAddress.id,
        shipping_address: shippingAddress.id,
        advance_amount: formData.paymentMethod.type === 'cod' ? 200 : 0
      };

      console.log('Order data being sent:', orderData);

      // Create order in backend
      const orderResponse = await ordersAPI.createOrder(orderData);
      const order = orderResponse.order || orderResponse;
      
      console.log('Order created:', order);
      
      // Create payment record
      const paymentData = {
        order: order.id,
        amount: roundedTotal,
        payment_method: formData.paymentMethod.type,
        payment_status: 'pending'
      };
      
      const payment = await paymentsAPI.createPayment(paymentData);

             // Handle payment based on type
       if (formData.paymentMethod.type === 'online') {
         // Create Razorpay order
         const razorpayOrder = await paymentsAPI.createRazorpayOrder(roundedTotal, order.id);
        
                 // Initialize Razorpay
         const options = {
           key: 'rzp_test_JVghhtQ2c5Ur2q',
           amount: roundedTotal * 100, // Convert to paise
          currency: 'INR',
          name: 'iDeals Store',
          description: `Order ${order.order_number}`,
          order_id: razorpayOrder.razorpay_order_id,
          handler: async (response: any) => {
            try {
              await paymentsAPI.verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: order.id
              });
              
              clearCart();
              toast.success('Payment successful! Order placed.');
              router.push('/orders');
            } catch (error) {
              toast.error('Payment verification failed');
            }
          },
                     prefill: {
             name: user.customer?.name || user.first_name + ' ' + user.last_name,
             email: user.email,
             contact: user.customer?.phone || ''
           },
          theme: {
            color: '#3B82F6'
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        
      } else if (formData.paymentMethod.type === 'offline') {
        // Upload screenshot
        if (formData.paymentMethod.screenshot) {
          await paymentsAPI.uploadScreenshot(
            formData.paymentMethod.screenshot,
            payment.payment_id,
            formData.paymentMethod.bankName,
            formData.paymentMethod.transactionId
          );
        }
        
        clearCart();
        toast.success('Order placed! Payment screenshot uploaded for verification.');
        router.push('/orders');
        
      } else if (formData.paymentMethod.type === 'cod') {
        // Create COD payment record
        await paymentsAPI.createPayment({
          ...paymentData,
          cod_payment: {
            advance_amount: 200,
            advance_verified: formData.paymentMethod.advancePaid
          }
        });
        
        clearCart();
        toast.success('Order placed! ₹200 advance payment confirmed.');
        router.push('/orders');
      }
      
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDefaultAddress = (type: 'billing' | 'shipping') => {
    return addresses.find(a => a.address_type === type && a.is_default);
  };

  // Debug logging
  console.log('Current addresses:', addresses);
  console.log('Current formData:', formData);
  console.log('Billing address ID:', formData.billingAddressId);
  console.log('Shipping address ID:', formData.shippingAddressId);
  console.log('Current user:', user);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your purchase</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Addresses Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <FiMapPin className="w-5 h-5 text-blue-600 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-900">Addresses</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddressForm(true);
                      setAddressFormType('billing');
                    }}
                    className="inline-flex items-center px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <FiPlus className="w-4 h-4 mr-1" />
                    Add Address
                  </button>
                </div>

                {/* Address Form */}
                {showAddressForm && (
                  <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Add New {addressFormType === 'billing' ? 'Billing' : 'Shipping'} Address</h3>
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address
                        </label>
                        <input
                          type="text"
                          value={formData.newAddress.street_address}
                          onChange={(e) => handleInputChange('newAddress', 'street_address', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="123 Main St"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={formData.newAddress.city}
                          onChange={(e) => handleInputChange('newAddress', 'city', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Mumbai"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          value={formData.newAddress.state}
                          onChange={(e) => handleInputChange('newAddress', 'state', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Maharashtra"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          PIN Code
                        </label>
                        <input
                          type="text"
                          value={formData.newAddress.zip_code}
                          onChange={(e) => handleInputChange('newAddress', 'zip_code', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="400001"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <select
                          value={formData.newAddress.country}
                          onChange={(e) => handleInputChange('newAddress', 'country', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="India">India</option>
                          <option value="USA">United States</option>
                          <option value="Canada">Canada</option>
                          <option value="UK">United Kingdom</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-4">
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateAddress}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Save Address
                      </button>
                    </div>
                  </div>
                )}

                {/* Billing Address Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Billing Address</h3>
                                     <div className="space-y-3">
                     {Array.isArray(addresses) && addresses.filter(a => a.address_type === 'billing').length > 0 ? (
                       addresses.filter(a => a.address_type === 'billing').map((address) => (
                         <label key={address.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300">
                           <input
                             type="radio"
                             name="billingAddress"
                             value={address.id}
                             checked={formData.billingAddressId === address.id}
                             onChange={(e) => handleInputChange('', 'billingAddressId', parseInt(e.target.value))}
                             className="mt-1"
                           />
                           <div className="flex-1">
                             <div className="flex items-center justify-between">
                               <span className="font-medium">{address.street_address}</span>
                               {address.is_default && (
                                 <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Default</span>
                               )}
                             </div>
                             <p className="text-sm text-gray-600">
                               {address.city}, {address.state} {address.zip_code}, {address.country}
                             </p>
                           </div>
                         </label>
                       ))
                     ) : (
                       <div className="text-center py-4 text-gray-500">
                         <p>No billing addresses found. Please add a new address.</p>
                       </div>
                     )}
                   </div>
                  {errors.billingAddress && <p className="mt-2 text-sm text-red-600">{errors.billingAddress}</p>}
                </div>

                {/* Same Address Toggle */}
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.useSameAddress}
                      onChange={(e) => handleInputChange('', 'useSameAddress', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Use same address for shipping</span>
                  </label>
                </div>

                {/* Shipping Address Selection */}
                {!formData.useSameAddress && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Shipping Address</h3>
                                         <div className="space-y-3">
                       {Array.isArray(addresses) && addresses.filter(a => a.address_type === 'shipping').length > 0 ? (
                         addresses.filter(a => a.address_type === 'shipping').map((address) => (
                           <label key={address.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300">
                             <input
                               type="radio"
                               name="shippingAddress"
                               value={address.id}
                               checked={formData.shippingAddressId === address.id}
                               onChange={(e) => handleInputChange('', 'shippingAddressId', parseInt(e.target.value))}
                               className="mt-1"
                             />
                             <div className="flex-1">
                               <div className="flex items-center justify-between">
                                 <span className="font-medium">{address.street_address}</span>
                                 {address.is_default && (
                                   <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Default</span>
                                 )}
                               </div>
                               <p className="text-sm text-gray-600">
                                 {address.city}, {address.state} {address.zip_code}, {address.country}
                               </p>
                             </div>
                           </label>
                         ))
                       ) : (
                         <div className="text-center py-4 text-gray-500">
                           <p>No shipping addresses found. Please add a new address.</p>
                         </div>
                       )}
                     </div>
                    {errors.shippingAddress && <p className="mt-2 text-sm text-red-600">{errors.shippingAddress}</p>}
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <FiCreditCard className="w-5 h-5 text-blue-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
                </div>

                <div className="space-y-6">
                  {/* Payment Type Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                      <input
                        type="radio"
                        name="paymentType"
                        value="online"
                        checked={formData.paymentMethod.type === 'online'}
                        onChange={() => handleInputChange('paymentMethod', 'type', 'online')}
                        className="sr-only"
                      />
                                             <FiCreditCard className="w-8 h-8 text-blue-600 mb-2" />
                       <span className="font-medium">Razorpay Payment</span>
                       <span className="text-sm text-gray-500 text-center">Credit/Debit Card, UPI, Net Banking</span>
                    </label>

                    <label className="flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                      <input
                        type="radio"
                        name="paymentType"
                        value="offline"
                        checked={formData.paymentMethod.type === 'offline'}
                        onChange={() => handleInputChange('paymentMethod', 'type', 'offline')}
                        className="sr-only"
                      />
                                             <FiUpload className="w-8 h-8 text-green-600 mb-2" />
                       <span className="font-medium">Bank Transfer</span>
                       <span className="text-sm text-gray-500 text-center">Pay via Bank Transfer, Upload Screenshot</span>
                    </label>

                    <label className="flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                      <input
                        type="radio"
                        name="paymentType"
                        value="cod"
                        checked={formData.paymentMethod.type === 'cod'}
                        onChange={() => handleInputChange('paymentMethod', 'type', 'cod')}
                        className="sr-only"
                      />
                      <FiDollarSign className="w-8 h-8 text-orange-600 mb-2" />
                      <span className="font-medium">Cash on Delivery</span>
                      <span className="text-sm text-gray-500 text-center">Pay ₹200 advance + rest on delivery</span>
                    </label>
                  </div>

                                     {/* Online Payment Form */}
                   {formData.paymentMethod.type === 'online' && (
                     <div className="border-t pt-6">
                       <h3 className="text-lg font-semibold text-gray-900 mb-4">Razorpay Payment</h3>
                       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                         <div className="flex items-start space-x-3">
                           <FiCreditCard className="w-6 h-6 text-blue-600 mt-1" />
                           <div>
                             <h4 className="font-medium text-blue-900">Secure Payment Gateway</h4>
                             <p className="text-sm text-blue-700 mt-1">
                               You will be redirected to Razorpay's secure payment gateway to complete your payment. 
                               All major credit cards, debit cards, UPI, and net banking options are supported.
                             </p>
                           </div>
                         </div>
                       </div>
                     </div>
                   )}

                  {/* Offline Payment Form */}
                  {formData.paymentMethod.type === 'offline' && (
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Transfer Details</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bank Name
                          </label>
                          <input
                            type="text"
                            value={formData.paymentMethod.bankName}
                            onChange={(e) => handleInputChange('paymentMethod', 'bankName', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                              errors.bankName ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="State Bank of India"
                          />
                          {errors.bankName && <p className="mt-1 text-sm text-red-600">{errors.bankName}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Transaction ID
                          </label>
                          <input
                            type="text"
                            value={formData.paymentMethod.transactionId}
                            onChange={(e) => handleInputChange('paymentMethod', 'transactionId', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                              errors.transactionId ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="TXN123456789"
                          />
                          {errors.transactionId && <p className="mt-1 text-sm text-red-600">{errors.transactionId}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Screenshot
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                              errors.screenshot ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors.screenshot && <p className="mt-1 text-sm text-red-600">{errors.screenshot}</p>}
                          <p className="text-sm text-gray-500 mt-1">Upload screenshot of your payment confirmation</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* COD Payment Form */}
                  {formData.paymentMethod.type === 'cod' && (
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash on Delivery</h3>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <FiDollarSign className="w-6 h-6 text-orange-600 mt-1" />
                          <div>
                            <h4 className="font-medium text-orange-900">Advance Payment Required</h4>
                            <p className="text-sm text-orange-700 mt-1">
                              For COD orders, you need to pay ₹200 advance. The remaining amount will be collected on delivery.
                            </p>
                            <div className="mt-3">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={formData.paymentMethod.advancePaid}
                                  onChange={(e) => handleInputChange('paymentMethod', 'advancePaid', e.target.checked)}
                                  className="mr-2"
                                />
                                <span className="text-sm text-orange-900">
                                  I confirm that I have paid ₹200 advance payment
                                </span>
                              </label>
                            </div>
                            {errors.advance && <p className="mt-2 text-sm text-red-600">{errors.advance}</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>

                {/* Items */}
                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.product.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-medium">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-3 border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">GST (18%)</span>
                    <span className="font-medium">₹{tax.toFixed(2)}</span>
                  </div>
                  {formData.paymentMethod.type === 'cod' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Advance Payment</span>
                      <span className="font-medium text-orange-600">₹200.00</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-gray-900">₹{total.toFixed(2)}</span>
                    </div>
                    {formData.paymentMethod.type === 'cod' && (
                      <div className="text-sm text-gray-500 mt-1">
                        ₹{(total - 200).toFixed(2)} to be paid on delivery
                      </div>
                    )}
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center mt-6"
                >
                  {loading ? (
                    <Loader size="sm" className="text-white" />
                  ) : (
                    <>
                      <FiLock className="w-5 h-5 mr-2" />
                      Place Order
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By placing your order, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

