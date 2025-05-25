import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  FileText, 
  Menu 
} from 'lucide-react';

interface BottomNavProps {
  toggleMobileSidebar: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ toggleMobileSidebar }) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <div className="flex items-center justify-around h-16">
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive('/') ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          <LayoutDashboard size={20} />
          <span className="text-xs mt-1">Dashboard</span>
        </Link>
        
        <Link 
          to="/customers" 
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive('/customers') ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          <Users size={20} />
          <span className="text-xs mt-1">Customers</span>
        </Link>
        
        <Link 
          to="/sales" 
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive('/sales') ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          <ShoppingCart size={20} />
          <span className="text-xs mt-1">Sales</span>
        </Link>
        
        <Link 
          to="/invoices" 
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive('/invoices') ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          <FileText size={20} />
          <span className="text-xs mt-1">Invoices</span>
        </Link>
        
        <button 
          onClick={toggleMobileSidebar} 
          className="flex flex-col items-center justify-center w-full h-full text-gray-500"
        >
          <Menu size={20} />
          <span className="text-xs mt-1">More</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNav;