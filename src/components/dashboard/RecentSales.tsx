import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Clock } from 'lucide-react';

const RecentSales: React.FC = () => {
  const { sales, customers, plans } = useApp();
  
  // Get the most recent 5 sales
  const recentSales = [...sales]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);
  
  // Format date relative to now
  const formatRelativeDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return new Intl.DateTimeFormat('en-US', { 
        month: 'short', 
        day: 'numeric'
      }).format(date);
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Recent Sales</h3>
        <a href="/sales" className="text-sm text-blue-600 hover:underline">View all</a>
      </div>
      
      <div className="space-y-4">
        {recentSales.map(sale => {
          const customer = customers.find(c => c.id === sale.customerId);
          const plan = plans.find(p => p.id === sale.planId);
          
          return (
            <div key={sale.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    {customer?.name.charAt(0)}
                  </div>
                </div>
                
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{customer?.name}</p>
                  <p className="text-xs text-gray-500">{plan?.name}</p>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <p className="text-sm font-semibold">{formatCurrency(sale.amount)}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock size={12} className="mr-1" />
                  {formatRelativeDate(sale.date)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentSales;