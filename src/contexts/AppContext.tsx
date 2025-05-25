import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { 
  Customer, 
  CustomerNumber,
  Plan, 
  CustomerPlan, 
  Sale, 
  Invoice, 
  DashboardStats 
} from '../types';
import { customers as initialCustomers, plans as initialPlans, customerPlans as initialCustomerPlans, sales as initialSales, invoices as initialInvoices, dashboardStats as initialDashboardStats } from '../data/mockData';

interface Payment {
  saleId: string;
  amount: number;
  date: Date;
  method: 'cash' | 'card' | 'online';
  notes?: string;
}

interface AppContextType {
  customers: Customer[];
  customerNumbers: CustomerNumber[];
  plans: Plan[];
  customerPlans: CustomerPlan[];
  sales: Sale[];
  invoices: Invoice[];
  dashboardStats: DashboardStats;
  addCustomer: (customer: Omit<Customer, 'id' | 'joinDate'>) => Promise<void>;
  updateCustomer: (customer: Customer) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addCustomerNumber: (number: Omit<CustomerNumber, 'id'>) => Promise<void>;
  deleteCustomerNumber: (id: string) => Promise<void>;
  addSale: (sale: Omit<Sale, 'id' | 'amountPaid' | 'status'>) => Promise<Sale>;
  updateSale: (sale: Sale) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  generateInvoice: (sale: Sale) => Promise<void>;
  addCustomerPlan: (customerPlan: Omit<CustomerPlan, 'id'>) => Promise<void>;
  updateCustomerPlan: (customerPlan: CustomerPlan) => Promise<void>;
  addPayment: (payment: Payment) => Promise<void>;
  updateCustomerNumber: (number: CustomerNumber) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  updateInvoice: (invoice: Invoice) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [customerNumbers, setCustomerNumbers] = useState<CustomerNumber[]>([]);
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

  // Add a new customer number
  const addCustomerNumber = async (number: Omit<CustomerNumber, 'id'>) => {
    try {
      const newNumber: CustomerNumber = {
        ...number,
        id: Math.random().toString(36).substr(2, 9)
      };
      setCustomerNumbers(prev => [...prev, newNumber]);
      toast.success('Phone number added successfully');
    } catch (error) {
      console.error('Error adding phone number:', error);
      toast.error('Failed to add phone number');
      throw error;
    }
  };

  // Delete a customer number
  const deleteCustomerNumber = async (id: string) => {
    try {
      setCustomerNumbers(prev => prev.filter(n => n.id !== id));
      toast.success('Phone number deleted successfully');
    } catch (error) {
      console.error('Error deleting phone number:', error);
      toast.error('Failed to delete phone number');
      throw error;
    }
  };

