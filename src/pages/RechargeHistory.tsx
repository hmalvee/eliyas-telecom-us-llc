import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { format, addDays, isWithinInterval, parseISO } from 'date-fns';
import { Search, Mail, AlertCircle, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const RechargeHistory: React.FC = () => {
  const { sales, customers, customerNumbers } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [reminderFilter, setReminderFilter] = useState('all');

  // Filter recharge sales
  const recharges = useMemo(() => {
    return sales.filter(sale => 
      sale.business === 'telecom_recharge' &&
      (selectedStatus === 'all' || sale.status === selectedStatus)
    ).map(sale => {
      const customer = customers.find(c => c.id === sale.customerId);
      const number = customerNumbers.find(n => n.id === sale.customerNumberId);
      
      // Calculate expiry date (30 days from recharge)
      const expiryDate = addDays(sale.date, 30);
      
      // Check if plan is expiring soon (within next 3 days)
      const today = new Date();
      const isExpiringSoon = isWithinInterval(expiryDate, {
        start: today,
        end: addDays(today, 3)
      });

      // Check if plan has recently expired (within last 3 days)
      const hasRecentlyExpired = isWithinInterval(expiryDate, {
        start: addDays(today, -3),
        end: today
      });

      return {
        ...sale,
        customer,
        number,
        expiryDate,
        isExpiringSoon,
        hasRecentlyExpired,
        reminderSent: false // This should come from your database
      };
    });
  }, [sales, customers, customerNumbers, selectedStatus]);

  // Filter and search
  const filteredRecharges = useMemo(() => {
    return recharges.filter(recharge => {
      const matchesSearch = 
        recharge.customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recharge.number?.phoneNumber.includes(searchQuery) ||
        recharge.amount.toString().includes(searchQuery);

      const matchesReminder = reminderFilter === 'all' 
        ? true 
        : reminderFilter === 'pending' 
          ? (recharge.isExpiringSoon || recharge.hasRecentlyExpired) && !recharge.reminderSent
          : recharge.reminderSent;

      return matchesSearch && matchesReminder;
    });
  }, [recharges, searchQuery, reminderFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredRecharges.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRecharges = filteredRecharges.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Format date
  const formatDate = (date: Date) => {
    return format(date, 'MMM dd, yyyy');
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Send reminder email
  const sendReminder = async (rechargeId: string) => {
    try {
      // Implement email sending logic here
      console.log('Sending reminder for recharge:', rechargeId);
      // Update reminder status in database
      // Show success message
    } catch (error) {
      console.error('Error sending reminder:', error);
      // Show error message
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Recharge History</h2>
            
            <div className="flex items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search recharges..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="unpaid">Unpaid</option>
            </select>

            <select
              value={reminderFilter}
              onChange={(e) => {
                setReminderFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="all">All Reminders</option>
              <option value="pending">Pending Reminders</option>
              <option value="sent">Reminders Sent</option>
            </select>

            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStatus('all');
                setReminderFilter('all');
                setCurrentPage(1);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Expiring Plans Alert */}
        {recharges.some(r => r.isExpiringSoon || r.hasRecentlyExpired) && (
          <div className="p-4 bg-yellow-50 border-b border-yellow-100">
            <div className="flex items-center">
              <AlertCircle size={20} className="text-yellow-600 mr-2" />
              <span className="text-yellow-800">
                Some plans are expiring soon or have recently expired. Send reminders to customers.
              </span>
            </div>
          </div>
        )}

        {/* Recharge List */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recharge Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reminder
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedRecharges.map((recharge) => (
                <tr key={recharge.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        {recharge.customer?.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {recharge.customer?.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {recharge.number?.phoneNumber || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(recharge.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(recharge.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${
                      recharge.isExpiringSoon 
                        ? 'text-yellow-600' 
                        : recharge.hasRecentlyExpired 
                          ? 'text-red-600'
                          : 'text-gray-500'
                    }`}>
                      {formatDate(recharge.expiryDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      recharge.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : recharge.status === 'partial'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {recharge.status.charAt(0).toUpperCase() + recharge.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {recharge.reminderSent ? (
                      <span className="inline-flex items-center text-green-600">
                        <Check size={16} className="mr-1" />
                        Sent
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-gray-500">
                        <X size={16} className="mr-1" />
                        Not Sent
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(recharge.isExpiringSoon || recharge.hasRecentlyExpired) && !recharge.reminderSent && (
                      <button
                        onClick={() => sendReminder(recharge.id)}
                        className="inline-flex items-center text-blue-600 hover:text-blue-900"
                      >
                        <Mail size={16} className="mr-1" />
                        Send Reminder
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {paginatedRecharges.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                    {searchQuery 
                      ? `No recharges found matching "${searchQuery}"`
                      : 'No recharges recorded yet.'}
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
                    {Math.min(startIndex + ITEMS_PER_PAGE, filteredRecharges.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredRecharges.length}</span> results
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

export default RechargeHistory;