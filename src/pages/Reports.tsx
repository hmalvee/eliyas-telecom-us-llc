import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

const Reports: React.FC = () => {
  const { sales, customers, plans } = useApp();
  const [reportType, setReportType] = useState<'sales' | 'customers' | 'plans'>('sales');
  
  // Prepare data for sales report
  const salesData = eachDayOfInterval({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  }).map(date => {
    const dayTotal = sales
      .filter(sale => format(sale.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
      .reduce((sum, sale) => sum + sale.amount, 0);
    
    return {
      date: format(date, 'MMM dd'),
      amount: dayTotal
    };
  });

  // Prepare data for customer plans
  const planData = plans.map(plan => {
    const count = customers.filter(customer => 
      sales.some(sale => sale.customerId === customer.id && sale.planId === plan.id)
    ).length;
    
    return {
      name: plan.name,
      customers: count
    };
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Reports</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setReportType('sales')}
              className={`px-4 py-2 rounded-md ${
                reportType === 'sales' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Sales
            </button>
            <button
              onClick={() => setReportType('plans')}
              className={`px-4 py-2 rounded-md ${
                reportType === 'plans' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Plans
            </button>
          </div>
        </div>

        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            {reportType === 'sales' ? (
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#3b82f6" />
              </BarChart>
            ) : (
              <BarChart data={planData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="customers" fill="#3b82f6" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Customers</span>
              <span className="font-semibold">{customers.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Sales</span>
              <span className="font-semibold">
                ${sales.reduce((sum, sale) => sum + sale.amount, 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Sale</span>
              <span className="font-semibold">
                ${(sales.reduce((sum, sale) => sum + sale.amount, 0) / sales.length).toFixed(2)}
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
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Export Plan Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;