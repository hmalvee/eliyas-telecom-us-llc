import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { format } from 'date-fns';
import { User, Phone, Mail, MapPin, Calendar, Package, FileText, Trash2, Edit2, Plus } from 'lucide-react';
import CustomerNumberForm from '../components/customers/CustomerNumberForm';

const CustomerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers, customerNumbers, customerPlans, plans, sales, invoices, deleteCustomer, deleteCustomerNumber } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingNumber, setIsAddingNumber] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  
  const customer = customers.find(c => c.id === id);
  if (!customer) return <div>Customer not found</div>;
  
  const customerSales = sales.filter(s => s.customerId === id);
  const customerInvoices = invoices.filter(i => i.customerId === id);
  const activePlans = customerPlans.filter(cp => cp.customerId === id && cp.status === 'active');
  const numbers = customerNumbers.filter(n => n.customerId === id);
  
  const formatDate = (date: Date) => format(date, 'MMM dd, yyyy');
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const handleEdit = () => {
    setEditForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address
    });
    setIsEditing(true);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      await deleteCustomer(customer.id);
      navigate('/customers');
    }
  };

  const handleDeleteNumber = async (numberId: string) => {
    if (window.confirm('Are you sure you want to delete this phone number?')) {
      await deleteCustomerNumber(numberId);
    }
  };

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
              <button 
                onClick={handleEdit}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Edit2 size={16} className="mr-2" />
                Edit Customer
              </button>
              <button 
                onClick={handleDelete}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                <Trash2 size={16} className="mr-2" />
                Delete Customer
              </button>
            </div>
          </div>
          
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle save
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
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
          )}
        </div>
      </div>
      
      {/* Family Numbers Section */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Family Numbers</h3>
            <button
              onClick={() => setIsAddingNumber(true)}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus size={16} className="mr-1" />
              Add Number
            </button>
          </div>

          {isAddingNumber ? (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <CustomerNumberForm
                customerId={customer.id}
                onSuccess={() => setIsAddingNumber(false)}
                onCancel={() => setIsAddingNumber(false)}
              />
            </div>
          ) : null}

          <div className="space-y-4">
            {numbers.map(number => (
              <div key={number.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{number.name}</h4>
                  <p className="text-sm text-gray-500">{number.phoneNumber}</p>
                  <p className="text-sm text-gray-500">{number.carrier}</p>
                </div>
                <button
                  onClick={() => handleDeleteNumber(number.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {numbers.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No additional numbers added yet
              </p>
            )}
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