import React from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import PaymentForm from '../components/sales/PaymentForm';

const SalePayment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { sales } = useApp();
  
  const sale = sales.find(s => s.id === id);
  if (!sale) return <div>Sale not found</div>;
  
  const remainingAmount = sale.amount - sale.amountPaid;

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Record Payment</h2>
      </div>
      <div className="p-6">
        <PaymentForm 
          saleId={sale.id} 
          remainingAmount={remainingAmount}
        />
      </div>
    </div>
  );
};

export default SalePayment;