import React from 'react';
import SaleForm from '../components/forms/SaleForm';

const NewSale: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">New Sale</h2>
      </div>
      <div className="p-6">
        <SaleForm />
      </div>
    </div>
  );
};

export default NewSale;