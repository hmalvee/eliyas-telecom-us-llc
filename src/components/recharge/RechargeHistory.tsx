import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { format, addDays, isWithinInterval } from 'date-fns';
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
      sale.businessType === 'telecom_recharge'
    ).map(sale => {
      const customer = customers.find(c => c.id === sale.customerId);
      const number = sale.customerNumberId 
        ? customerNumbers.find(n => n.id === sale.customerNumberId)
        : null;

      const expiryDate = addDays(sale.date, 30);
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
        isRecentlyExpired
      };
    });
  }, [sales, customers, customerNumbers]);

  // Rest of the component remains the same until the table header

  return (
    <div className="space-y-6">
      {/* Previous JSX remains the same */}
      
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
              Carrier
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
          {recharges.map((recharge) => (
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
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {recharge.number?.carrier || 'N/A'}
                </div>
                {recharge.number?.customCarrier && (
                  <div className="text-sm text-gray-500">
                    {recharge.number.customCarrier}
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
                  recharge.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                  recharge.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {recharge.paymentStatus.charAt(0).toUpperCase() + recharge.paymentStatus.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center space-x-3">
                  {(recharge.isExpiringSoon || recharge.isRecentlyExpired) && (
                    <button
                      onClick={() => sendReminder(recharge)}
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      <Mail size={16} className="mr-1" />
                      <span>Send Reminder</span>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}

          {recharges.length === 0 && (
            <tr>
              <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                No recharge history found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Rest of the component remains the same */}
    </div>
  );
};

export default RechargeHistory;