import React from 'react';
import CustomerForm from '../components/forms/CustomerForm';

const NewCustomer: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Add New Customer</h2>
      </div>
      <div className="p-6">
        <CustomerForm />
      </div>
    </div>
  );
};

export default NewCustomer;