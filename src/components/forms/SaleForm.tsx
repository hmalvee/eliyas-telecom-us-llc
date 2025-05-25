import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Customer, CustomerNumber } from '../../types';
import { Search, X } from 'lucide-react';

interface SaleFormProps {
  onSuccess?: () => void;
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

const SERVICE_TYPES = [
  'Screen Replacement',
  'Battery Replacement',
  'Software Update',
  'Unlock Service',
  'Data Recovery',
  'Other'
];

const SaleForm: React.FC<SaleFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { customers, customerNumbers: allCustomerNumbers, addSale } = useApp();
  
  // Basic form state
  const [businessType, setBusinessType] = useState('telecom_recharge');
  const [isPartialPayment, setIsPartialPayment] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerPopup, setShowCustomerPopup] = useState(false);
  
  // Recharge specific state
  const [selectedNumber, setSelectedNumber] = useState<CustomerNumber | null>(null);
  const [useOtherNumber, setUseOtherNumber] = useState(false);
  const [otherNumber, setOtherNumber] = useState('');
  const [rechargeAmount, setRechargeAmount] = useState(0);
  
  // Phone sale specific state
  const [phoneData, setPhoneData] = useState({
    brand: '',
    model: '',
    imei: '',
    price: 0
  });
  
  // Accessory sale specific state
  const [accessoryData, setAccessoryData] = useState({
    name: '',
    quantity: 1,
    unitPrice: 0
  });
  
  // Service specific state
  const [serviceData, setServiceData] = useState({
    type: SERVICE_TYPES[0],
    customType: '',
    description: '',
    cost: 0
  });
  
  // Travel specific state
  const [travelData, setTravelData] = useState({
    type: 'domestic',
    route: '',
    ourFare: 0,
    customerFare: 0,
    profit: 0,
    status: 'pending'
  });
  
  // Visa processing specific state
  const [visaData, setVisaData] = useState({
    country: '',
    visaType: '',
    processingFee: 0,
    ourCost: 0,
    customerCost: 0
  });
  
  // Common payment data
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    method: 'card',
    notes: ''
  });

  // Filter customers based on search
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

  // Get customer numbers
  const customerNumbers = useMemo(() => {
    if (!selectedCustomer) return [];
    return allCustomerNumbers.filter(n => n.customerId === selectedCustomer.id);
  }, [selectedCustomer, allCustomerNumbers]);

  // Calculate total and due amounts
  const calculateAmounts = (total: number) => {
    if (isPartialPayment) {
      const due = total - paymentData.amount;
      return { paid: paymentData.amount, due, status: 'partial' };
    }
    return { paid: total, due: 0, status: 'paid' };
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    try {
      let saleData: any = {
        customerId: selectedCustomer.id,
        date: new Date(),
        paymentMethod: paymentData.method,
        notes: paymentData.notes,
        businessType
      };

      switch (businessType) {
        case 'telecom_recharge':
          if (!selectedNumber && !useOtherNumber) return;
          saleData = {
            ...saleData,
            customerNumberId: selectedNumber?.id,
            amount: rechargeAmount,
            notes: `${paymentData.notes}\nNumber: ${useOtherNumber ? otherNumber : selectedNumber?.phoneNumber}`
          };
          break;

        case 'telecom_phone':
          saleData = {
            ...saleData,
            amount: phoneData.price,
            notes: `${paymentData.notes}\nBrand: ${phoneData.brand}\nModel: ${phoneData.model}\nIMEI: ${phoneData.imei}`
          };
          break;

        case 'telecom_accessory':
          const accessoryTotal = accessoryData.quantity * accessoryData.unitPrice;
          saleData = {
            ...saleData,
            amount: accessoryTotal,
            notes: `${paymentData.notes}\nItem: ${accessoryData.name}\nQuantity: ${accessoryData.quantity}`
          };
          break;

        case 'telecom_service':
          saleData = {
            ...saleData,
            amount: serviceData.cost,
            notes: `${paymentData.notes}\nService: ${serviceData.type === 'Other' ? serviceData.customType : serviceData.type}\nDescription: ${serviceData.description}`
          };
          break;

        case 'travel_domestic':
        case 'travel_international':
          saleData = {
            ...saleData,
            amount: travelData.customerFare,
            profit: travelData.profit,
            notes: `${paymentData.notes}\nRoute: ${travelData.route}\nStatus: ${travelData.status}`
          };
          break;

        case 'travel_visa':
          const visaProfit = visaData.customerCost - visaData.ourCost;
          saleData = {
            ...saleData,
            amount: visaData.customerCost,
            profit: visaProfit,
            notes: `${paymentData.notes}\nCountry: ${visaData.country}\nVisa Type: ${visaData.visaType}`
          };
          break;
      }

      const { paid, due, status } = calculateAmounts(saleData.amount);
      saleData.amountPaid = paid;
      saleData.status = status;

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
      {/* Business Type Selection */}
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

      {/* Customer Selection */}
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

        {/* Customer Selection Popup */}
        {showCustomerPopup && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="w-full">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left">
                      <h3 className="text-lg font-medium text-gray-900">
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

      {/* Dynamic Fields Based on Business Type */}
      {selectedCustomer && (
        <div className="space-y-6">
          {/* Recharge Fields */}
          {businessType === 'telecom_recharge' && (
            <>
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
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Recharge Amount
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(parseFloat(e.target.value))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {/* Phone Sale Fields */}
          {businessType === 'telecom_phone' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Brand</label>
                <input
                  type="text"
                  value={phoneData.brand}
                  onChange={(e) => setPhoneData({ ...phoneData, brand: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Model</label>
                <input
                  type="text"
                  value={phoneData.model}
                  onChange={(e) => setPhoneData({ ...phoneData, model: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">IMEI</label>
                <input
                  type="text"
                  value={phoneData.imei}
                  onChange={(e) => setPhoneData({ ...phoneData, imei: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={phoneData.price}
                  onChange={(e) => setPhoneData({ ...phoneData, price: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {/* Accessory Sale Fields */}
          {businessType === 'telecom_accessory' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Item Name</label>
                <input
                  type="text"
                  value={accessoryData.name}
                  onChange={(e) => setAccessoryData({ ...accessoryData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={accessoryData.quantity}
                  onChange={(e) => setAccessoryData({ ...accessoryData, quantity: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={accessoryData.unitPrice}
                  onChange={(e) => setAccessoryData({ ...accessoryData, unitPrice: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {/* Service Fields */}
          {businessType === 'telecom_service' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Service Type</label>
                <select
                  value={serviceData.type}
                  onChange={(e) => setServiceData({ ...serviceData, type: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {SERVICE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              {serviceData.type === 'Other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Custom Service Type</label>
                  <input
                    type="text"
                    value={serviceData.customType}
                    onChange={(e) => setServiceData({ ...serviceData, customType: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={serviceData.description}
                  onChange={(e) => setServiceData({ ...serviceData, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Service Cost</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={serviceData.cost}
                  onChange={(e) => setServiceData({ ...serviceData, cost: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {/* Travel Fields */}
          {(businessType === 'travel_domestic' || businessType === 'travel_international') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Route</label>
                <input
                  type="text"
                  value={travelData.route}
                  onChange={(e) => setTravelData({ ...travelData, route: e.target.value })}
                  placeholder="e.g., NYC to LAX"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Our Fare</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={travelData.ourFare}
                  onChange={(e) => {
                    const ourFare = parseFloat(e.target.value);
                    setTravelData({
                      ...travelData,
                      ourFare,
                      profit: travelData.customerFare - ourFare
                    });
                  }}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer Fare</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={travelData.customerFare}
                  onChange={(e) => {
                    const customerFare = parseFloat(e.target.value);
                    setTravelData({
                      ...travelData,
                      customerFare,
                      profit: customerFare - travelData.ourFare
                    });
                  }}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Profit</label>
                <input
                  type="number"
                  readOnly
                  value={travelData.profit}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={travelData.status}
                  onChange={(e) => setTravelData({ ...travelData, status: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="issued">Ticket Issued</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </>
          )}

          {/* Visa Processing Fields */}
          {businessType === 'travel_visa' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <input
                  type="text"
                  value={visaData.country}
                  onChange={(e) => setVisaData({ ...visaData, country: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Visa Type</label>
                <input
                  type="text"
                  value={visaData.visaType}
                  onChange={(e) => setVisaData({ ...visaData, visaType: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Processing Fee</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={visaData.processingFee}
                  onChange={(e) => setVisaData({ ...visaData, processingFee: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Our Cost</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={visaData.ourCost}
                  onChange={(e) => setVisaData({ ...visaData, ourCost: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer Cost</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={visaData.customerCost}
                  onChange={(e) => setVisaData({ ...visaData, customerCost: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {/* Payment Section */}
          <div className="border-t border-gray-200 pt-6">
            <div>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="partialPayment"
                  checked={isPartialPayment}
                  onChange={(e) => setIsPartialPayment(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="partialPayment" className="ml-2 block text-sm text-gray-900">
                  Partial Payment
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Payment Amount
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Payment Method
                </label>
                <select
                  value={paymentData.method}
                  onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="card">Card</option>
                  <option value="cash">Cash</option>
                  <option value="online">Online</option>
                </select>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
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
              Create Sale
            </button>
          </div>
        </div>
      )}
    </form>
  );
};

export default SaleForm;