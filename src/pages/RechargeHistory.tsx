import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { format, addDays, isWithinInterval, parseISO } from 'date-fns';
import { Search, Mail, AlertCircle, Check, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

const RechargeHistory: React.FC = () => {
  const { sales, customers, customerNumbers } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [reminderFilter, setReminderFilter] = useState('all');

  // Filter recharge transactions
  const recharges = useMemo(() => {
    return sales.filter(sale => 
      sale.businessType === 'telecom_recharge' &&
      (selectedStatus === 'all' || sale.status === selectedStatus)
    ).map(sale => {
      const customer = customers.find(c => c.id === sale.customerId);
      const number = sale.customerNumberId 
        ? customerNumbers.find(n => n.id === sale.customerNumberId)
        : null;

      const expiryDate = addDays(sale.date, 30); // Assuming 30-day plans
      const now = new Date();
      const isExpiringSoon = isWithinInterval(expiryDate, {
        start: now,
        end: addDays(now, 3)
      });
      const isRecentlyExpired = isWithinInterval(expiryDate, {
        start: addDays(now, -3),
        end: now
      });

      return {
        ...sale,
        customer,
        number,
        expiryDate,
        isExpiringSoon,
        isRecentlyExpired,
        reminderSent: false // This should come from your database
      };
    });
  }, [sales, customers, customerNumbers, selectedStatus]);

  // Filter based on search and reminder status
  const filteredRecharges = useMemo(() => {
    return recharges.filter(recharge => {
      const matchesSearch = 
        recharge.customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recharge.customer?.phone.includes(searchQuery) ||
        (recharge.number?.phoneNumber || '').includes(searchQuery);

      const matchesReminder = reminderFilter === 'all' ||
        (reminderFilter === 'expiring' && recharge.isExpiringSoon) ||
        (reminderFilter === 'expired' && recharge.isRecentlyExpired);

      return matchesSearch && matchesReminder;
    });
  }, [recharges, searchQuery, reminderFilter]);

  // Send reminder email
  const sendReminder = async (recharge: any) => {
    try {
      // Here you would implement the actual email sending logic
      // For now, we'll just show a success message
      toast.success(`Reminder sent to ${recharge.customer.name}`);
    } catch (error) {
      toast.error('Failed to send reminder');
    }
  };

  return (
    <div className="space-y-6">
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
                  placeholder="Search by customer or number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="unpaid">Unpaid</option>
            </select>

            <select
              value={reminderFilter}
              onChange={(e) => setReminderFilter(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="all">All Recharges</option>
              <option value="expiring">Expiring Soon</option>
              <option value="expired">Recently Expired</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Number
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecharges.map((recharge) => (
                <tr key={recharge.id} className={`hover:bg-gray-50 ${
                  recharge.isExpiringSoon ? 'bg-yellow-50' : 
                  recharge.isRecentlyExpired ? 'bg-red-50' : ''
                }`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {recharge.customer?.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {recharge.customer?.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {recharge.number?.phoneNumber || recharge.customer?.phone}
                    </div>
                    {recharge.number && (
                      <div className="text-sm text-gray-500">
                        {recharge.number.name} - {recharge.number.carrier}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${recharge.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(recharge.date, 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`text-sm ${
                        recharge.isExpiringSoon ? 'text-yellow-800' :
                        recharge.isRecentlyExpired ? 'text-red-800' :
                        'text-gray-900'
                      }`}>
                        {format(recharge.expiryDate, 'MMM dd, yyyy')}
                      </span>
                      {(recharge.isExpiringSoon || recharge.isRecentlyExpired) && (
                        <AlertCircle size={16} className={`ml-2 ${
                          recharge.isExpiringSoon ? 'text-yellow-500' : 'text-red-500'
                        }`} />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      recharge.status === 'paid' ? 'bg-green-100 text-green-800' :
                      recharge.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {recharge.status.charAt(0).toUpperCase() + recharge.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
                      {(recharge.isExpiringSoon || recharge.isRecentlyExpired) && (
                        <button
                          onClick={() => sendReminder(recharge)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                          disabled={recharge.reminderSent}
                        >
                          {recharge.reminderSent ? (
                            <>
                              <Check size={16} className="mr-1" />
                              <span>Sent</span>
                            </>
                          ) : (
                            <>
                              <Mail size={16} className="mr-1" />
                              <span>Send Reminder</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredRecharges.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                    No recharge history found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Expiring Soon</h3>
            <AlertCircle size={20} className="text-yellow-500" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {recharges.filter(r => r.isExpiringSoon).length}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Plans expiring in the next 3 days
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recently Expired</h3>
            <Clock size={20} className="text-red-500" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {recharges.filter(r => r.isRecentlyExpired).length}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Plans expired in the last 3 days
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Total Active</h3>
            <Check size={20} className="text-green-500" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {recharges.filter(r => !r.isExpiringSoon && !r.isRecentlyExpired).length}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Currently active plans
          </p>
        </div>
      </div>
    </div>
  );
};

export default RechargeHistory;