import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Search, Plus, Package } from 'lucide-react';

const PlanList: React.FC = () => {
  const { plans } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter plans based on search query
  const filteredPlans = plans.filter(plan => 
    plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.price.toString().includes(searchQuery)
  );
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-800">Available Plans</h2>
          
          <div className="flex items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <button
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus size={18} className="mr-1" />
              <span>New Plan</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {filteredPlans.map((plan) => (
          <div key={plan.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="p-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Package size={20} className="text-blue-600" />
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
              <div className="mt-4">
                <span className="text-2xl font-bold text-gray-900">{formatCurrency(plan.price)}</span>
                <span className="text-gray-500 text-sm ml-1">/ month</span>
              </div>
            </div>
            
            <div className="p-5">
              <ul className="space-y-3">
                <li className="flex items-center text-sm">
                  <span className="w-20 text-gray-500">Data:</span>
                  <span className="font-medium text-gray-800">{plan.data}</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="w-20 text-gray-500">Calls:</span>
                  <span className="font-medium text-gray-800">{plan.calls}</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="w-20 text-gray-500">Texts:</span>
                  <span className="font-medium text-gray-800">{plan.texts}</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="w-20 text-gray-500">Duration:</span>
                  <span className="font-medium text-gray-800">{plan.duration} days</span>
                </li>
              </ul>
              
              <div className="mt-5">
                <button className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Edit Plan
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredPlans.length === 0 && (
          <div className="col-span-full py-10 text-center text-gray-500">
            {searchQuery 
              ? `No plans found matching "${searchQuery}"`
              : 'No plans available yet.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanList;