import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';

interface PaymentFormProps {
  saleId: string;
  remainingAmount: number;
  onSuccess?: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ saleId, remainingAmount, onSuccess }) => {
  const navigate = useNavigate();
  const { addPayment } = useApp();
  const [formData, setFormData] = useState({
    amount: remainingAmount,
    method: 'card',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPayment({
      saleId,
      amount: formData.amount,
      date: new Date(),
      method: formData.method as 'cash' | 'card' | 'online',
      notes: formData.notes
    });
    
    if (onSuccess) {
      onSuccess();
    }
    navigate('/sales');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Payment Amount
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            id="amount"
            max={remainingAmount}
            step="0.01"
            required
            className="block w-full pl-7 pr-12 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Remaining balance: ${remainingAmount.toFixed(2)}
        </p>
      </div>

      <div>
        <label htmlFor="method" className="block text-sm font-medium text-gray-700">
          Payment Method
        </label>
        <select
          id="method"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          value={formData.method}
          onChange={(e) => setFormData({ ...formData, method: e.target.value })}
        >
          <option value="card">Card</option>
          <option value="cash">Cash</option>
          <option value="online">Online</option>
        </select>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => navigate('/sales')}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Record Payment
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;