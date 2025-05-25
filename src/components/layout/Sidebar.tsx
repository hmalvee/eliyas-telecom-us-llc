import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  FileText, 
  Package, 
  BarChart, 
  Settings, 
  LogOut 
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Customers', icon: <Users size={20} />, path: '/customers' },
    { name: 'Sales', icon: <ShoppingCart size={20} />, path: '/sales' },
    { name: 'Invoices', icon: <FileText size={20} />, path: '/invoices' },
    { name: 'Plans', icon: <Package size={20} />, path: '/plans' },
    { name: 'Reports', icon: <BarChart size={20} />, path: '/reports' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen">
      <div className="p-6 flex items-center justify-center border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">Eliyas Telecom USA</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className={`${isActive(item.path) ? 'text-blue-600' : 'text-gray-500'}`}>
                  {item.icon}
                </span>
                <span className="ml-3 font-medium">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <button className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 w-full">
          <LogOut size={20} className="text-gray-500" />
          <span className="ml-3 font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;