import React, { createContext, useContext, useState } from 'react';
import { toast } from 'react-hot-toast';

interface Invoice {
  id: string;
  saleId: string;
  // Add other invoice properties as needed
}

interface AppContextType {
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'saleId'>) => Promise<void>;
  // Add other context values and functions as needed
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const addInvoice = async (invoice: Omit<Invoice, 'id' | 'saleId'>) => {
    try {
      const newInvoice: Invoice = {
        ...invoice,
        id: Math.random().toString(36).substr(2, 9),
        saleId: '', // Empty string for manually created invoices
      };
      setInvoices(prev => [...prev, newInvoice]);
      toast.success('Invoice created successfully');
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice');
      throw error;
    }
  };

  const value = {
    invoices,
    addInvoice,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}