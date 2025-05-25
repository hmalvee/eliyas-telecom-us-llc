// Update the addInvoice function in AppContext
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