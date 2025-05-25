import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subDays, isWithinInterval, parseISO } from 'date-fns';
import { TrendingUp, TrendingDown, DollarSign, Users, Package, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { PDFReport } from '../components/reports/PDFReport';

const Reports: React.FC = () => {
  const { sales, customers } = useApp();
  const [businessType, setBusinessType] = useState<'all' | 'telecom' | 'travel'>('all');
  const [timeRange, setTimeRange] = useState<'1d' | '7d' | '30d' | '90d'>('30d');
  const [customDateRange, setCustomDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [isCustomDate, setIsCustomDate] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Force update when date range changes
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [customDateRange, timeRange, isCustomDate]);

  // Get date range based on selected time range or custom dates
  const getDateRange = () => {
    if (isCustomDate && customDateRange.start && customDateRange.end) {
      return {
        start: parseISO(customDateRange.start),
        end: parseISO(customDateRange.end)
      };
    }

    const end = new Date();
    const start = subDays(end, 
      timeRange === '1d' ? 1 : 
      timeRange === '7d' ? 7 : 
      timeRange === '30d' ? 30 : 
      90
    );
    return { start, end };
  };

  // Filter sales by business type and date range
  const filteredSales = useMemo(() => {
    const dateRange = getDateRange();
    return sales.filter(sale => {
      const matchesBusinessType = businessType === 'all' || 
        (businessType === 'telecom' ? sale.businessType?.startsWith('telecom_') : sale.businessType?.startsWith('travel_'));
      
      const matchesDateRange = isWithinInterval(sale.date, {
        start: dateRange.start,
        end: new Date(dateRange.end.getTime() + 24 * 60 * 60 * 1000) // Include end date
      });

      return matchesBusinessType && matchesDateRange;
    });
  }, [sales, businessType, timeRange, customDateRange, isCustomDate, forceUpdate]);

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
      const previousStart = subDays(start, 
        timeRange === '1d' ? 1 : 
        timeRange === '7d' ? 7 : 
        timeRange === '30d' ? 30 : 
        90
      );
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
    <AnimatePresence>
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        key={forceUpdate}
      >
        {/* Filters */}
        <motion.div 
          className="bg-white rounded-xl shadow-sm p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col space-y-4">
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
                {(['1d', '7d', '30d', '90d'] as const).map((range) => (
                  <motion.button
                    key={range}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setTimeRange(range);
                      setIsCustomDate(false);
                    }}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      timeRange === range && !isCustomDate ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {range.toUpperCase()}
                  </motion.button>
                ))}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCustomDate(true)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    isCustomDate ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Calendar size={20} />
                </motion.button>
              </div>
            </div>

            {/* Custom Date Range */}
            {isCustomDate && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex space-x-4"
              >
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </motion.div>
            )}
          </div>
        </motion.div>

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
        <motion.div 
          className="bg-white rounded-xl shadow-sm p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Export & Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PDFDownloadLink
              document={
                <PDFReport
                  data={{
                    businessType: businessType === 'all' ? 'All Business' : 
                              businessType === 'telecom' ? 'Eliyas Telecom' : 
                              'USA Tours & Travels',
                    timeRange,
                    metrics,
                    dateRange: getDateRange()
                  }}
                />
              }
              fileName={`business-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`}
            >
              {({ loading }) => (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {loading ? 'Generating Report...' : 'Export Detailed Report'}
                </motion.button>
              )}
            </PDFDownloadLink>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Export Customer Analytics
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Export Financial Summary
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Reports;