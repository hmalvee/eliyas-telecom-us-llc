import React from 'react';
import { X } from 'lucide-react';

interface OrderDetailsModalProps {
  sale: any;
  customer: any;
  onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ sale, customer, onClose }) => {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Order Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
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
                <div className="text-sm text-gray-500">Amount</div>
                <div className="text-sm font-medium">{formatCurrency(sale.amount)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Amount Paid</div>
                <div className="text-sm font-medium">{formatCurrency(sale.amountPaid)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Payment Method</div>
                <div className="text-sm font-medium">{sale.paymentMethod}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Payment Status</div>
                <div className="text-sm font-medium">{sale.paymentStatus}</div>
              </div>
            </div>
          </div>

          {/* Business Specific Details */}
          {sale.businessType === 'telecom_phone' && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Phone Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Brand</div>
                  <div className="text-sm font-medium">{sale.phoneDetails?.brand}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Model</div>
                  <div className="text-sm font-medium">{sale.phoneDetails?.model}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">IMEI</div>
                  <div className="text-sm font-medium">{sale.phoneDetails?.imei}</div>
                </div>
              </div>
            </div>
          )}

          {(sale.businessType === 'travel_domestic' || sale.businessType === 'travel_international') && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Travel Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Route</div>
                  <div className="text-sm font-medium">{sale.travelDetails?.route}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Type</div>
                  <div className="text-sm font-medium">
                    {sale.businessType === 'travel_domestic' ? 'Domestic' : 'International'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {sale.notes && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
              <div className="text-sm">{sale.notes}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;