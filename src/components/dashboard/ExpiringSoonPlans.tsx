import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Calendar, AlertCircle } from 'lucide-react';

const ExpiringSoonPlans: React.FC = () => {
  const { customerPlans, customers, plans } = useApp();
  
  // Get current date
  const today = new Date();
  
  // Find plans expiring in the next 7 days
  const expiringSoonList = customerPlans.filter(plan => {
    const endDate = new Date(plan.endDate);
    const daysUntilExpiry = Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return plan.status === 'active' && daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
  });
  
  // Sort by expiration date (ascending)
  expiringSoonList.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
  
  // Format date
  const formatDate = (date: Date | string) => {
    const dateObj = new Date(date);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(dateObj);
  };
  
  // Calculate days until expiry
  const getDaysUntilExpiry = (endDate: Date | string) => {
    const endDateTime = new Date(endDate).getTime();
    const diffTime = endDateTime - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Plans Expiring Soon</h3>
        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
          {expiringSoonList.length} plans
        </span>
      </div>
      
      <div className="space-y-4 max-h-[320px] overflow-y-auto">
        {expiringSoonList.length > 0 ? (
          expiringSoonList.map(plan => {
            const customer = customers.find(c => c.id === plan.customerId);
            const planDetails = plans.find(p => p.id === plan.planId);
            const daysLeft = getDaysUntilExpiry(plan.endDate);
            
            return (
              <div key={plan.id} className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    {customer?.name.charAt(0)}
                  </div>
                </div>
                
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">{customer?.name}</p>
                  <p className="text-xs text-gray-500">{planDetails?.name}</p>
                </div>
                
                <div className="flex items-center">
                  <Calendar size={14} className="text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500">{formatDate(plan.endDate)}</span>
                </div>
                
                <div className="ml-4">
                  <span className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                    daysLeft <= 2 
                      ? 'bg-red-100 text-red-700' 
                      : daysLeft <= 5 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'bg-blue-100 text-blue-700'
                  }`}>
                    <AlertCircle size={12} className="mr-1" />
                    {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">No plans expiring soon</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpiringSoonPlans;