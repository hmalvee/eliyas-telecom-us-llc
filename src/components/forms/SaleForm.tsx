import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Plan } from '../../types';

interface SaleFormProps {
  onSuccess?: () => void;
}

const SaleForm: React.FC<SaleFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { customers, plans, addSale, generateInvoice } = useApp();
  const [formData, setFormData] = useState({
    customerId: '',
    planId: '',
    paymentMethod: 'card',
    notes: '',
    business: 'telecom',
    status: 'pending'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedPlan = plans.find(p => p.id === formData.planId) as Plan;
    const sale = addSale({
      customerId: formData.customerId,
      planId: formData.planId,
      amount: selectedPlan.price,
      date: new Date(),
      paymentMethod: formData.paymentMethod as 'cash' | 'card' | 'online',
      notes: formData.notes,
      business: formData.business as 'telecom' | 'travel',
      status: formData.status as 'paid' | 'partial' | 'unpaid' | 'not-delivered' | 'pending'
    });
    
    generateInvoice(sale);
    
    if (onSuccess) {
      onSuccess();
    }
    navigate('/sales');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="business" className="block text-sm font-medium text-gray-700">
          Business
        </label>
        <select
          id="business"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={formData.business}
          onChange={(e) => setFormData({ ...formData, business: e.target.value })}
        >
          <option value="telecom">Eliyas Telecom</option>
          <option value="travel">US Tours And Travels</option>
        </select>
      </div>

      <div>
        <label htmlFor="customer" className="block text-sm font-medium text-gray-700">
          Customer
        </label>
        <select
          id="customer"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={formData.customerId}
          onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
        >
          <option value="">Select a customer</option>
          {customers.map(customer => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="plan" className="block text-sm font-medium text-gray-700">
          Plan
        </label>
        <select
          id="plan"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={formData.planId}
          onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
        >
          <option value="">Select a plan</option>
          {plans.map(plan => (
            <option key={plan.id} value={plan.id}>
              {plan.name} - ${plan.price}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        >
          <option value="pending">Pending</option>
          <option value="not-delivered">Not Delivered</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>

      <div>
        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
          Payment Method
        </label>
        <select
          id="paymentMethod"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={formData.paymentMethod}
          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
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
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => navigate('/sales')}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create Sale
        </button>
      </div>
    </form>
  );
};

export default SaleForm;