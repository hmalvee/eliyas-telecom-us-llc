import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
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
  const { supabase } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [customerPlans, setCustomerPlans] = useState<CustomerPlan[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalSales: 0,
    totalCustomers: 0,
    activePlans: 0,
    expiringSoon: 0,
    revenueToday: 0,
    revenueTrend: Array(7).fill(0)
  });

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch customers
        const { data: customersData, error: customersError } = await supabase
          .from('customers')
          .select('*');
        if (customersError) throw customersError;
        setCustomers(customersData.map(customer => ({
          ...customer,
          joinDate: new Date(customer.join_date)
        })));

        // Fetch plans
        const { data: plansData, error: plansError } = await supabase
          .from('plans')
          .select('*');
        if (plansError) throw plansError;
        setPlans(plansData);

        // Fetch customer plans
        const { data: customerPlansData, error: customerPlansError } = await supabase
          .from('customer_plans')
          .select('*');
        if (customerPlansError) throw customerPlansError;
        setCustomerPlans(customerPlansData.map(cp => ({
          ...cp,
          startDate: new Date(cp.start_date),
          endDate: new Date(cp.end_date)
        })));

        // Fetch sales
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select('*');
        if (salesError) throw salesError;
        setSales(salesData.map(sale => ({
          ...sale,
          date: new Date(sale.date)
        })));

        // Fetch invoices
        const { data: invoicesData, error: invoicesError } = await supabase
          .from('invoices')
          .select('*, invoice_items(*)');
        if (invoicesError) throw invoicesError;
        setInvoices(invoicesData.map(invoice => ({
          ...invoice,
          date: new Date(invoice.date),
          dueDate: new Date(invoice.due_date),
          items: invoice.invoice_items
        })));
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      }
    };

    fetchData();

    // Set up real-time subscriptions
    const customersSubscription = supabase
      .channel('customers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, payload => {
        if (payload.eventType === 'INSERT') {
          setCustomers(current => [...current, { ...payload.new, joinDate: new Date(payload.new.join_date) }]);
        } else if (payload.eventType === 'UPDATE') {
          setCustomers(current => current.map(customer => 
            customer.id === payload.new.id ? { ...payload.new, joinDate: new Date(payload.new.join_date) } : customer
          ));
        } else if (payload.eventType === 'DELETE') {
          setCustomers(current => current.filter(customer => customer.id !== payload.old.id));
        }
      })
      .subscribe();

    const salesSubscription = supabase
      .channel('sales')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, payload => {
        if (payload.eventType === 'INSERT') {
          setSales(current => [...current, { ...payload.new, date: new Date(payload.new.date) }]);
        } else if (payload.eventType === 'UPDATE') {
          setSales(current => current.map(sale => 
            sale.id === payload.new.id ? { ...payload.new, date: new Date(payload.new.date) } : sale
          ));
        } else if (payload.eventType === 'DELETE') {
          setSales(current => current.filter(sale => sale.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      customersSubscription.unsubscribe();
      salesSubscription.unsubscribe();
    };
  }, [supabase]);

  // Add a new customer
  const addCustomer = async (customer: Omit<Customer, 'id' | 'joinDate'>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([{
          ...customer,
          join_date: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
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
      const { error } = await supabase
        .from('customers')
        .update({
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          join_date: customer.joinDate.toISOString()
        })
        .eq('id', customer.id);

      if (error) throw error;
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
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
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
      const { data, error } = await supabase
        .from('sales')
        .insert([{
          customer_id: saleData.customerId,
          plan_id: saleData.planId,
          amount: saleData.amount,
          amount_paid: 0,
          date: saleData.date.toISOString(),
          payment_method: saleData.paymentMethod,
          status: 'unpaid',
          notes: saleData.notes
        }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Sale created successfully');
      return { ...data, date: new Date(data.date) };
    } catch (error) {
      console.error('Error adding sale:', error);
      toast.error('Failed to create sale');
      throw error;
    }
  };

  // Update a sale
  const updateSale = async (sale: Sale) => {
    try {
      const { error } = await supabase
        .from('sales')
        .update({
          customer_id: sale.customerId,
          plan_id: sale.planId,
          amount: sale.amount,
          amount_paid: sale.amountPaid,
          date: sale.date.toISOString(),
          payment_method: sale.paymentMethod,
          status: sale.status,
          notes: sale.notes
        })
        .eq('id', sale.id);

      if (error) throw error;
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
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);

      if (error) throw error;
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

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
          customer_id: sale.customerId,
          sale_id: sale.id,
          date: sale.date.toISOString(),
          due_date: dueDate.toISOString(),
          subtotal: plan.price,
          tax: Number((plan.price * 0.09).toFixed(2)),
          total: Number((plan.price * 1.09).toFixed(2)),
          status: 'unpaid'
        }])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      const { error: itemError } = await supabase
        .from('invoice_items')
        .insert([{
          invoice_id: invoice.id,
          description: `${plan.name} - Monthly Subscription`,
          quantity: 1,
          unit_price: plan.price,
          total: plan.price
        }]);

      if (itemError) throw itemError;
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
      const { error } = await supabase
        .from('customer_plans')
        .insert([{
          customer_id: customerPlan.customerId,
          plan_id: customerPlan.planId,
          start_date: customerPlan.startDate.toISOString(),
          end_date: customerPlan.endDate.toISOString(),
          status: customerPlan.status,
          reminder_sent: customerPlan.reminderSent
        }]);

      if (error) throw error;
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
      const { error } = await supabase
        .from('customer_plans')
        .update({
          customer_id: customerPlan.customerId,
          plan_id: customerPlan.planId,
          start_date: customerPlan.startDate.toISOString(),
          end_date: customerPlan.endDate.toISOString(),
          status: customerPlan.status,
          reminder_sent: customerPlan.reminderSent
        })
        .eq('id', customerPlan.id);

      if (error) throw error;
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