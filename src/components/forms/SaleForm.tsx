import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Customer, CustomerNumber } from '../../types';
import { Search, X } from 'lucide-react';

interface SaleFormProps {
  onSuccess?: () => void;
}

interface TelecomRechargeData {
  customerId: string;
  customerNumberId: string | null;
  otherNumber: string;
  rechargeAmount: number;
  paymentAmount: number;
  dueAmount: number;
  status: string;
  paymentMethod: string;
  notes: string;
}

interface TelecomPhoneData {
  customerId: string;
  model: string;
  brand: string;
  imei: string;
  price: number;
  paymentAmount: number;
  dueAmount: number;
  status: string;
  paymentMethod: string;
  notes: string;
}

interface TelecomAccessoryData {
  customerId: string;
  itemName: string;
  quantity: number;
  price: number;
  paymentAmount: number;
  dueAmount: number;
  status: string;
  paymentMethod: string;
  notes: string;
}

interface TelecomServiceData {
  customerId: string;
  serviceType: string;
  description: string;
  cost: number;
  paymentAmount: number;
  dueAmount: number;
  status: string;
  paymentMethod: string;
  notes: string;
}

interface TravelData {
  customerId: string;
  type: 'domestic' | 'international' | 'visa' | 'custom';
  route: string;
  ourFare: number;
  customerFare: number;
  profit: number;
  status: string;
  paymentAmount: number;
  dueAmount: number;
  paymentMethod: string;
  notes: string;
}

const BUSINESS_TYPES = [
  { name: 'Eliyas Telecom US LLC', types: [
    { id: 'telecom_recharge', label: 'Recharge' },
    { id: 'telecom_phone', label: 'Phone Sale' },
    { id: 'telecom_accessory', label: 'Accessories Sale' },
    { id: 'telecom_service', label: 'Service' },
    { id: 'telecom_other', label: 'Others' }
  ]},
  { name: 'USA Tours & Travels', types: [
    { id: 'travel_domestic', label: 'Domestic Travel' },
    { id: 'travel_international', label: 'International Travel' },
    { id: 'travel_visa', label: 'Visa Processing' },
    { id: 'travel_custom', label: 'Custom Package' }
  ]}
];

