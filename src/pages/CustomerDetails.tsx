import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { format } from 'date-fns';
import { User, Phone, Mail, MapPin, Calendar, Package, FileText } from 'lucide-react';

const CustomerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { customers, customerPlans, plans, sales, invoices } = useApp();
  
  const customer = customers.find(c => c.id === id);
  if (!customer) return <div>Customer not found</div>;
  
  const customerSales = sales.filter(s => s.customerId === id);
  const customerInvoices = invoices.filter(i => i.customerId === id);
  const activePlans = customerPlans.filter(cp => cp.customerId === id && cp.status === 'active');
  
  const formatDate = (date: Date) => format(date, 'MMM dd, yyyy');
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-semibold">
                {customer.name.charAt(0)}
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-semibold text-gray-900">{customer.name}</h2>
                <p className="text-sm text-gray-500">Customer since {formatDate(customer.joinDate)}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Edit Customer
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <Phone size={18} className="mr-2" />
                <span>{customer.phone}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Mail size={18} className="mr-2" />
                <span>{customer.email}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin size={18} className="mr-2" />
                <span>{customer.address}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <Calendar size={18} className="mr-2" />
                <span>Join Date: {formatDate(customer.joinDate)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Package size={18} className="mr-2" />
                <span>Active Plans: {activePlans.length}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FileText size={18} className="mr-2" />
                <span>Total Invoices: {customerInvoices.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Plans</h3>
          <div className="space-y-4">
            {activePlans.map(cp => {
              const plan = plans.find(p => p.id === cp.planId);
              return (
                <div key={cp.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{plan?.name}</h4>
                    <p className="text-sm text-gray-500">
                      Expires: {formatDate(cp.endDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(plan?.price || 0)}</p>
                    <p className="text-sm text-gray-500">/month</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
          <div className="space-y-4">
            {customerSales.map(sale => {
              const plan = plans.find(p => p.id === sale.planId);
              return (
                <div key={sale.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{plan?.name}</h4>
                    <p className="text-sm text-gray-500">
                      Date: {formatDate(sale.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(sale.amount)}</p>
                    <p className="text-sm text-gray-500">{sale.paymentMethod}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;