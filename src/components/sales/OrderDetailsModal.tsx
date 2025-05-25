import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface OrderDetailsModalProps {
  sale: any;
  customer: any;
  onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ sale, customer, onClose }) => {
  const { updateSale } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editedSale, setEditedSale] = useState(sale);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  const handleSave = async () => {
    try {
      // Calculate new payment status based on amount and amount paid
      const newPaymentStatus = 
        editedSale.amountPaid >= editedSale.amount ? 'paid' :
        editedSale.amountPaid > 0 ? 'partial' : 'unpaid';

      const updatedSale = {
        ...editedSale,
        paymentStatus: newPaymentStatus
      };

      await updateSale(updatedSale);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating sale:', error);
    }
  };

  // Calculate due amount
  const getDueAmount = () => {
    return editedSale.amount - editedSale.amountPaid;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Order Details</h3>
          <div className="flex items-center space-x-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit
              </button>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
        </div>

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

          {/* Order Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Order Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Order Date</div>
                <div className="text-sm font-medium">{formatDate(sale.date)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Business Type</div>
                <div className="text-sm font-medium">
                  {sale.businessType?.startsWith('telecom') ? 'Eliyas Telecom' : 'US Tours And Travels'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Amount</div>
                {isEditing ? (
                  <input
                    type="number"
                    value={editedSale.amount}
                    onChange={(e) => {
                      const newAmount = parseFloat(e.target.value);
                      setEditedSale(prev => ({
                        ...prev,
                        amount: newAmount,
                        amountPaid: prev.paymentStatus === 'paid' ? newAmount : prev.amountPaid
                      }));
                    }}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                  />
                ) : (
                  <div className="text-sm font-medium">${formatCurrency(sale.amount)}</div>
                )}
              </div>
              <div>
                <div className="text-sm text-gray-500">Amount Paid</div>
                {isEditing ? (
                  <input
                    type="number"
                    value={editedSale.amountPaid}
                    onChange={(e) => {
                      const newAmountPaid = parseFloat(e.target.value);
                      setEditedSale(prev => ({
                        ...prev,
                        amountPaid: newAmountPaid,
                        paymentStatus: newAmountPaid >= prev.amount ? 'paid' :
                                     newAmountPaid > 0 ? 'partial' : 'unpaid'
                      }));
                    }}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                  />
                ) : (
                  <div className="text-sm font-medium">${formatCurrency(sale.amountPaid)}</div>
                )}
              </div>
              {(isEditing ? editedSale.paymentStatus === 'partial' : sale.paymentStatus === 'partial') && (
                <div>
                  <div className="text-sm text-gray-500">Due Amount</div>
                  <div className="text-sm font-medium text-red-600">
                    ${formatCurrency(getDueAmount())}
                  </div>
                </div>
              )}
              <div>
                <div className="text-sm text-gray-500">Payment Method</div>
                {isEditing ? (
                  <select
                    value={editedSale.paymentMethod}
                    onChange={(e) => setEditedSale({ ...editedSale, paymentMethod: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                  >
                    <option value="card">Card</option>
                    <option value="cash">Cash</option>
                    <option value="online">Online</option>
                  </select>
                ) : (
                  <div className="text-sm font-medium">{sale.paymentMethod}</div>
                )}
              </div>
              <div>
                <div className="text-sm text-gray-500">Payment Status</div>
                {isEditing ? (
                  <select
                    value={editedSale.paymentStatus}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      setEditedSale(prev => ({
                        ...prev,
                        paymentStatus: newStatus,
                        amountPaid: newStatus === 'paid' ? prev.amount :
                                   newStatus === 'unpaid' ? 0 : prev.amountPaid
                      }));
                    }}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                  >
                    <option value="paid">Paid</option>
                    <option value="partial">Partial</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                ) : (
                  <div className="text-sm font-medium">{sale.paymentStatus}</div>
                )}
              </div>
              <div>
                <div className="text-sm text-gray-500">Order Status</div>
                {isEditing ? (
                  <select
                    value={editedSale.orderStatus}
                    onChange={(e) => setEditedSale({ ...editedSale, orderStatus: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                  >
                    <option value="delivered">Delivered</option>
                    <option value="canceled">Canceled</option>
                    <option value="processing">Processing</option>
                  </select>
                ) : (
                  <div className="text-sm font-medium">{sale.orderStatus}</div>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          {(sale.notes || isEditing) && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
              {isEditing ? (
                <textarea
                  value={editedSale.notes || ''}
                  onChange={(e) => setEditedSale({ ...editedSale, notes: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                />
              ) : (
                <div className="text-sm">{sale.notes}</div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setEditedSale(sale);
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
      </div>
    </div>
  );
};

export default OrderDetailsModal;