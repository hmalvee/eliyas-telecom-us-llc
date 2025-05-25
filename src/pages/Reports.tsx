import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, isWithinInterval } from 'date-fns';
import { TrendingUp, TrendingDown, DollarSign, Users, Package, Plane } from 'lucide-react';

const Reports: React.FC = () => {
  const { sales, customers } = useApp();
  const [businessType, setBusinessType] = useState<'all' | 'telecom' | 'travel'>('all');
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | '1y'>('1m');
  
  // Get date range based on selected time range
  const getDateRange = () => {
    const end = new Date();
    const start = subMonths(end, timeRange === '1m' ? 1 : timeRange === '3m' ? 3 : timeRange === '6m' ? 6 : 12);
    return { start, end };
  };

  // Filter sales by business type and date range
  const filteredSales = useMemo(() => {
    const dateRange = getDateRange();
    return sales.filter(sale => 
      (businessType === 'all' || 
        (businessType === 'telecom' ? sale.businessType?.startsWith('telecom_') : sale.businessType?.startsWith('travel_'))) &&
      isWithinInterval(sale.date, dateRange)
    );
  }, [sales, businessType, timeRange]);

  // Prepare data for revenue and profit trends
  const trendsData = useMemo(() => {
    const { start, end } = getDateRange();
    return eachDayOfInterval({ start, end }).map(date => {
      const daySales = filteredSales.filter(sale => 
        format(sale.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      
      return {
        date: format(date, 'MMM dd'),
        revenue: daySales.reduce((sum, sale) => sum + sale.amount, 0),
        profit: daySales.reduce((sum, sale) => sum + (sale.profit || 0), 0)
      };
    });
  }, [filteredSales]);

  // Calculate business metrics
  const metrics = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.amount, 0);
    const totalProfit = filteredSales.reduce((sum, sale) => sum + (sale.profit || 0), 0);
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    
    // Calculate growth rates
    const previousPeriodSales = sales.filter(sale => {
      const { start, end } = getDateRange();
      const previousStart = subMonths(start, timeRange === '1m' ? 1 : timeRange === '3m' ? 3 : timeRange === '6m' ? 6 : 12);
      return isWithinInterval(sale.date, { start: previousStart, end: start });
    });
    
    const previousRevenue = previousPeriodSales.reduce((sum, sale) => sum + sale.amount, 0);
    const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    
    // Calculate service type distribution
    const serviceDistribution = filteredSales.reduce((acc, sale) => {
      const type = sale.businessType || 'other';
      acc[type] = (acc[type] || 0) + sale.amount;
      return acc;
    }, {} as Record<string, number>);

    // Customer metrics
    const uniqueCustomers = new Set(filteredSales.map(sale => sale.customerId)).size;
    const averageOrderValue = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;
    
    return {
      totalSales: filteredSales.length,
      totalRevenue,
      totalProfit,
      profitMargin,
      revenueGrowth,
      serviceDistribution,
      uniqueCustomers,
      averageOrderValue
    };
  }, [filteredSales, sales, timeRange]);

  // Prepare data for service distribution chart
  const serviceDistributionData = useMemo(() => {
    return Object.entries(metrics.serviceDistribution).map(([type, amount]) => ({
      name: type.replace('_', ' ').replace(/^\w/, c => c.toUpperCase()),
      value: amount
    }));
  }, [metrics.serviceDistribution]);

  const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setBusinessType('all')}
              className={`px-4 py-2 rounded-md transition-colors ${
                businessType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setBusinessType('telecom')}
              className={`px-4 py-2 rounded-md transition-colors ${
                businessType === 'telecom' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Eliyas Telecom
            </button>
            <button
              onClick={() => setBusinessType('travel')}
              className={`px-4 py-2 rounded-md transition-colors ${
                businessType === 'travel' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              USA Tours & Travels
            </button>
          </div>
          
          <div className="flex space-x-2">
            {(['1m', '3m', '6m', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  timeRange === range ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-semibold">${metrics.totalRevenue.toFixed(2)}</p>
            </div>
            <div className={`p-3 rounded-full ${metrics.revenueGrowth >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {metrics.revenueGrowth >= 0 ? (
                <TrendingUp className="w-6 h-6 text-green-600" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-600" />
              )}
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-sm ${metrics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.revenueGrowth.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500"> vs previous period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Profit</p>
              <p className="text-2xl font-semibold text-green-600">${metrics.totalProfit.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600">{metrics.profitMargin.toFixed(1)}%</span>
            <span className="text-sm text-gray-500"> profit margin</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Unique Customers</p>
              <p className="text-2xl font-semibold">{metrics.uniqueCustomers}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500">
              Avg. order ${metrics.averageOrderValue.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-semibold">{metrics.totalSales}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500">
              In selected period
            </span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Profit Trends */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue & Profit Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="profit" name="Profit" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {serviceDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Export & Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Export Detailed Sales Report
          </button>
          <button className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Export Customer Analytics
          </button>
          <button className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Export Financial Summary
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;