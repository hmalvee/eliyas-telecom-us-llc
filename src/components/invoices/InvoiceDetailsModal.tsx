import React, { useState } from 'react';
import { X, Mail } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Invoice, Customer } from '../../types';
import { PDFViewer } from '@react-pdf/renderer';
import InvoicePDF from './InvoicePDF';
import { toast } from 'react-toastify';

interface InvoiceDetailsModalProps {
  invoice: Invoice;
  customer: Customer;
  onClose: () => void;
}

const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({ invoice, customer, onClose }) => {
  const { updateInvoice } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [editedInvoice, setEditedInvoice] = useState(invoice);
  const [isSending, setIsSending] = useState(false);

  const handleSave = async () => {
    try {
      await updateInvoice(editedInvoice);
      setIsEditing(false);
      toast.success('Invoice updated successfully');
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error('Failed to update invoice');
    }
  };

  const sendInvoiceEmail = async () => {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Invoice Details</h3>
          <div className="flex items-center space-x-2">
            {!isEditing && (
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
                <button
                  onClick={sendInvoiceEmail}
                  disabled={isSending}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  <Mail size={16} className="inline mr-1" />
                  {isSending ? 'Sending...' : 'Send Email'}
                </button>
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
              <InvoicePDF invoice={editedInvoice} customer={customer} />
            </PDFViewer>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Customer Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Name</div>
                  <div className="text-sm font-medium">{customer?.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Contact</div>
                  <div className="text-sm font-medium">{customer?.phone}</div>
                </div>
              </div>
            </div>

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
                      {editedInvoice.date.toLocaleDateString()}
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
                      {editedInvoice.dueDate.toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Items</h4>
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Quantity</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Unit Price</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {editedInvoice.items.map((item, index) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2 text-sm">
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => {
                              const newItems = [...editedInvoice.items];
                              newItems[index] = { ...item, description: e.target.value };
                              setEditedInvoice({ ...editedInvoice, items: newItems });
                            }}
                            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                          />
                        ) : (
                          item.description
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...editedInvoice.items];
                              newItems[index] = {
                                ...item,
                                quantity: parseInt(e.target.value),
                                total: parseInt(e.target.value) * item.unitPrice
                              };
                              setEditedInvoice({ ...editedInvoice, items: newItems });
                            }}
                            className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm"
                          />
                        ) : (
                          item.quantity
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => {
                              const newItems = [...editedInvoice.items];
                              newItems[index] = {
                                ...item,
                                unitPrice: parseFloat(e.target.value),
                                total: item.quantity * parseFloat(e.target.value)
                              };
                              setEditedInvoice({ ...editedInvoice, items: newItems });
                            }}
                            className="w-24 rounded-md border border-gray-300 px-2 py-1 text-sm"
                          />
                        ) : (
                          `$${item.unitPrice.toFixed(2)}`
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm text-right">
                        ${item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="text-sm font-medium">${editedInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Tax</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedInvoice.tax}
                      onChange={(e) => {
                        const newTax = parseFloat(e.target.value);
                        setEditedInvoice({
                          ...editedInvoice,
                          tax: newTax,
                          total: editedInvoice.subtotal + newTax
                        });
                      }}
                      className="w-24 rounded-md border border-gray-300 px-2 py-1 text-sm"
                    />
                  ) : (
                    <span className="text-sm font-medium">${editedInvoice.tax.toFixed(2)}</span>
                  )}
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
                  }}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Save Changes
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