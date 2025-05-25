import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { format, subDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const SalesChart: React.FC = () => {
  const { sales } = useApp();
  
  // Calculate revenue for the last 7 days - memoized for performance
  const revenueTrend = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      const dailyRevenue = sales
        .filter(sale => format(sale.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
        .reduce((sum, sale) => sum + sale.amount, 0);
      
      return {
        day: format(date, 'EEE'),
        revenue: dailyRevenue
      };
    });
  }, [sales]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-xl shadow-sm h-full hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex justify-between items-center mb-6">
        <motion.h3
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-semibold text-gray-800"
        >
          Revenue Trend
        </motion.h3>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-gray-500"
        >
          Last 7 days
        </motion.div>
      </div>
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="h-64"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              width={80}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                padding: '12px'
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
            />
            <Bar
              dataKey="revenue"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
};

export default SalesChart;