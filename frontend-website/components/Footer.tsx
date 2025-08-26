import React from 'react';
import Link from 'next/link';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="text-2xl font-bold text-gray-900 mb-4">
              iDeals
            </div>
            <p className="text-gray-600 mb-4 max-w-md">
              Your trusted source for premium Apple accessories and wholesale pricing. 
              Quality products, competitive prices, and exceptional service.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <FiMail className="w-4 h-4 mr-2" />
                <span>support@ideals.com</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FiPhone className="w-4 h-4 mr-2" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FiMapPin className="w-4 h-4 mr-2" />
                <span>123 Tech Street, Silicon Valley, CA 94025</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Orders
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Register
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            © 2024 iDeals. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
              Shipping Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

