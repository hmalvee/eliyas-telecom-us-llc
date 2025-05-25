import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { format, subDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SalesChart: React.FC = () => {
  const { sales } = useApp();
  
  // Calculate revenue for the last 7 days
  const today = new Date();
  const revenueTrend = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i);
    const dailyRevenue = sales
      .filter(sale => format(sale.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
      .reduce((sum, sale) => sum + sale.amount, 0);
    
    return {
      day: format(date, 'EEE'),
      revenue: dailyRevenue
    };
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Revenue Trend</h3>
        <div className="text-sm text-gray-500">Last 7 days</div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
            />
            <Bar dataKey="revenue" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;