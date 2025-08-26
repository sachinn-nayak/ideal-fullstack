'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiHome, 
  FiPackage, 
  FiShoppingCart, 
  FiUsers, 
  FiSettings, 
  FiBarChart,
  FiLogOut
} from 'react-icons/fi';

const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', icon: FiHome, path: '/admin' },
    { name: 'Products', icon: FiPackage, path: '/admin/products' },
    { name: 'Orders', icon: FiShoppingCart, path: '/admin/orders' },
    { name: 'Analytics', icon: FiBarChart, path: '/admin/analytics' },
    { name: 'Customers', icon: FiUsers, path: '/admin/customers' },
    { name: 'Settings', icon: FiSettings, path: '/admin/settings' },
  ];

  return (
    <div className="bg-white shadow-lg w-64 min-h-screen fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">iDeals Admin</h1>
        <p className="text-sm text-gray-600 mt-1">Management Panel</p>
      </div>
      
      <nav className="mt-6">
        <ul className="space-y-2 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <li key={item.name}>
                <Link
                  href={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="absolute bottom-6 left-0 right-0 px-4">
        <button className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors duration-200 w-full">
          <FiLogOut className="w-5 h-5 mr-3" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
