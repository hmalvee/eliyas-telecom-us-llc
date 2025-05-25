import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

const Reports: React.FC = () => {
  const { sales } = useApp();
  const [businessType, setBusinessType] = useState<'all' | 'telecom' | 'travel'>('all');
  
  // Filter sales by business type
  const filteredSales = useMemo(() => {
    if (businessType === 'all') return sales;
    return sales.filter(sale => 
      businessType === 'telecom' 
        ? sale.businessType?.startsWith('telecom_')
        : sale.businessType?.startsWith('travel_')
    );
  }, [sales, businessType]);

  // Prepare data for sales report
  const salesData = eachDayOfInterval({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  }).map(date => {
    const daySales = filteredSales.filter(sale => 
      format(sale.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    
    return {
      date: format(date, 'MMM dd'),
      revenue: daySales.reduce((sum, sale) => sum + sale.amount, 0),
      profit: daySales.reduce((sum, sale) => sum + (sale.profit || 0), 0)
    };
  });

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.amount, 0);
    const totalProfit = filteredSales.reduce((sum, sale) => sum + (sale.profit || 0), 0);
    const averageSale = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return {
      totalSales: filteredSales.length,
      totalRevenue,
      totalProfit,
      averageSale,
      profitMargin
    };
  }, [filteredSales]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Sales Report</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setBusinessType('all')}
              className={`px-4 py-2 rounded-md ${
                businessType === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setBusinessType('telecom')}
              className={`px-4 py-2 rounded-md ${
                businessType === 'telecom' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Eliyas Telecom
            </button>
            <button
              onClick={() => setBusinessType('travel')}
              className={`px-4 py-2 rounded-md ${
                businessType === 'travel' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              USA Tours & Travels
            </button>
          </div>
        </div>

        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" />
              <Bar dataKey="profit" name="Profit" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Sales</span>
              <span className="font-semibold">{summary.totalSales}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Revenue</span>
              <span className="font-semibold">
                ${summary.totalRevenue.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Profit</span>
              <span className="font-semibold text-green-600">
                ${summary.totalProfit.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Sale</span>
              <span className="font-semibold">
                ${summary.averageSale.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Profit Margin</span>
              <span className="font-semibold text-green-600">
                {summary.profitMargin.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Export Options</h3>
          <div className="space-y-4">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Export Sales Report
            </button>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Export Customer Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;