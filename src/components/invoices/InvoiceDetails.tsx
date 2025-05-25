import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Invoice } from '../../types';
import { format } from 'date-fns';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePDF from './InvoicePDF';
import { Download, Mail, Edit2, Save, X } from 'lucide-react';
import { toast } from 'react-toastify';

interface InvoiceDetailsProps {
  invoice: Invoice;
  onClose: () => void;
}

const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({ invoice: initialInvoice, onClose }) => {
  const { customers, updateInvoice } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [invoice, setInvoice] = useState(initialInvoice);
  const customer = customers.find(c => c.id === invoice.customerId);

  if (!customer) return null;

  const formatDate = (date: Date) => format(date, 'MMM dd, yyyy');
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const handleSave = async () => {
    try {
      await updateInvoice(invoice);
      setIsEditing(false);
      toast.success('Invoice updated successfully');
    } catch (error) {
      toast.error('Failed to update invoice');
    }
  };

  const sendInvoiceEmail = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-invoice`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice,
          customerEmail: customer.email,
          customerName: customer.name,
        }),
      });

      if (response.ok) {
        toast.success('Invoice sent successfully');
      } else {
        throw new Error('Failed to send invoice');
      }
    } catch (error) {
      toast.error('Failed to send invoice');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Invoice #{invoice.id}</h2>
            <div className="flex items-center space-x-3">
              <PDFDownloadLink
                document={<InvoicePDF invoice={invoice} customer={customer} />}
                fileName={`invoice-${invoice.id}.pdf`}
                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Download size={16} className="mr-1" />
                <span>Download PDF</span>
              </PDFDownloadLink>
              
              <button
                onClick={sendInvoiceEmail}
                className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Mail size={16} className="mr-1" />
                <span>Send Email</span>
              </button>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  <Edit2 size={16} className="mr-1" />
                  <span>Edit</span>
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Save size={16} className="mr-1" />
                  <span>Save</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="inline-flex items-center px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                <X size={16} className="mr-1" />
                <span>Close</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-medium mb-2">Bill To:</h3>
              <div className="text-gray-600">
                <p className="font-medium">{customer.name}</p>
                <p>{customer.email}</p>
                <p>{customer.phone}</p>
                <p>{customer.address}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="space-y-2">
                <div>
                  <span className="text-gray-600">Invoice Date:</span>
                  <span className="ml-2 font-medium">{formatDate(invoice.date)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Due Date:</span>
                  {isEditing ? (
                    <input
                      type="date"
                      value={format(invoice.dueDate, 'yyyy-MM-dd')}
                      onChange={(e) => setInvoice({
                        ...invoice,
                        dueDate: new Date(e.target.value)
                      })}
                      className="ml-2 border rounded px-2 py-1"
                    />
                  ) : (
                    <span className="ml-2 font-medium">{formatDate(invoice.dueDate)}</span>
                  )}
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  {isEditing ? (
                    <select
                      value={invoice.status}
                      onChange={(e) => setInvoice({
                        ...invoice,
                        status: e.target.value as 'paid' | 'unpaid' | 'overdue'
                      })}
                      className="ml-2 border rounded px-2 py-1"
                    >
                      <option value="paid">Paid</option>
                      <option value="unpaid">Unpaid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  ) : (
                    <span className={`ml-2 font-medium ${
                      invoice.status === 'paid' ? 'text-green-600' :
                      invoice.status === 'overdue' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <table className="w-full mb-8">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Description</th>
                <th className="text-right py-2">Quantity</th>
                <th className="text-right py-2">Unit Price</th>
                <th className="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => {
                          const updatedItems = invoice.items.map(i =>
                            i.id === item.id ? { ...i, description: e.target.value } : i
                          );
                          setInvoice({ ...invoice, items: updatedItems });
                        }}
                        className="w-full border rounded px-2 py-1"
                      />
                    ) : (
                      item.description
                    )}
                  </td>
                  <td className="py-2 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const quantity = parseInt(e.target.value);
                          const updatedItems = invoice.items.map(i =>
                            i.id === item.id ? {
                              ...i,
                              quantity,
                              total: quantity * i.unitPrice
                            } : i
                          );
                          setInvoice({ ...invoice, items: updatedItems });
                        }}
                        className="w-20 border rounded px-2 py-1"
                      />
                    ) : (
                      item.quantity
                    )}
                  </td>
                  <td className="py-2 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => {
                          const unitPrice = parseFloat(e.target.value);
                          const updatedItems = invoice.items.map(i =>
                            i.id === item.id ? {
                              ...i,
                              unitPrice,
                              total: i.quantity * unitPrice
                            } : i
                          );
                          setInvoice({ ...invoice, items: updatedItems });
                        }}
                        className="w-24 border rounded px-2 py-1"
                      />
                    ) : (
                      formatCurrency(item.unitPrice)
                    )}
                  </td>
                  <td className="py-2 text-right">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tax:</span>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={invoice.tax}
                    onChange={(e) => setInvoice({
                      ...invoice,
                      tax: parseFloat(e.target.value),
                      total: invoice.subtotal + parseFloat(e.target.value)
                    })}
                    className="w-24 border rounded px-2 py-1"
                  />
                ) : (
                  <span>{formatCurrency(invoice.tax)}</span>
                )}
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;