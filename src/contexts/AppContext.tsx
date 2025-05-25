import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { 
  Customer, 
  Plan, 
  CustomerPlan, 
  Sale, 
  Invoice, 
  DashboardStats 
} from '../types';
import { customers as initialCustomers, plans as initialPlans, customerPlans as initialCustomerPlans, sales as initialSales, invoices as initialInvoices, dashboardStats as initialDashboardStats } from '../data/mockData';

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
  addSale: (sale: Omit<Sale, 'id' | 'amountPaid' | 'status'>) => Promise<Sale>;
  updateSale: (sale: Sale) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  generateInvoice: (sale: Sale) => Promise<void>;
  addCustomerPlan: (customerPlan: Omit<CustomerPlan, 'id'>) => Promise<void>;
  updateCustomerPlan: (customerPlan: CustomerPlan) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [customerPlans, setCustomerPlans] = useState<CustomerPlan[]>(initialCustomerPlans);
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(initialDashboardStats);

  // Add a new customer
  const addCustomer = async (customer: Omit<Customer, 'id' | 'joinDate'>) => {
    try {
      const newCustomer: Customer = {
        ...customer,
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

  // Update an existing customer
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

  // Delete a customer
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

  // Add a new sale
  const addSale = async (saleData: Omit<Sale, 'id' | 'amountPaid' | 'status'>): Promise<Sale> => {
    try {
      const newSale: Sale = {
        ...saleData,
        id: Math.random().toString(36).substr(2, 9),
        amountPaid: 0,
        status: 'unpaid'
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

  // Update a sale
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

  // Delete a sale
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

  // Generate an invoice from a sale
  const generateInvoice = async (sale: Sale) => {
    try {
      const plan = plans.find(p => p.id === sale.planId);
      if (!plan) throw new Error('Plan not found');

      const dueDate = new Date(sale.date);
      dueDate.setDate(dueDate.getDate() + 14);

      const newInvoice: Invoice = {
        id: Math.random().toString(36).substr(2, 9),
        customerId: sale.customerId,
        saleId: sale.id,
        date: sale.date,
        dueDate: dueDate,
        items: [{
          id: Math.random().toString(36).substr(2, 9),
          description: `${plan.name} - Monthly Subscription`,
          quantity: 1,
          unitPrice: plan.price,
          total: plan.price
        }],
        subtotal: plan.price,
        tax: Number((plan.price * 0.09).toFixed(2)),
        total: Number((plan.price * 1.09).toFixed(2)),
        status: 'unpaid'
      };

      setInvoices(prev => [...prev, newInvoice]);
      toast.success('Invoice generated successfully');
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Failed to generate invoice');
      throw error;
    }
  };

  // Add a customer plan
  const addCustomerPlan = async (customerPlan: Omit<CustomerPlan, 'id'>) => {
    try {
      const newCustomerPlan: CustomerPlan = {
        ...customerPlan,
        id: Math.random().toString(36).substr(2, 9)
      };
      setCustomerPlans(prev => [...prev, newCustomerPlan]);
      toast.success('Plan assigned successfully');
    } catch (error) {
      console.error('Error adding customer plan:', error);
      toast.error('Failed to assign plan');
      throw error;
    }
  };

  // Update a customer plan
  const updateCustomerPlan = async (customerPlan: CustomerPlan) => {
    try {
      setCustomerPlans(prev => prev.map(cp => cp.id === customerPlan.id ? customerPlan : cp));
      toast.success('Plan updated successfully');
    } catch (error) {
      console.error('Error updating customer plan:', error);
      toast.error('Failed to update plan');
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{
      customers,
      plans,
      customerPlans,
      sales,
      invoices,
      dashboardStats,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addSale,
      updateSale,
      deleteSale,
      generateInvoice,
      addCustomerPlan,
      updateCustomerPlan,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};