import React, { useState } from 'react';
import { Menu, Bell, Search, User } from 'lucide-react';

interface HeaderProps {
  toggleMobileSidebar: () => void;
  title: string;
}

const Header: React.FC<HeaderProps> = ({ toggleMobileSidebar, title }) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center">
          <button 
            onClick={toggleMobileSidebar}
            className="text-gray-500 md:hidden mr-3 focus:outline-none"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        </div>

        <div className="hidden md:flex items-center flex-1 px-6 max-w-md mx-auto">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="text-gray-500 hover:text-gray-700 focus:outline-none relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>
          <div className="h-8 w-px bg-gray-200 mx-1"></div>
          <button className="flex items-center text-gray-700 hover:text-gray-900 focus:outline-none">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <User size={18} />
            </div>
            <span className="ml-2 font-medium text-sm hidden lg:block">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;