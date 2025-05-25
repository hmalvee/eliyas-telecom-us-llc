import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { 
  customers as initialCustomers,
  plans as initialPlans,
  customerPlans as initialCustomerPlans,
  sales as initialSales,
  invoices as initialInvoices,
  dashboardStats as initialDashboardStats
} from '../data/mockData';
import { 
  Customer, 
  Plan, 
  CustomerPlan, 
  Sale, 
  Invoice, 
  DashboardStats 
} from '../types';

interface AppContextType {
  customers: Customer[];
  plans: Plan[];
  customerPlans: CustomerPlan[];
  sales: Sale[];
  invoices: Invoice[];
  dashboardStats: DashboardStats;
  addCustomer: (customer: Omit<Customer, 'id' | 'joinDate'>) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  addSale: (sale: Omit<Sale, 'id' | 'amountPaid' | 'status'>) => Sale;
  updateSale: (sale: Sale) => void;
  deleteSale: (id: string) => void;
  generateInvoice: (sale: Sale) => void;
  addCustomerPlan: (customerPlan: Omit<CustomerPlan, 'id'>) => void;
  updateCustomerPlan: (customerPlan: CustomerPlan) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [plans] = useState<Plan[]>(initialPlans);
  const [customerPlans, setCustomerPlans] = useState<CustomerPlan[]>(initialCustomerPlans);
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(initialDashboardStats);

  // Add a new customer
  const addCustomer = (customer: Omit<Customer, 'id' | 'joinDate'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: `cust${customers.length + 1}`,
      joinDate: new Date(),
    };
    setCustomers([...customers, newCustomer]);
    
    // Update dashboard stats
    setDashboardStats({
      ...dashboardStats,
      totalCustomers: dashboardStats.totalCustomers + 1
    });

    toast.success('Customer added successfully');
  };

  // Update an existing customer
  const updateCustomer = (customer: Customer) => {
    setCustomers(customers.map(c => c.id === customer.id ? customer : c));
    toast.success('Customer updated successfully');
  };

  // Delete a customer
  const deleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
    
    // Update dashboard stats
    setDashboardStats({
      ...dashboardStats,
      totalCustomers: dashboardStats.totalCustomers - 1
    });

    toast.success('Customer deleted successfully');
  };

  // Add a new sale
  const addSale = (saleData: Omit<Sale, 'id' | 'amountPaid' | 'status'>) => {
    const newSale: Sale = {
      ...saleData,
      id: `sale${sales.length + 1}`,
      amountPaid: 0,
      status: 'unpaid'
    };
    setSales([...sales, newSale]);
    
    // Update dashboard stats
    setDashboardStats({
      ...dashboardStats,
      totalSales: dashboardStats.totalSales + 1,
      revenueToday: saleData.date.toDateString() === new Date().toDateString() 
        ? dashboardStats.revenueToday + saleData.amount 
        : dashboardStats.revenueToday
    });

    toast.success('Sale created successfully');
    return newSale;
  };

  // Update a sale
  const updateSale = (sale: Sale) => {
    setSales(sales.map(s => s.id === sale.id ? sale : s));
    toast.success('Sale updated successfully');
  };

  // Delete a sale
  const deleteSale = (id: string) => {
    setSales(sales.filter(s => s.id !== id));
    toast.success('Sale deleted successfully');
  };

  // Generate an invoice from a sale
  const generateInvoice = (sale: Sale) => {
    const plan = plans.find(p => p.id === sale.planId);
    if (!plan) return;
    
    const dueDate = new Date(sale.date);
    dueDate.setDate(dueDate.getDate() + 14); // Due in 14 days
    
    const newInvoice: Invoice = {
      id: `inv${invoices.length + 1}`,
      customerId: sale.customerId,
      saleId: sale.id,
      date: sale.date,
      dueDate,
      items: [
        {
          id: `item${Math.random().toString(36).substring(7)}`,
          description: `${plan.name} - Monthly Subscription`,
          quantity: 1,
          unitPrice: plan.price,
          total: plan.price
        }
      ],
      subtotal: plan.price,
      tax: Number((plan.price * 0.09).toFixed(2)),
      total: Number((plan.price * 1.09).toFixed(2)),
      status: 'unpaid'
    };
    
    setInvoices([...invoices, newInvoice]);
    toast.success('Invoice generated successfully');
  };

  // Add a customer plan
  const addCustomerPlan = (customerPlan: Omit<CustomerPlan, 'id'>) => {
    const newCustomerPlan: CustomerPlan = {
      ...customerPlan,
      id: `cp${customerPlans.length + 1}`,
    };
    setCustomerPlans([...customerPlans, newCustomerPlan]);
    
    // Update dashboard stats
    if (newCustomerPlan.status === 'active') {
      setDashboardStats({
        ...dashboardStats,
        activePlans: dashboardStats.activePlans + 1
      });
    }

    toast.success('Plan assigned successfully');
  };

  // Update a customer plan
  const updateCustomerPlan = (customerPlan: CustomerPlan) => {
    const oldPlan = customerPlans.find(cp => cp.id === customerPlan.id);
    setCustomerPlans(customerPlans.map(cp => cp.id === customerPlan.id ? customerPlan : cp));
    
    // Update dashboard stats if status changed
    if (oldPlan && oldPlan.status !== customerPlan.status) {
      if (customerPlan.status === 'active') {
        setDashboardStats({
          ...dashboardStats,
          activePlans: dashboardStats.activePlans + 1
        });
      } else if (oldPlan.status === 'active') {
        setDashboardStats({
          ...dashboardStats,
          activePlans: dashboardStats.activePlans - 1
        });
      }
    }

    toast.success('Plan updated successfully');
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