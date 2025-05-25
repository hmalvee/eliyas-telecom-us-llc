import React, { createContext, useContext, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Sale, Invoice, Customer, CustomerNumber } from '../types';

interface AppContextType {
  sales: Sale[];
  invoices: Invoice[];
  customers: Customer[];
  customerNumbers: CustomerNumber[];
  addSale: (saleData: Omit<Sale, 'id' | 'invoiceNumber'>) => Promise<Sale>;
  generateInvoice: (sale: Sale) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerNumbers, setCustomerNumbers] = useState<CustomerNumber[]>([]);

  const addSale = async (saleData: Omit<Sale, 'id' | 'invoiceNumber'>): Promise<Sale> => {
    try {
      const invoiceNumber = `INV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const newSale: Sale = {
        ...saleData,
        id: Math.random().toString(36).substr(2, 9),
        invoiceNumber
      };
      setSales(prev => [...prev, newSale]);
      
      // Generate invoice with the same payment status
      await generateInvoice(newSale);
      
      toast.success('Sale created successfully');
      return newSale;
    } catch (error) {
      console.error('Error adding sale:', error);
      toast.error('Failed to create sale');
      throw error;
    }
  };

  const generateInvoice = async (sale: Sale) => {
    try {
      const customer = customers.find(c => c.id === sale.customerId);
      if (!customer) throw new Error('Customer not found');

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
          description: getInvoiceDescription(sale),
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

  // Helper function to generate invoice description
  const getInvoiceDescription = (sale: Sale): string => {
    switch (sale.businessType) {
      case 'telecom_recharge':
        return `Recharge - ${sale.customerNumberId ? 
          customerNumbers.find(n => n.id === sale.customerNumberId)?.phoneNumber :
          customers.find(c => c.id === sale.customerId)?.phone}`;
      case 'telecom_phone':
        const notes = sale.notes.split('\n');
        const brand = notes.find(n => n.startsWith('Brand:'))?.replace('Brand: ', '') || '';
        const model = notes.find(n => n.startsWith('Model:'))?.replace('Model: ', '') || '';
        return `Phone Sale - ${brand} ${model}`;
      case 'telecom_service':
        const serviceNotes = sale.notes.split('\n');
        const service = serviceNotes.find(n => n.startsWith('Service:'))?.replace('Service: ', '') || '';
        return `Service - ${service}`;
      default:
        return sale.notes;
    }
  };

  const value = {
    sales,
    invoices,
    customers,
    customerNumbers,
    addSale,
    generateInvoice
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};