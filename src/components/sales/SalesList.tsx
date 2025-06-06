import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Link } from 'react-router-dom';
import { Search, Plus, Calendar, User, Edit2, Trash2, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';
import OrderDetailsModal from './OrderDetailsModal';

const ITEMS_PER_PAGE = 10;

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

const SalesList: React.FC = () => {
  const { sales, customers, deleteSale, updateSale } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');
  const [selectedOrderStatus, setSelectedOrderStatus] = useState('all');
  const [selectedBusiness, setSelectedBusiness] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [selectedSale, setSelectedSale] = useState(null);

  // Filter sales based on all criteria
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const customer = customers.find(c => c.id === sale.customerId);
      
      const matchesSearch = 
        customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.amount.toString().includes(searchQuery);
      
      const matchesPaymentStatus = selectedPaymentStatus === 'all' || sale.paymentStatus === selectedPaymentStatus;
      const matchesOrderStatus = selectedOrderStatus === 'all' || sale.orderStatus === selectedOrderStatus;
      const matchesBusiness = selectedBusiness === 'all' || sale.businessType?.startsWith(selectedBusiness.toLowerCase());
      
      // Date range filtering
      const saleDate = new Date(sale.date);
      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      const endDate = dateRange.end ? new Date(dateRange.end) : null;
      
      const matchesDateRange = 
        (!startDate || saleDate >= startDate) &&
        (!endDate || saleDate <= endDate);
      
      return matchesSearch && matchesPaymentStatus && matchesOrderStatus && matchesBusiness && matchesDateRange;
    });
  }, [sales, customers, searchQuery, selectedPaymentStatus, selectedOrderStatus, selectedBusiness, dateRange]);

  // Sort sales
  const sortedSales = useMemo(() => {
    return [...filteredSales].sort((a, b) => {
      switch (sortConfig.key) {
        case 'date':
          return sortConfig.direction === 'asc' 
            ? a.date.getTime() - b.date.getTime()
            : b.date.getTime() - a.date.getTime();
        case 'customer':
          const customerA = customers.find(c => c.id === a.customerId)?.name || '';
          const customerB = customers.find(c => c.id === b.customerId)?.name || '';
          return sortConfig.direction === 'asc'
            ? customerA.localeCompare(customerB)
            : customerB.localeCompare(customerA);
        case 'amount':
          return sortConfig.direction === 'asc'
            ? a.amount - b.amount
            : b.amount - a.amount;
        default:
          return 0;
      }
    });
  }, [filteredSales, sortConfig]);

  // Calculate pagination
  const totalPages = Math.ceil(sortedSales.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSales = sortedSales.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Format date
  const formatDate = (date: Date) => format(date, 'MMM dd, yyyy');

  // Format currency
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);

  // Get order type display name
  const getOrderType = (businessType: string | undefined) => {
    switch (businessType) {
      case 'telecom_recharge':
        return 'Recharge';
      case 'telecom_phone':
        return 'Phone Sale';
      case 'telecom_service':
        return 'Service';
      case 'telecom_other':
        return 'Others';
      case 'travel_domestic':
        return 'Domestic Travel';
      case 'travel_international':
        return 'International Travel';
      case 'travel_visa':
        return 'Visa Processing';
      case 'travel_custom':
        return 'Custom Package';
      default:
        return 'Unknown';
    }
  };

  // Handle sort
  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle delete
  const handleDelete = async (saleId: string) => {
    if (window.confirm('Are you sure you want to delete this sale? This action cannot be undone.')) {
      await deleteSale(saleId);
    }
  };

  // Handle status update
  const handleUpdateStatus = async (saleId: string, paymentStatus: string, orderStatus: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;

    await updateSale({
      ...sale,
      paymentStatus: paymentStatus as 'paid' | 'partial' | 'unpaid',
      orderStatus: orderStatus as 'delivered' | 'canceled' | 'processing'
    });
    setEditingSaleId(null);
  };

  // Status badges
  const getPaymentStatusBadge = (status: string = 'unpaid') => {
    const badgeColors = {
      'paid': 'bg-green-100 text-green-800',
      'partial': 'bg-yellow-100 text-yellow-800',
      'unpaid': 'bg-red-100 text-red-800'
    };
    
    const colorClass = badgeColors[status as keyof typeof badgeColors] || 'bg-gray-100 text-gray-800';
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getOrderStatusBadge = (status: string = 'processing') => {
    const badgeColors = {
      'delivered': 'bg-green-100 text-green-800',
      'canceled': 'bg-red-100 text-red-800',
      'processing': 'bg-blue-100 text-blue-800'
    };
    
    const colorClass = badgeColors[status as keyof typeof badgeColors] || 'bg-gray-100 text-gray-800';
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedPaymentStatus('all');
    setSelectedOrderStatus('all');
    setSelectedBusiness('all');
    setDateRange({ start: '', end: '' });
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Sales Transactions</h2>
            
            <div className="flex items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search sales..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <Link
                to="/sales/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus size={18} className="mr-1" />
                <span>New Sale</span>
              </Link>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => {
                    setDateRange(prev => ({ ...prev, start: e.target.value }));
                    setCurrentPage(1);
                  }}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => {
                    setDateRange(prev => ({ ...prev, end: e.target.value }));
                    setCurrentPage(1);
                  }}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
              <select
                value={selectedPaymentStatus}
                onChange={(e) => {
                  setSelectedPaymentStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
              <select
                value={selectedOrderStatus}
                onChange={(e) => {
                  setSelectedOrderStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="delivered">Delivered</option>
                <option value="canceled">Canceled</option>
                <option value="processing">Processing</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business</label>
              <select
                value={selectedBusiness}
                onChange={(e) => {
                  setSelectedBusiness(e.target.value);
                  setCurrentPage(1);
                }}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="all">All Business</option>
                <option value="telecom">Eliyas Telecom</option>
                <option value="travel">US Tours And Travels</option>
              </select>
            </div>

            <div className="lg:col-span-4 flex justify-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Reset Filters
              </button>
            </div>
          </div>
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
                    Date
                    {sortConfig.key === 'date' && (
                      sortConfig.direction === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('customer')}
                >
                  <div className="flex items-center">
                    Customer
                    {sortConfig.key === 'customer' && (
                      sortConfig.direction === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Type
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center">
                    Amount
                    {sortConfig.key === 'amount' && (
                      sortConfig.direction === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar size={16} className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{formatDate(sale.date)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <User size={14} />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{customer?.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.businessType?.startsWith('telecom') ? 'Eliyas Telecom' : 'US Tours And Travels'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getOrderType(sale.businessType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(sale.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingSaleId === sale.id ? (
                        <select
                          value={sale.paymentStatus}
                          onChange={(e) => handleUpdateStatus(sale.id, e.target.value, sale.orderStatus)}
                          className="block w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                        >
                          <option value="paid">Paid</option>
                          <option value="partial">Partial</option>
                          <option value="unpaid">Unpaid</option>
                        </select>
                      ) : (
                        getPaymentStatusBadge(sale.paymentStatus)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingSaleId === sale.id ? (
                        <select
                          value={sale.orderStatus}
                          onChange={(e) => handleUpdateStatus(sale.id, sale.paymentStatus, e.target.value)}
                          className="block w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                        >
                          <option value="delivered">Delivered</option>
                          <option value="canceled">Canceled</option>
                          <option value="processing">Processing</option>
                        </select>
                      ) : (
                        getOrderStatusBadge(sale.orderStatus)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setEditingSaleId(editingSaleId === sale.id ? null : sale.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(sale.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {paginatedSales.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                    {searchQuery 
                      ? `No sales found matching "${searchQuery}"`
                      : 'No sales recorded yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(startIndex + ITEMS_PER_PAGE, sortedSales.length)}
                  </span>{' '}
                  of <span className="font-medium">{sortedSales.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft size={16} />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === i + 1
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight size={16} />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
      {selectedSale && (
        <OrderDetailsModal
          sale={selectedSale}
          customer={customers.find(c => c.id === selectedSale.customerId)}
          onClose={() => setSelectedSale(null)}
        />
      )}
    </div>
  );
};

export default SalesList;