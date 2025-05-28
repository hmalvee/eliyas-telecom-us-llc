import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import StatCard from '../components/dashboard/StatCard';
import SalesChart from '../components/dashboard/SalesChart';
import ExpiringSoonPlans from '../components/dashboard/ExpiringSoonPlans';
import RecentSales from '../components/dashboard/RecentSales';
import { Users, Package, BellRing, DollarSign } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { dashboardStats } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Simulate data loading
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Add a small delay to prevent flickering
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsLoading(false);
    };

    loadData();

    // Set up auto-refresh interval (every 5 minutes)
    const refreshInterval = setInterval(loadData, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title="Total Customers" 
          value={dashboardStats.totalCustomers} 
          icon={<Users size={20} />}
          change={8}
          changeText="vs last month"
          color="blue"
          isLoading={isLoading}
        />
        
        <StatCard 
          title="Active Plans" 
          value={dashboardStats.activePlans} 
          icon={<Package size={20} />}
          change={4}
          changeText="vs last month"
          color="green"
          isLoading={isLoading}
        />
        
        <StatCard 
          title="Plans Expiring Soon" 
          value={dashboardStats.expiringSoon} 
          icon={<BellRing size={20} />}
          color="orange"
          isLoading={isLoading}
        />
        
        <StatCard 
          title="Today's Revenue" 
          value={formatCurrency(dashboardStats.revenueToday)} 
          icon={<DollarSign size={20} />}
          change={12}
          changeText="vs yesterday"
          color="purple"
          isLoading={isLoading}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart />
        <ExpiringSoonPlans />
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <RecentSales />
      </div>
    </div>
  );
};

export default Dashboard;