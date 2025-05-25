import React from 'react';
import InvoiceForm from '../components/forms/InvoiceForm';

const NewInvoice: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Create New Invoice</h2>
      </div>
      <div className="p-6">
        <InvoiceForm />
      </div>
    </div>
  );
};

export default NewInvoice;