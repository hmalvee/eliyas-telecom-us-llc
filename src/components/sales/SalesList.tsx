import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Link } from 'react-router-dom';
import { Search, Plus, Calendar, User, Edit2, Trash2, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, X } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface OrderDetailsPopupProps {
  sale: any;
  onClose: () => void;
  onUpdate: (updatedSale: any) => void;
}

const BUSINESS_TYPE_LABELS = {
  telecom_recharge: 'Recharge',
  telecom_phone: 'Phone Sale',
  telecom_service: 'Service',
  telecom_other: 'Other Telecom',
  travel_domestic: 'Domestic Travel',
  travel_international: 'International Travel',
  travel_visa: 'Visa Service',
  travel_custom: 'Custom Travel'
};

const OrderDetailsPopup: React.FC<OrderDetailsPopupProps> = ({ sale, onClose, onUpdate }) => {
  const [editedSale, setEditedSale] = useState(sale);
  const [teamNotes, setTeamNotes] = useState(sale.teamNotes || '');

  const handleSave = () => {
    onUpdate({ ...editedSale, teamNotes });
    onClose();
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

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Type
            </label>
            <div className="text-sm bg-gray-50 p-2 rounded">
              {BUSINESS_TYPE_LABELS[sale.businessType as keyof typeof BUSINESS_TYPE_LABELS]}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Status
            </label>
            <select
              value={editedSale.orderStatus}
              onChange={(e) => setEditedSale({ ...editedSale, orderStatus: e.target.value })}
              className="block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="delivered">Delivered</option>
              <option value="processing">Processing</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <select
              value={editedSale.paymentStatus}
              onChange={(e) => setEditedSale({ ...editedSale, paymentStatus: e.target.value })}
              className="block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Notes
            </label>
            <textarea
              value={editedSale.notes}
              onChange={(e) => setEditedSale({ ...editedSale, notes: e.target.value })}
              rows={3}
              className="block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Notes (Internal Only)
            </label>
            <textarea
              value={teamNotes}
              onChange={(e) => setTeamNotes(e.target.value)}
              rows={3}
              className="block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Add private notes for team members..."
            />
          </div>

          {sale.businessType === 'telecom_phone' && (
            <div className="space-y-2">
              <div className="font-medium text-gray-700">Phone Details</div>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded">
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
            <div className="space-y-2">
              <div className="font-medium text-gray-700">Travel Details</div>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded">
                <div>
                  <div className="text-sm text-gray-500">Route</div>
                  <div className="text-sm font-medium">{sale.travelDetails?.route}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Customer Fare</div>
                  <div className="text-sm font-medium">{formatCurrency(sale.travelDetails?.customerFare)}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const SalesList: React.FC = () => {
  // ... (previous state declarations and functions remain the same)
  const [selectedSale, setSelectedSale] = useState<any>(null);

  // ... (rest of the component implementation remains the same)

  return (
    <div className="space-y-6">
      {/* ... (previous JSX remains the same) ... */}
      
      <tbody className="bg-white divide-y divide-gray-200">
        {paginatedSales.map((sale) => {
          const customer = customers.find(c => c.id === sale.customerId);
          
          return (
            <tr 
              key={sale.id} 
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedSale(sale)}
            >
              {/* ... (existing row content remains the same) ... */}
            </tr>
          );
        })}
      </tbody>
      
      {/* ... (rest of the table and pagination remains the same) ... */}
      
      {selectedSale && (
        <OrderDetailsPopup
          sale={selectedSale}
          onClose={() => setSelectedSale(null)}
          onUpdate={async (updatedSale) => {
            await updateSale(updatedSale);
            setSelectedSale(null);
          }}
        />
      )}
    </div>
  );
};

export default SalesList;