// Add updateInvoice function to AppContext
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

// Add to context value
{
  // ... existing context values
  updateInvoice,
}