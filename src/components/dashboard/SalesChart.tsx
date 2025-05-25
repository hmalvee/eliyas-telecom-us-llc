import React from 'react';
import { useApp } from '../../contexts/AppContext';

const SalesChart: React.FC = () => {
  const { dashboardStats } = useApp();
  const { revenueTrend } = dashboardStats;
  
  // Find the maximum value to scale the chart properly
  const maxValue = Math.max(...revenueTrend, 100);
  
  // Get day names for the last 7 days
  const getDayLabels = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const result = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      result.push(days[date.getDay()]);
    }
    
    return result;
  };
  
  const dayLabels = getDayLabels();
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Revenue Trend</h3>
        <div className="text-sm text-gray-500">Last 7 days</div>
      </div>
      
      <div className="h-64">
        <div className="flex h-full items-end space-x-2">
          {revenueTrend.map((value, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="w-full bg-blue-100 hover:bg-blue-200 rounded-t transition-all duration-300 relative group"
                style={{ height: `${Math.max((value / maxValue) * 100, 5)}%` }}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  ${value.toFixed(2)}
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">{dayLabels[index]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesChart;