import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Calendar, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ExpiringSoonPlans: React.FC = () => {
  const { customerPlans, customers, plans } = useApp();
  
  // Get current date
  const today = new Date();
  
  // Find plans expiring in the next 7 days
  const expiringSoonList = customerPlans.filter(plan => {
    const daysUntilExpiry = Math.floor((plan.endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return plan.status === 'active' && daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
  });
  
  // Sort by expiration date (ascending)
  expiringSoonList.sort((a, b) => a.endDate.getTime() - b.endDate.getTime());
  
  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };
  
  // Calculate days until expiry
  const getDaysUntilExpiry = (endDate: Date) => {
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-xl shadow-sm h-full hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <motion.h3
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-semibold text-gray-800"
        >
          Plans Expiring Soon
        </motion.h3>
        <motion.span
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded"
        >
          {expiringSoonList.length} plans
        </motion.span>
      </div>
      
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4 max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
      >
        {expiringSoonList.length > 0 ? (
          expiringSoonList.map(plan => {
            const customer = customers.find(c => c.id === plan.customerId);
            const planDetails = plans.find(p => p.id === plan.planId);
            const daysLeft = getDaysUntilExpiry(plan.endDate);
            
            return (
              <motion.div
                key={plan.id}
                variants={item}
                className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium">
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
              </motion.div>
            );
          })
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-6"
          >
            <p className="text-gray-500">No plans expiring soon</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ExpiringSoonPlans;