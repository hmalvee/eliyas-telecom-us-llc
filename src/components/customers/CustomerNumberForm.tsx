import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { CustomerNumber } from '../../types';

interface CustomerNumberFormProps {
  customerId: string;
  number?: CustomerNumber;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CARRIERS = [
  'AT&T',
  'Verizon',
  'T-Mobile',
  'Sprint',
  'US Cellular',
  'Metro by T-Mobile',
  'Cricket Wireless',
  'Boost Mobile',
  'Others'
];

const CustomerNumberForm: React.FC<CustomerNumberFormProps> = ({
  customerId,
  number,
  onSuccess,
  onCancel
}) => {
  const { addCustomerNumber, updateCustomerNumber } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    carrier: '',
    customCarrier: '',
    phoneNumber: ''
  });

  useEffect(() => {
    if (number) {
      setFormData({
        name: number.name,
        carrier: number.customCarrier ? 'Others' : number.carrier,
        customCarrier: number.customCarrier || '',
        phoneNumber: number.phoneNumber
      });
    }
  }, [number]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (number) {
        await updateCustomerNumber({
          id: number.id,
          customerId,
          name: formData.name,
          carrier: formData.carrier === 'Others' ? formData.customCarrier : formData.carrier,
          customCarrier: formData.carrier === 'Others' ? formData.customCarrier : undefined,
          phoneNumber: formData.phoneNumber
        });
      } else {
        await addCustomerNumber({
          customerId,
          name: formData.name,
          carrier: formData.carrier === 'Others' ? formData.customCarrier : formData.carrier,
          customCarrier: formData.carrier === 'Others' ? formData.customCarrier : undefined,
          phoneNumber: formData.phoneNumber
        });
      }
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving number:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Son, Daughter, Wife"
        />
      </div>

      <div>
        <label htmlFor="carrier" className="block text-sm font-medium text-gray-700">
          Carrier
        </label>
        <select
          id="carrier"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={formData.carrier}
          onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
        >
          <option value="">Select a carrier</option>
          {CARRIERS.map(carrier => (
            <option key={carrier} value={carrier}>
              {carrier}
            </option>
          ))}
        </select>
      </div>

      {formData.carrier === 'Others' && (
        <div>
          <label htmlFor="customCarrier" className="block text-sm font-medium text-gray-700">
            Custom Carrier Name
          </label>
          <input
            type="text"
            id="customCarrier"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={formData.customCarrier}
            onChange={(e) => setFormData({ ...formData, customCarrier: e.target.value })}
          />
        </div>
      )}

      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <input
          type="tel"
          id="phoneNumber"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          placeholder="(555) 123-4567"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {number ? 'Save Changes' : 'Add Number'}
        </button>
      </div>
    </form>
  );
};

export default CustomerNumberForm;