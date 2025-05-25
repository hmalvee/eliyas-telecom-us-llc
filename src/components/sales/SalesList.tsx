import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Link } from 'react-router-dom';
import { Search, Plus, Calendar, User, Edit2, DollarSign, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const SalesList: React.FC = () => {
  const { sales, customers, plans, deleteSale } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedBusiness, setSelectedBusiness] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Memoize filtered sales to prevent unnecessary recalculations
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const customer = customers.find(c => c.id === sale.customerId);
      const plan = plans.find(p => p.id === sale.planId);
      
      if (!customer || !plan) return false;
      
      const matchesSearch = 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.amount.toString().includes(searchQuery);
      
      const matchesStatus = selectedStatus === 'all' || sale.status === selectedStatus;
      const matchesBusiness = selectedBusiness === 'all' || sale.business === selectedBusiness;
      
      return matchesSearch && matchesStatus && matchesBusiness;
    });
  }, [sales, customers, plans, searchQuery, selectedStatus, selectedBusiness]);
  
  // Memoize sorted sales
  const sortedSales = useMemo(() => {
    return [...filteredSales].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [filteredSales]);

  // Calculate pagination
  const totalPages = Math.ceil(sortedSales.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSales = sortedSales.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  
  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Status badge
  const getStatusBadge = (status: string) => {
    if (!status) return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
        Unknown
      </span>
    );

    const badgeColors = {
      'paid': 'bg-green-100 text-green-800',
      'partial': 'bg-yellow-100 text-yellow-800',
      'unpaid': 'bg-red-100 text-red-800',
      'not-delivered': 'bg-purple-100 text-purple-800',
      'pending': 'bg-blue-100 text-blue-800'
    };
    
    const colorClass = badgeColors[status as keyof typeof badgeColors] || 'bg-gray-100 text-gray-800';
    const displayStatus = status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ');
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
        {displayStatus}
      </span>
    );
  };

  const handleDeleteSale = async (saleId: string) => {
    if (window.confirm('Are you sure you want to delete this sale? This action cannot be undone.')) {
      await deleteSale(saleId);
    }
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
                    setCurrentPage(1); // Reset to first page on search
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
          
          <div className="mt-4 flex gap-4">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1); // Reset to first page on filter change
              }}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="not-delivered">Not Delivered</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="unpaid">Unpaid</option>
            </select>

            <select
              value={selectedBusiness}
              onChange={(e) => {
                setSelectedBusiness(e.target.value);
                setCurrentPage(1); // Reset to first page on filter change
              }}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="all">All Business</option>
              <option value="telecom">Eliyas Telecom</option>
              <option value="travel">US Tours And Travels</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedSales.map((sale) => {
                const customer = customers.find(c => c.id === sale.customerId);
                const plan = plans.find(p => p.id === sale.planId);
                
                return (
                  <tr key={sale.id} className="hover:bg-gray-50">
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
                      {sale.business === 'telecom' ? 'Eliyas Telecom' : 'US Tours And Travels'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{plan?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(sale.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(sale.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-3">
                        <Link
                          to={`/sales/${sale.id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <Link
                          to={`/sales/${sale.id}/payment`}
                          className="text-green-600 hover:text-green-900"
                        >
                          <DollarSign size={16} />
                        </Link>
                        <button
                          onClick={() => handleDeleteSale(sale.id)}
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
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
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
    </div>
  );
};

export default SalesList;