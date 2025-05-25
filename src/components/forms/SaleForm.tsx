import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Customer, CustomerNumber } from '../../types';
import { Search } from 'lucide-react';

interface SaleFormProps {
  onSuccess?: () => void;
}

const BUSINESS_TYPES = [
  { name: 'Eliyas Telecom US LLC', types: [
    { id: 'telecom_recharge', label: 'Recharge' },
    { id: 'telecom_phone', label: 'Phone Sale' },
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerPopup, setShowCustomerPopup] = useState(false);
  
  // Payment and status state
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'partial' | 'unpaid'>('paid');
  const [orderStatus, setOrderStatus] = useState<'delivered' | 'canceled' | 'processing'>('processing');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'online'>('card');
  
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
    profit: 0
  });
  
  // Notes
  const [notes, setNotes] = useState('');

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

  // Calculate total amount based on business type
  const calculateTotalAmount = () => {
    switch (businessType) {
      case 'telecom_recharge':
        return rechargeAmount;
      case 'telecom_phone':
        return phoneData.price;
      case 'telecom_service':
        return serviceData.cost;
      case 'travel_domestic':
      case 'travel_international':
        return travelData.customerFare;
      default:
        return 0;
    }
  };

  // Calculate due amount
  const calculateDueAmount = () => {
    const totalAmount = calculateTotalAmount();
    return paymentStatus === 'partial' ? totalAmount - paymentAmount : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    try {
      let amount = calculateTotalAmount();
      let finalNotes = notes;

      // Set amount based on business type
      switch (businessType) {
        case 'telecom_recharge':
          finalNotes = `${notes}\nNumber: ${useOtherNumber ? otherNumber : selectedNumber?.phoneNumber || selectedCustomer.phone}`;
          break;
        case 'telecom_phone':
          finalNotes = `${notes}\nBrand: ${phoneData.brand}\nModel: ${phoneData.model}\nIMEI: ${phoneData.imei}`;
          break;
        case 'telecom_service':
          finalNotes = `${notes}\nService: ${serviceData.type === 'Other' ? serviceData.customType : serviceData.type}\nDescription: ${serviceData.description}`;
          break;
        case 'travel_domestic':
        case 'travel_international':
          finalNotes = `${notes}\nRoute: ${travelData.route}`;
          break;
      }

      const saleData = {
        customerId: selectedCustomer.id,
        customerNumberId: selectedNumber?.id,
        amount,
        amountPaid: paymentStatus === 'paid' ? amount : paymentStatus === 'partial' ? paymentAmount : 0,
        date: new Date(),
        paymentMethod,
        paymentStatus,
        orderStatus,
        notes: finalNotes,
        businessType,
        profit: travelData.profit || 0
      };

      await addSale(saleData);
      
      if (onSuccess) {
        onSuccess();
      }

      // Redirect based on business type
      if (businessType === 'telecom_recharge') {
        navigate('/recharge-history');
      } else {
        navigate('/sales');
      }
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
        <label className="block text-sm font-medium text-gray-700">Customer</label>
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
                  {/* Main Profile Number */}
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="phoneNumber"
                      value="main"
                      checked={!selectedNumber && !useOtherNumber}
                      onChange={() => {
                        setSelectedNumber(null);
                        setUseOtherNumber(false);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span>
                      Main Profile - {selectedCustomer.phone}
                    </span>
                  </label>

                  {/* Family Numbers */}
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

                  {/* Other Number Option */}
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
            </>
          )}

          {/* Status Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as 'paid' | 'partial' | 'unpaid')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Order Status</label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value as 'delivered' | 'canceled' | 'processing')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="delivered">Delivered</option>
                  <option value="canceled">Canceled</option>
                  <option value="processing">Processing</option>
                </select>
              </div>
            </div>

            {paymentStatus === 'partial' && (
              <>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Payment Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(parseFloat(e.target.value))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Due Amount
                  </label>
                  <div className="mt-1 text-lg font-medium text-red-600">
                    ${calculateDueAmount().toFixed(2)}
                  </div>
                </div>
              </>
            )}

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'card' | 'online')}
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
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
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