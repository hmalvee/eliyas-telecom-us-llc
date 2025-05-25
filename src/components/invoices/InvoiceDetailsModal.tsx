import React, { useState, useEffect } from 'react';
import { X, Mail } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Invoice, Customer } from '../../types';
import { PDFViewer } from '@react-pdf/renderer';
import InvoicePDF from './InvoicePDF';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

interface InvoiceDetailsModalProps {
  invoice: Invoice;
  customer?: Customer;
  onClose: () => void;
  isCreating?: boolean;
}

const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({ 
  invoice, 
  customer, 
  onClose,
  isCreating = false
}) => {
  const { updateInvoice, customers, settings } = useApp();
  const [isEditing, setIsEditing] = useState(isCreating);
  const [showPDF, setShowPDF] = useState(false);
  const [editedInvoice, setEditedInvoice] = useState(invoice);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customer?.id || '');
  const [isSending, setIsSending] = useState(false);
  const [showCustomerSelect, setShowCustomerSelect] = useState(isCreating);

  useEffect(() => {
    if (selectedCustomerId) {
      setEditedInvoice(prev => ({
        ...prev,
        customerId: selectedCustomerId
      }));
    }
  }, [selectedCustomerId]);

  const handleSave = async () => {
    try {
      if (!editedInvoice.customerId) {
        toast.error('Please select a customer');
        return;
      }

      // Calculate totals
      const subtotal = editedInvoice.items.reduce((sum, item) => sum + item.total, 0);
      const tax = Number((subtotal * 0.09).toFixed(2));
      const total = subtotal + tax;

      const updatedInvoice = {
        ...editedInvoice,
        subtotal,
        tax,
        total
      };

      await updateInvoice(updatedInvoice);
      setIsEditing(false);
      setShowCustomerSelect(false);
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error('Failed to update invoice');
    }
  };

  const addItem = () => {
    setEditedInvoice(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: uuidv4(),
          description: '',
          quantity: 1,
          unitPrice: 0,
          total: 0
        }
      ]
    }));
  };

  const removeItem = (itemId: string) => {
    setEditedInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const updateItem = (itemId: string, field: string, value: string | number) => {
    setEditedInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.total = Number(updatedItem.quantity) * Number(updatedItem.unitPrice);
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const sendInvoiceEmail = async () => {
    if (!customer) {
      toast.error('No customer selected');
      return;
    }

    try {
      setIsSending(true);
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-invoice`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice: editedInvoice,
          customer,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send invoice');
      }

      toast.success('Invoice sent successfully');
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error('Failed to send invoice');
    } finally {
      setIsSending(false);
    }
  };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {isCreating ? 'Create New Invoice' : 'Invoice Details'}
          </h3>
          <div className="flex items-center space-x-2">
            {!isEditing && !isCreating && (
              <>
                <button
                  onClick={() => setShowPDF(!showPDF)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {showPDF ? 'Hide PDF' : 'View PDF'}
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit
                </button>
                {customer && (
                  <button
                    onClick={sendInvoiceEmail}
                    disabled={isSending}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    <Mail size={16} className="inline mr-1" />
                    {isSending ? 'Sending...' : 'Send Email'}
                  </button>
                )}
              </>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
        </div>

        {showPDF ? (
          <div className="h-[600px]">
            <PDFViewer width="100%" height="100%">
              <InvoicePDF 
                invoice={editedInvoice}
                customer={selectedCustomer!}
                settings={settings}
              />
            </PDFViewer>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Customer Selection */}
            {(isEditing || showCustomerSelect) && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Customer
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select a customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Customer Information */}
            {selectedCustomer && !showCustomerSelect && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Name</div>
                    <div className="text-sm font-medium">{selectedCustomer.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Contact</div>
                    <div className="text-sm font-medium">{selectedCustomer.phone}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Invoice Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Invoice Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Invoice Date</div>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editedInvoice.date.toISOString().split('T')[0]}
                      onChange={(e) => setEditedInvoice({ ...editedInvoice, date: new Date(e.target.value) })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                    />
                  ) : (
                    <div className="text-sm font-medium">
                      {format(editedInvoice.date, 'MMM dd, yyyy')}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-500">Due Date</div>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editedInvoice.dueDate.toISOString().split('T')[0]}
                      onChange={(e) => setEditedInvoice({ ...editedInvoice, dueDate: new Date(e.target.value) })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                    />
                  ) : (
                    <div className="text-sm font-medium">
                      {format(editedInvoice.dueDate, 'MMM dd, yyyy')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-medium text-gray-700">Items</h4>
                {isEditing && (
                  <button
                    type="button"
                    onClick={addItem}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Item
                  </button>
                )}
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Quantity</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Unit Price</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Total</th>
                    {isEditing && (
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {editedInvoice.items.map((item, index) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2">
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                          />
                        ) : (
                          item.description
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value))}
                            className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm"
                          />
                        ) : (
                          item.quantity
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value))}
                            className="w-24 rounded-md border border-gray-300 px-2 py-1 text-sm"
                          />
                        ) : (
                          `$${item.unitPrice.toFixed(2)}`
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        ${item.total.toFixed(2)}
                      </td>
                      {isEditing && (
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="w-64 ml-auto space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="text-sm font-medium">${editedInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Tax (9%)</span>
                  <span className="text-sm font-medium">${editedInvoice.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-sm font-medium">Total</span>
                  <span className="text-sm font-medium">${editedInvoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
              {isEditing ? (
                <select
                  value={editedInvoice.status}
                  onChange={(e) => setEditedInvoice({ ...editedInvoice, status: e.target.value as any })}
                  className="block w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                >
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="overdue">Overdue</option>
                </select>
              ) : (
                <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  editedInvoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                  editedInvoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {editedInvoice.status.charAt(0).toUpperCase() + editedInvoice.status.slice(1)}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setEditedInvoice(invoice);
                    setIsEditing(false);
                    if (isCreating) {
                      onClose();
                    }
                  }}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {isCreating ? 'Create Invoice' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetailsModal;