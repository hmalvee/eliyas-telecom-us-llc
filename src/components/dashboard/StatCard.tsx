import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  changeText?: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  change,
  changeText,
  color
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

  return (
    <div className={`${classes.bg} rounded-xl p-5 h-full`}>
      <div className="flex items-center">
        <div className={`${classes.iconBg} p-2 rounded-lg ${classes.iconText}`}>
          {icon}
        </div>
        
        <div className="ml-auto">
          {change !== undefined && (
            <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              change >= 0 ? classes.changePositive : classes.changeNegative
            }`}>
              {change >= 0 ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
              {Math.abs(change)}% {changeText || ''}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-gray-900 text-2xl font-semibold mt-1">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;