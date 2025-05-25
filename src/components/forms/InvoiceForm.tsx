import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Plus, Trash2, Search } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const InvoiceForm: React.FC = () => {
  const navigate = useNavigate();
  const { customers, addInvoice } = useApp();
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showCustomerPopup, setShowCustomerPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([{
    id: uuidv4(),
    description: '',
    quantity: 1,
    unitPrice: 0,
    total: 0
  }]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = Number((subtotal * 0.09).toFixed(2)); // 9% tax
  const total = subtotal + tax;

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    
    // Recalculate total if quantity or unit price changes
    if (field === 'quantity' || field === 'unitPrice') {
      item.total = Number(item.quantity) * Number(item.unitPrice);
    }
    
    newItems[index] = item;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, {
      id: uuidv4(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    setIsSubmitting(true);
    try {
      const invoice = {
        customerId: selectedCustomer.id,
        date: new Date(),
        dueDate: new Date(dueDate),
        items,
        subtotal,
        tax,
        total,
        status: 'unpaid',
        notes: notes ? [notes] : [],
        terms: [],
        currency: 'USD',
        exchangeRate: 1,
        template: 'standard' as const,
        customFields: {}
      };

      await addInvoice(invoice);
      navigate('/invoices');
    } catch (error) {
      console.error('Error creating invoice:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Customer</label>
        <div className="relative mt-1">
          <button
            type="button"
            onClick={() => setShowCustomerPopup(true)}
            className="w-full px-4 py-2 text-left border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {selectedCustomer ? (
              <div>
                <div className="font-medium">{selectedCustomer.name}</div>
                <div className="text-sm text-gray-500">{selectedCustomer.email}</div>
                <div className="text-sm text-gray-500">{selectedCustomer.phone}</div>
              </div>
            ) : (
              <span className="text-gray-500">Select a customer</span>
            )}
          </button>
        </div>

        {/* Customer Selection Popup */}
        {showCustomerPopup && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="w-full">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left">
                      <h3 className="text-lg font-medium text-gray-900">
                        Select Customer
                      </h3>
                      <div className="mt-2">
                        <div className="mb-4">
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Search size={18} className="text-gray-400" />
                            </div>
                            <input
                              type="text"
                              placeholder="Search by name, email, or phone"
                              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {customers
                            .filter(customer => 
                              customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              customer.phone.includes(searchQuery)
                            )
                            .map(customer => (
                              <button
                                key={customer.id}
                                type="button"
                                className="w-full px-4 py-3 text-left hover:bg-gray-100 focus:outline-none border-b border-gray-200"
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setShowCustomerPopup(false);
                                  setSearchQuery('');
                                }}
                              >
                                <div className="font-medium">{customer.name}</div>
                                <div className="text-sm text-gray-600">{customer.email}</div>
                                <div className="text-sm text-gray-600">{customer.phone}</div>
                              </button>
                            ))
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      setShowCustomerPopup(false);
                      setSearchQuery('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Due Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Due Date</label>
        <input
          type="date"
          required
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Invoice Items */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Description"
                  required
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="w-24">
                <input
                  type="number"
                  placeholder="Qty"
                  required
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="w-32">
                <input
                  type="number"
                  placeholder="Price"
                  required
                  min="0"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="w-32 px-3 py-2 text-right font-medium">
                ${item.total.toFixed(2)}
              </div>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus size={18} className="mr-2" />
            Add Item
          </button>
        </div>
      </div>

      {/* Totals */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Subtotal</span>
              <span className="text-sm font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Tax (9%)</span>
              <span className="text-sm font-medium">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2">
              <span className="text-sm font-medium">Total</span>
              <span className="text-sm font-medium">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => navigate('/invoices')}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !selectedCustomer}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create Invoice'}
        </button>
      </div>
    </form>
  );
};

export default InvoiceForm;