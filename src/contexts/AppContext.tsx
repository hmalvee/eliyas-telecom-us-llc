import React, { createContext, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { Customer, Plan, CustomerPlan, Sale, Invoice, DashboardStats } from '../types';
import { customers, plans, customerPlans, sales, invoices } from '../data/mockData';

interface AppContextType {
  customers: Customer[];
  plans: Plan[];
  customerPlans: CustomerPlan[];
  sales: Sale[];
  invoices: Invoice[];
  dashboardStats: DashboardStats;
  addCustomer: (customer: Omit<Customer, 'id' | 'joinDate'>) => Promise<void>;
  updateCustomer: (customer: Customer) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addSale: (sale: Omit<Sale, 'id' | 'invoiceNumber'>) => Promise<Sale>;
  updateSale: (sale: Sale) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  addPayment: (payment: { saleId: string; amount: number; date: Date; method: 'cash' | 'card' | 'online'; notes?: string }) => Promise<void>;
  updateInvoice: (invoice: Invoice) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [customersList, setCustomers] = useState<Customer[]>(customers);
  const [plansList, setPlans] = useState<Plan[]>(plans);
  const [customerPlansList, setCustomerPlans] = useState<CustomerPlan[]>(customerPlans);
  const [salesList, setSales] = useState<Sale[]>(sales);
  const [invoicesList, setInvoices] = useState<Invoice[]>(invoices);

  // Calculate dashboard stats
  const calculateDashboardStats = (): DashboardStats => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayRevenue = salesList
      .filter(sale => {
        const saleDate = new Date(sale.date);
        saleDate.setHours(0, 0, 0, 0);
        return saleDate.getTime() === today.getTime();
      })
      .reduce((sum, sale) => sum + sale.amount, 0);

    const activePlansCount = customerPlansList.filter(plan => plan.status === 'active').length;

    const expiringSoon = customerPlansList.filter(plan => {
      const daysUntilExpiry = Math.floor((plan.endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return plan.status === 'active' && daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
    }).length;

    return {
      totalCustomers: customersList.length,
      activePlans: activePlansCount,
      expiringSoon,
      revenueToday: todayRevenue,
      revenueTrend: Array(7).fill(0) // Placeholder for revenue trend
    };
  };

  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(calculateDashboardStats());

  // Update dashboard stats whenever relevant data changes
  React.useEffect(() => {
    setDashboardStats(calculateDashboardStats());
  }, [customersList, customerPlansList, salesList]);

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'joinDate'>) => {
    try {
      const newCustomer: Customer = {
        ...customerData,
        id: Math.random().toString(36).substr(2, 9),
        joinDate: new Date()
      };
      setCustomers(prev => [...prev, newCustomer]);
      toast.success('Customer added successfully');
    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error('Failed to add customer');
      throw error;
    }
  };

  const updateCustomer = async (customer: Customer) => {
    try {
      setCustomers(prev => prev.map(c => c.id === customer.id ? customer : c));
      toast.success('Customer updated successfully');
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Failed to update customer');
      throw error;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      setCustomers(prev => prev.filter(c => c.id !== id));
      toast.success('Customer deleted successfully');
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
      throw error;
    }
  };

  const addSale = async (saleData: Omit<Sale, 'id' | 'invoiceNumber'>): Promise<Sale> => {
    try {
      const newSale: Sale = {
        ...saleData,
        id: Math.random().toString(36).substr(2, 9),
        invoiceNumber: `INV-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      };
      setSales(prev => [...prev, newSale]);
      toast.success('Sale created successfully');
      return newSale;
    } catch (error) {
      console.error('Error adding sale:', error);
      toast.error('Failed to create sale');
      throw error;
    }
  };

  const updateSale = async (sale: Sale) => {
    try {
      setSales(prev => prev.map(s => s.id === sale.id ? sale : s));
      toast.success('Sale updated successfully');
    } catch (error) {
      console.error('Error updating sale:', error);
      toast.error('Failed to update sale');
      throw error;
    }
  };

  const deleteSale = async (id: string) => {
    try {
      setSales(prev => prev.filter(s => s.id !== id));
      toast.success('Sale deleted successfully');
    } catch (error) {
      console.error('Error deleting sale:', error);
      toast.error('Failed to delete sale');
      throw error;
    }
  };

  const addPayment = async (payment: { saleId: string; amount: number; date: Date; method: 'cash' | 'card' | 'online'; notes?: string }) => {
    try {
      setSales(prev => prev.map(sale => {
        if (sale.id === payment.saleId) {
          const newAmountPaid = sale.amountPaid + payment.amount;
          return {
            ...sale,
            amountPaid: newAmountPaid,
            paymentStatus: newAmountPaid >= sale.amount ? 'paid' : newAmountPaid > 0 ? 'partial' : 'unpaid'
          };
        }
        return sale;
      }));
      toast.success('Payment recorded successfully');
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
      throw error;
    }
  };

  const updateInvoice = async (invoice: Invoice) => {
    try {
      setInvoices(prev => prev.map(i => i.id === invoice.id ? invoice : i));
      toast.success('Invoice updated successfully');
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error('Failed to update invoice');
      throw error;
    }
  };

  const value = {
    customers: customersList,
    plans: plansList,
    customerPlans: customerPlansList,
    sales: salesList,
    invoices: invoicesList,
    dashboardStats,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addSale,
    updateSale,
    deleteSale,
    addPayment,
    updateInvoice,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}