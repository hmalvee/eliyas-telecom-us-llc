import React, { createContext, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { Invoice } from '../types';

interface AppContextType {
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  updateInvoice: (invoice: Invoice) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

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
    invoices,
    setInvoices,
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