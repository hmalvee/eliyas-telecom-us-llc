import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  changeText?: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  change,
  changeText,
  color,
  isLoading = false
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
      changePositive: 'text-green-600 bg-green-50',
      changeNegative: 'text-red-600 bg-red-50'
    },
    green: {
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconText: 'text-green-600',
      changePositive: 'text-green-600 bg-green-50',
      changeNegative: 'text-red-600 bg-red-50'
    },
    purple: {
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconText: 'text-purple-600',
      changePositive: 'text-green-600 bg-green-50',
      changeNegative: 'text-red-600 bg-red-50'
    },
    orange: {
      bg: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      iconText: 'text-orange-600',
      changePositive: 'text-green-600 bg-green-50',
      changeNegative: 'text-red-600 bg-red-50'
    }
  };

  const classes = colorClasses[color];

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`${classes.bg} rounded-xl p-5 h-full`}
      >
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className={`${classes.iconBg} p-2 rounded-lg w-10 h-10`} />
            <div className="h-6 w-20 bg-gray-200 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-8 w-32 bg-gray-200 rounded" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className={`${classes.bg} rounded-xl p-5 h-full transform transition-all duration-200 hover:shadow-lg`}
    >
      <div className="flex items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`${classes.iconBg} p-2 rounded-lg ${classes.iconText}`}
        >
          {icon}
        </motion.div>
        
        <div className="ml-auto">
          {change !== undefined && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                change >= 0 ? classes.changePositive : classes.changeNegative
              }`}
            >
              {change >= 0 ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
              {Math.abs(change)}% {changeText || ''}
            </motion.div>
          )}
        </div>
      </div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-4"
      >
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-gray-900 text-2xl font-semibold mt-1">{value}</p>
      </motion.div>
    </motion.div>
  );
};

export default StatCard;