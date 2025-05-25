import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { format } from 'date-fns';
import InvoiceDetails from './InvoiceDetails';
import { Search } from 'lucide-react';

const InvoiceList: React.FC = () => {
  const { invoices, customers } = useApp();
  const [activeTab, setActiveTab] = useState<'unpaid' | 'partially-paid' | 'paid' | 'cancelled' | 'all'>('unpaid');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedStaff, setSelectedStaff] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);

  // Filter invoices based on active tab
  const filteredInvoices = invoices.filter(invoice => {
    if (activeTab === 'all') return true;
    if (activeTab === 'partially-paid') return invoice.status === 'partial';
    if (activeTab === 'paid') return invoice.status === 'paid';
    if (activeTab === 'unpaid') return invoice.status === 'unpaid';
    if (activeTab === 'cancelled') return invoice.status === 'cancelled';
    return true;
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (date: Date) => {
    return format(date, 'MMM dd, yyyy');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Invoices</h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
            Add Invoice
          </button>
          <button className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">
            View Reports
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('unpaid')}
          className={`px-4 py-2 -mb-px ${
            activeTab === 'unpaid'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500'
          }`}
        >
          Unpaid
        </button>
        <button
          onClick={() => setActiveTab('partially-paid')}
          className={`px-4 py-2 -mb-px ${
            activeTab === 'partially-paid'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500'
          }`}
        >
          Partially Paid
        </button>
        <button
          onClick={() => setActiveTab('paid')}
          className={`px-4 py-2 -mb-px ${
            activeTab === 'paid'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500'
          }`}
        >
          Paid
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`px-4 py-2 -mb-px ${
            activeTab === 'cancelled'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500'
          }`}
        >
          Cancelled
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 -mb-px ${
            activeTab === 'all'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500'
          }`}
        >
          All
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <input
              type="date"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Staff
            </label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
            >
              <option value="all">All</option>
              <option value="staff1">Staff 1</option>
              <option value="staff2">Staff 2</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Group
            </label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              <option value="all">All</option>
              <option value="group1">Group 1</option>
              <option value="group2">Group 2</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <button className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700">
            Filter
          </button>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => {
                const customer = customers.find(c => c.id === invoice.customerId);
                
                return (
                  <tr key={invoice.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedInvoice(invoice.id)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      #{invoice.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{customer?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Admin
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Invoice #{invoice.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(invoice.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        invoice.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : invoice.status === 'unpaid'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Standard
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-blue-600 hover:text-blue-900">View</button>
                    </td>
                  </tr>
                );
              })}
              
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-10 text-center text-gray-500">
                    No invoices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <InvoiceDetails
          invoice={invoices.find(i => i.id === selectedInvoice)!}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
};

export default InvoiceList;