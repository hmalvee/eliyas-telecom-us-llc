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
  const { sales, customers, updateSale } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });
  const [selectedSale, setSelectedSale] = useState<any>(null);

  // Filter sales based on search term
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const customer = customers.find(c => c.id === sale.customerId);
      const searchString = `${customer?.name} ${customer?.phone} ${sale.id}`.toLowerCase();
      return searchString.includes(searchTerm.toLowerCase());
    });
  }, [sales, customers, searchTerm]);

  // Sort filtered sales
  const sortedSales = useMemo(() => {
    return [...filteredSales].sort((a, b) => {
      if (sortConfig.key === 'customerName') {
        const customerA = customers.find(c => c.id === a.customerId)?.name || '';
        const customerB = customers.find(c => c.id === b.customerId)?.name || '';
        return sortConfig.direction === 'asc' 
          ? customerA.localeCompare(customerB)
          : customerB.localeCompare(customerA);
      }
      
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredSales, sortConfig, customers]);

  // Calculate pagination
  const totalPages = Math.ceil(sortedSales.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSales = sortedSales.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search sales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        
        <Link
          to="/sales/new"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Sale
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Date
                  {sortConfig.key === 'date' && (
                    sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('customerName')}
              >
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Customer
                  {sortConfig.key === 'customerName' && (
                    sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedSales.map((sale) => {
              const customer = customers.find(c => c.id === sale.customerId);
              
              return (
                <tr 
                  key={sale.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedSale(sale)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(sale.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {customer?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer?.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {BUSINESS_TYPE_LABELS[sale.businessType as keyof typeof BUSINESS_TYPE_LABELS]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(sale.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      sale.status === 'paid' ? 'bg-green-100 text-green-800' :
                      sale.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, sortedSales.length)} of {sortedSales.length} results
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

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