const SaleForm: React.FC<SaleFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { customers, customerNumbers: allCustomerNumbers, addSale } = useApp();
  const [businessType, setBusinessType] = useState('telecom_recharge');
  const [isPartialPayment, setIsPartialPayment] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<CustomerNumber | null>(null);
  const [showCustomerPopup, setShowCustomerPopup] = useState(false);
  const [useOtherNumber, setUseOtherNumber] = useState(false);
  const [otherNumber, setOtherNumber] = useState('');

  const [telecomRechargeData, setTelecomRechargeData] = useState<TelecomRechargeData>({
    customerId: '',
    customerNumberId: null,
    otherNumber: '',
    rechargeAmount: 0,
    paymentAmount: 0,
    dueAmount: 0,
    status: 'pending',
    paymentMethod: 'card',
    notes: ''
  });

  const [telecomPhoneData, setTelecomPhoneData] = useState<TelecomPhoneData>({
    customerId: '',
    model: '',
    brand: '',
    imei: '',
    price: 0,
    paymentAmount: 0,
    dueAmount: 0,
    status: 'pending',
    paymentMethod: 'card',
    notes: ''
  });

  const [telecomAccessoryData, setTelecomAccessoryData] = useState<TelecomAccessoryData>({
    customerId: '',
    itemName: '',
    quantity: 1,
    price: 0,
    paymentAmount: 0,
    dueAmount: 0,
    status: 'pending',
    paymentMethod: 'card',
    notes: ''
  });

  const [telecomServiceData, setTelecomServiceData] = useState<TelecomServiceData>({
    customerId: '',
    serviceType: '',
    description: '',
    cost: 0,
    paymentAmount: 0,
    dueAmount: 0,
    status: 'pending',
    paymentMethod: 'card',
    notes: ''
  });

  const [travelData, setTravelData] = useState<TravelData>({
    customerId: '',
    type: 'domestic',
    route: '',
    ourFare: 0,
    customerFare: 0,
    profit: 0,
    status: 'pending',
    paymentAmount: 0,
    dueAmount: 0,
    paymentMethod: 'card',
    notes: ''
  });

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const searchStr = searchQuery.toLowerCase();
      return (
        customer.name.toLowerCase().includes(searchStr) ||
        customer.email.toLowerCase().includes(searchStr) ||
        customer.phone.includes(searchStr)
      );
    });
  }, [customers, searchQuery]);

  const customerNumbers = useMemo(() => {
    if (!selectedCustomer) return [];
    return allCustomerNumbers.filter(n => n.customerId === selectedCustomer.id);
  }, [selectedCustomer, allCustomerNumbers]);

  const calculateProfit = (ourFare: number, customerFare: number) => {
    const profit = customerFare - ourFare;
    setTravelData(prev => ({ ...prev, profit }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    try {
      let saleData;
      switch (businessType) {
        case 'telecom_recharge':
          saleData = {
            customerId: selectedCustomer.id,
            customerNumberId: selectedNumber?.id,
            otherNumber: useOtherNumber ? otherNumber : null,
            amount: telecomRechargeData.rechargeAmount,
            paymentAmount: telecomRechargeData.paymentAmount,
            date: new Date(),
            paymentMethod: telecomRechargeData.paymentMethod as 'cash' | 'card' | 'online',
            notes: useOtherNumber 
              ? `Recharge for ${otherNumber}`
              : `Recharge for ${selectedNumber?.name} (${selectedNumber?.phoneNumber})`,
            businessType: 'telecom_recharge',
            status: isPartialPayment ? 'partial' : telecomRechargeData.paymentAmount >= telecomRechargeData.rechargeAmount ? 'paid' : 'unpaid'
          };
          break;

        // ... rest of your switch cases remain the same ...
      }

      await addSale(saleData);
      if (onSuccess) {
        onSuccess();
      }
      navigate('/sales');
    } catch (error) {
      console.error('Error creating sale:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Business</label>
        <select
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={businessType}
          onChange={(e) => setBusinessType(e.target.value)}
        >
          {BUSINESS_TYPES.map(business => (
            <optgroup key={business.name} label={business.name}>
              {business.types.map(type => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Customer
        </label>
        <div className="relative mt-1">
          <button
            type="button"
            onClick={() => setShowCustomerPopup(true)}
            className="w-full px-4 py-2 text-left border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {selectedCustomer ? (
              <div>
                <div className="font-medium">{selectedCustomer.name}</div>
                <div className="text-sm text-gray-500">{selectedCustomer.email}</div>
                <div className="text-sm text-gray-500">{selectedCustomer.phone}</div>
              </div>
            ) : (
              <span className="text-gray-500">Select a customer</span>
            )}
          </button>
        </div>

        {showCustomerPopup && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="w-full">
                      <div className="mt-3 text-center sm:mt-0 sm:text-left">
                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                          Select Customer
                        </h3>
                        <div className="mt-2">
                          <div className="mb-4">
                            <input
                              type="text"
                              placeholder="Search by name, email, or phone"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </div>
                          <div className="max-h-96 overflow-y-auto">
                            {filteredCustomers.map(customer => (
                              <button
                                key={customer.id}
                                type="button"
                                className="w-full px-4 py-3 text-left hover:bg-gray-100 focus:outline-none border-b border-gray-200"
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setShowCustomerPopup(false);
                                  setSearchQuery('');
                                }}
                              >
                                <div className="font-medium">{customer.name}</div>
                                <div className="text-sm text-gray-600">{customer.email}</div>
                                <div className="text-sm text-gray-600">{customer.phone}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      setShowCustomerPopup(false);
                      setSearchQuery('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedCustomer && businessType === 'telecom_recharge' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <div className="mt-1 space-y-2">
            {customerNumbers.map(number => (
              <label key={number.id} className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="phoneNumber"
                  value={number.id}
                  checked={selectedNumber?.id === number.id && !useOtherNumber}
                  onChange={() => {
                    setSelectedNumber(number);
                    setUseOtherNumber(false);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  {number.name} - {number.phoneNumber} ({number.carrier})
                </span>
              </label>
            ))}
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="phoneNumber"
                checked={useOtherNumber}
                onChange={() => {
                  setUseOtherNumber(true);
                  setSelectedNumber(null);
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span>Other Number</span>
            </label>
            {useOtherNumber && (
              <input
                type="tel"
                value={otherNumber}
                onChange={(e) => setOtherNumber(e.target.value)}
                placeholder="Enter phone number"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            )}
          </div>
        </div>
      )}

      {/* Rest of your form fields based on business type */}
      {/* ... (your existing form fields) ... */}

    </form>
  );
};

export default SaleForm;