  // Add a new sale
  const addSale = async (saleData: Omit<Sale, 'id' | 'amountPaid' | 'status'>): Promise<Sale> => {
    try {
      const newSale: Sale = {
        ...saleData,
        id: Math.random().toString(36).substr(2, 9),
        amountPaid: saleData.paymentStatus === 'paid' ? saleData.amount : 
                    saleData.paymentStatus === 'partial' ? saleData.paymentAmount || 0 : 0,
        status: saleData.paymentStatus
      };
      setSales(prev => [...prev, newSale]);
      
      // Automatically generate invoice for the new sale
      await generateInvoice(newSale);
      
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
      
      // Update corresponding invoice
      setInvoices(prev => prev.map(invoice => {
        if (invoice.saleId === sale.id) {
          return {
            ...invoice,
            status: sale.paymentStatus === 'paid' ? 'paid' : 
                    sale.paymentStatus === 'partial' ? 'partial' : 'unpaid'
          };
        }
        return invoice;
      }));

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
      const customer = customers.find(c => c.id === sale.customerId);
      if (!customer) throw new Error('Customer not found');

      const dueDate = new Date(sale.date);
      dueDate.setDate(dueDate.getDate() + 14);

      // Parse the notes to get the description
      let description = '';
      if (sale.businessType === 'telecom_recharge') {
        const notes = sale.notes.split('\n');
        const number = notes.find(n => n.startsWith('Number:'))?.replace('Number: ', '') || '';
        description = `Recharge for ${number}`;
      } else if (sale.businessType?.startsWith('travel_')) {
        const notes = sale.notes.split('\n');
        const route = notes.find(n => n.startsWith('Route:'))?.replace('Route: ', '') || '';
        description = `Travel Booking - ${route}`;
      } else if (sale.businessType === 'telecom_phone') {
        const notes = sale.notes.split('\n');
        const brand = notes.find(n => n.startsWith('Brand:'))?.replace('Brand: ', '') || '';
        const model = notes.find(n => n.startsWith('Model:'))?.replace('Model: ', '') || '';
        description = `Phone Sale - ${brand} ${model}`;
      } else if (sale.businessType === 'telecom_service') {
        const notes = sale.notes.split('\n');
        const service = notes.find(n => n.startsWith('Service:'))?.replace('Service: ', '') || '';
        description = `Service - ${service}`;
      } else {
        description = sale.notes;
      }

      const newInvoice: Invoice = {
        id: Math.random().toString(36).substr(2, 9),
        customerId: sale.customerId,
        saleId: sale.id,
        date: sale.date,
        dueDate: dueDate,
        items: [{
          id: Math.random().toString(36).substr(2, 9),
          description: description,
          quantity: 1,
          unitPrice: sale.amount,
          total: sale.amount
        }],
        subtotal: sale.amount,
        tax: Number((sale.amount * 0.09).toFixed(2)),
        total: Number((sale.amount * 1.09).toFixed(2)),
        status: sale.paymentStatus === 'paid' ? 'paid' : 
                sale.paymentStatus === 'partial' ? 'partial' : 'unpaid'
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

  // Add a payment to a sale
  const addPayment = async (payment: Payment) => {
    try {
      setSales(prevSales => {
        return prevSales.map(sale => {
          if (sale.id === payment.saleId) {
            const newAmountPaid = sale.amountPaid + payment.amount;
            const newStatus = newAmountPaid >= sale.amount ? 'paid' : 'partial';
            
            // Update corresponding invoice
            setInvoices(prev => prev.map(invoice => {
              if (invoice.saleId === sale.id) {
                return {
                  ...invoice,
                  status: newStatus === 'paid' ? 'paid' : 'partial'
                };
              }
              return invoice;
            }));
            
            return {
              ...sale,
              amountPaid: newAmountPaid,
              paymentStatus: newStatus
            };
          }
          return sale;
        });
      });
      
      toast.success('Payment recorded successfully');
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
      throw error;
    }
  };

  const updateCustomerNumber = async (number: CustomerNumber) => {
    try {
      setCustomerNumbers(prev => prev.map(n => n.id === number.id ? number : n));
      toast.success('Phone number updated successfully');
    } catch (error) {
      console.error('Error updating phone number:', error);
      toast.error('Failed to update phone number');
      throw error;
    }
  };

  // Delete an invoice
  const deleteInvoice = async (id: string) => {
    try {
      setInvoices(prev => prev.filter(i => i.id !== id));
      toast.success('Invoice deleted successfully');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
      throw error;
    }
  };

  // Update an invoice
  const updateInvoice = async (invoice: Invoice) => {
    try {
      setInvoices(prev => prev.map(i => i.id === invoice.id ? invoice : i));
      
      // Update corresponding sale status
      setSales(prev => prev.map(sale => {
        if (sale.id === invoice.saleId) {
          return {
            ...sale,
            paymentStatus: invoice.status === 'paid' ? 'paid' : 
                          invoice.status === 'partial' ? 'partial' : 'unpaid'
          };
        }
        return sale;
      }));

      toast.success('Invoice updated successfully');
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error('Failed to update invoice');
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{
      customers,
      customerNumbers,
      plans,
      customerPlans,
      sales,
      invoices,
      dashboardStats,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addCustomerNumber,
      deleteCustomerNumber,
      addSale,
      updateSale,
      deleteSale,
      generateInvoice,
      addCustomerPlan,
      updateCustomerPlan,
      addPayment,
      updateCustomerNumber,
      deleteInvoice,
      updateInvoice,
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