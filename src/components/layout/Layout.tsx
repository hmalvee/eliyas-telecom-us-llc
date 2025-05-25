import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileSidebar from './MobileSidebar';
import BottomNav from './BottomNav';

const Layout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  
  const getPageTitle = (): string => {
    const path = location.pathname;
    
    switch(path) {
      case '/':
        return 'Dashboard';
      case '/customers':
        return 'Customers';
      case '/sales':
        return 'Sales';
      case '/invoices':
        return 'Invoices';
      case '/plans':
        return 'Plans';
      case '/reports':
        return 'Reports';
      case '/settings':
        return 'Settings';
      default:
        if (path.startsWith('/customers/')) return 'Customer Details';
        if (path.startsWith('/invoices/')) return 'Invoice Details';
        return 'Eliyas Telecom USA';
    }
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <MobileSidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleMobileSidebar={toggleMobileSidebar} title={getPageTitle()} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
        
        <BottomNav toggleMobileSidebar={toggleMobileSidebar} />
      </div>
    </div>
  );
};

export default Layout;