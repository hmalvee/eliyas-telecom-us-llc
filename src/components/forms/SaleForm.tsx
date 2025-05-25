import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Customer, CustomerNumber } from '../../types';

interface SaleFormProps {
  onSuccess?: () => void;
}

interface TelecomRechargeData {
  customerId: string;
  customerNumberId: string | null;
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
  type: 'domestic' | 'international';
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

const SaleForm: React.FC<SaleFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { customers, customerNumbers: allCustomerNumbers, addSale } = useApp();
  const [businessType, setBusinessType] = useState<'telecom_recharge' | 'telecom_phone' | 'telecom_service' | 'travel_domestic' | 'travel_international'>('telecom_recharge');
  const [isPartialPayment, setIsPartialPayment] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<CustomerNumber | null>(null);

  const [telecomRechargeData, setTelecomRechargeData] = useState<TelecomRechargeData>({
    customerId: '',
    customerNumberId: null,
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
            amount: telecomRechargeData.rechargeAmount,
            paymentAmount: telecomRechargeData.paymentAmount,
            date: new Date(),
            paymentMethod: telecomRechargeData.paymentMethod as 'cash' | 'card' | 'online',
            notes: `Recharge for ${selectedNumber?.name} (${selectedNumber?.phoneNumber})`,
            businessType: 'telecom_recharge',
            status: isPartialPayment ? 'partial' : telecomRechargeData.paymentAmount >= telecomRechargeData.rechargeAmount ? 'paid' : 'unpaid'
          };
          break;

        case 'telecom_phone':
          saleData = {
            customerId: selectedCustomer.id,
            amount: telecomPhoneData.price,
            paymentAmount: telecomPhoneData.paymentAmount,
            date: new Date(),
            paymentMethod: telecomPhoneData.paymentMethod as 'cash' | 'card' | 'online',
            notes: `Phone Sale: ${telecomPhoneData.brand} ${telecomPhoneData.model}\nIMEI: ${telecomPhoneData.imei}`,
            businessType: 'telecom_phone',
            status: isPartialPayment ? 'partial' : telecomPhoneData.paymentAmount >= telecomPhoneData.price ? 'paid' : 'unpaid'
          };
          break;

        case 'telecom_service':
          saleData = {
            customerId: selectedCustomer.id,
            amount: telecomServiceData.cost,
            paymentAmount: telecomServiceData.paymentAmount,
            date: new Date(),
            paymentMethod: telecomServiceData.paymentMethod as 'cash' | 'card' | 'online',
            notes: `Service: ${telecomServiceData.serviceType}\n${telecomServiceData.description}`,
            businessType: 'telecom_service',
            status: isPartialPayment ? 'partial' : telecomServiceData.paymentAmount >= telecomServiceData.cost ? 'paid' : 'unpaid'
          };
          break;

        case 'travel_domestic':
        case 'travel_international':
          saleData = {
            customerId: selectedCustomer.id,
            amount: travelData.customerFare,
            paymentAmount: travelData.paymentAmount,
            date: new Date(),
            paymentMethod: travelData.paymentMethod as 'cash' | 'card' | 'online',
            notes: `Route: ${travelData.route}\nType: ${travelData.type}`,
            businessType: businessType,
            profit: travelData.profit,
            status: isPartialPayment ? 'partial' : travelData.paymentAmount >= travelData.customerFare ? 'paid' : 'unpaid'
          };
          break;
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

  const calculateProfit = (ourFare: number, customerFare: number) => {
    const profit = customerFare - ourFare;
    setTravelData(prev => ({ ...prev, profit }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">
          Business Type
        </label>
        <select
          id="businessType"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={businessType}
          onChange={(e) => setBusinessType(e.target.value as any)}
        >
          <option value="telecom_recharge">Eliyas Telecom - Recharge</option>
          <option value="telecom_phone">Eliyas Telecom - Phone Sale</option>
          <option value="telecom_service">Eliyas Telecom - Service</option>
          <option value="travel_domestic">US Tours And Travels - Domestic</option>
          <option value="travel_international">US Tours And Travels - International</option>
        </select>
      </div>

      <div>
        <label htmlFor="customer" className="block text-sm font-medium text-gray-700">
          Customer
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search customer by name, email or phone"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredCustomers.map(customer => (
                <button
                  key={customer.id}
                  type="button"
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none"
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setSearchQuery('');
                  }}
                >
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-gray-600">{customer.email}</div>
                  <div className="text-sm text-gray-600">{customer.phone}</div>
                </button>
              ))}
              {filteredCustomers.length === 0 && (
                <div className="px-4 py-2 text-gray-500">No customers found</div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedCustomer && businessType === 'telecom_recharge' && (
        <div>
          <label htmlFor="customerNumber" className="block text-sm font-medium text-gray-700">
            Customer Number
          </label>
          <select
            id="customerNumber"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={selectedNumber?.id || ''}
            onChange={(e) => {
              const number = customerNumbers.find(n => n.id === e.target.value);
              setSelectedNumber(number || null);
            }}
          >
            <option value="">Select a number</option>
            {customerNumbers.map(number => (
              <option key={number.id} value={number.id}>
                {number.name} - {number.phoneNumber} ({number.carrier})
              </option>
            ))}
          </select>
        </div>
      )}

      {businessType === 'telecom_recharge' && (
        <>
          <div>
            <label htmlFor="rechargeAmount" className="block text-sm font-medium text-gray-700">
              Recharge Amount
            </label>
            <input
              type="number"
              id="rechargeAmount"
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={telecomRechargeData.rechargeAmount}
              onChange={(e) => setTelecomRechargeData(prev => ({ ...prev, rechargeAmount: parseFloat(e.target.value) }))}
            />
          </div>
        </>
      )}

      {businessType === 'telecom_phone' && (
        <>
          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
              Brand
            </label>
            <input
              type="text"
              id="brand"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={telecomPhoneData.brand}
              onChange={(e) => setTelecomPhoneData(prev => ({ ...prev, brand: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700">
              Model
            </label>
            <input
              type="text"
              id="model"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={telecomPhoneData.model}
              onChange={(e) => setTelecomPhoneData(prev => ({ ...prev, model: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="imei" className="block text-sm font-medium text-gray-700">
              IMEI
            </label>
            <input
              type="text"
              id="imei"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={telecomPhoneData.imei}
              onChange={(e) => setTelecomPhoneData(prev => ({ ...prev, imei: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price
            </label>
            <input
              type="number"
              id="price"
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={telecomPhoneData.price}
              onChange={(e) => setTelecomPhoneData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
            />
          </div>
        </>
      )}

      {businessType === 'telecom_service' && (
        <>
          <div>
            <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700">
              Service Type
            </label>
            <select
              id="serviceType"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={telecomServiceData.serviceType}
              onChange={(e) => setTelecomServiceData(prev => ({ ...prev, serviceType: e.target.value }))}
            >
              <option value="">Select service type</option>
              <option value="screen_repair">Screen Repair</option>
              <option value="battery_replacement">Battery Replacement</option>
              <option value="software_update">Software Update</option>
              <option value="unlock">Phone Unlock</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              required
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={telecomServiceData.description}
              onChange={(e) => setTelecomServiceData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="cost" className="block text-sm font-medium text-gray-700">
              Service Cost
            </label>
            <input
              type="number"
              id="cost"
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={telecomServiceData.cost}
              onChange={(e) => setTelecomServiceData(prev => ({ ...prev, cost: parseFloat(e.target.value) }))}
            />
          </div>
        </>
      )}

      {(businessType === 'travel_domestic' || businessType === 'travel_international') && (
        <>
          <div>
            <label htmlFor="route" className="block text-sm font-medium text-gray-700">
              Route
            </label>
            <input
              type="text"
              id="route"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={travelData.route}
              onChange={(e) => setTravelData(prev => ({ ...prev, route: e.target.value }))}
              placeholder="e.g., NYC to LAX"
            />
          </div>

          <div>
            <label htmlFor="ourFare" className="block text-sm font-medium text-gray-700">
              Our Fare
            </label>
            <input
              type="number"
              id="ourFare"
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={travelData.ourFare}
              onChange={(e) => {
                const ourFare = parseFloat(e.target.value);
                setTravelData(prev => ({ ...prev, ourFare }));
                calculateProfit(ourFare, travelData.customerFare);
              }}
            />
          </div>

          <div>
            <label htmlFor="customerFare" className="block text-sm font-medium text-gray-700">
              Customer Fare
            </label>
            <input
              type="number"
              id="customerFare"
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={travelData.customerFare}
              onChange={(e) => {
                const customerFare = parseFloat(e.target.value);
                setTravelData(prev => ({ ...prev, customerFare }));
                calculateProfit(travelData.ourFare, customerFare);
              }}
            />
          </div>

          <div>
            <label htmlFor="profit" className="block text-sm font-medium text-gray-700">
              Profit
            </label>
            <input
              type="number"
              id="profit"
              readOnly
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 shadow-sm"
              value={travelData.profit}
            />
          </div>

          <div>
            <label htmlFor="travelStatus" className="block text-sm font-medium text-gray-700">
              Booking Status
            </label>
            <select
              id="travelStatus"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={travelData.status}
              onChange={(e) => setTravelData(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="issued">Ticket Issued</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </>
      )}

      <div>
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="partialPayment"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={isPartialPayment}
            onChange={(e) => setIsPartialPayment(e.target.checked)}
          />
          <label htmlFor="partialPayment" className="ml-2 block text-sm text-gray-900">
            Partial Payment
          </label>
        </div>

        <div>
          <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700">
            Payment Amount
          </label>
          <input
            type="number"
            id="paymentAmount"
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={
              businessType === 'telecom_recharge'
                ? telecomRechargeData.paymentAmount
                : businessType === 'telecom_phone'
                ? telecomPhoneData.paymentAmount
                : businessType === 'telecom_service'
                ? telecomServiceData.paymentAmount
                : travelData.paymentAmount
            }
            onChange={(e) => {
              const amount = parseFloat(e.target.value);
              switch (businessType) {
                case 'telecom_recharge':
                  setTelecomRechargeData(prev => ({
                    ...prev,
                    paymentAmount: amount,
                    dueAmount: prev.rechargeAmount - amount
                  }));
                  break;
                case 'telecom_phone':
                  setTelecomPhoneData(prev => ({
                    ...prev,
                    paymentAmount: amount,
                    dueAmount: prev.price - amount
                  }));
                  break;
                case 'telecom_service':
                  setTelecomServiceData(prev => ({
                    ...prev,
                    paymentAmount: amount,
                    dueAmount: prev.cost - amount
                  }));
                  break;
                default:
                  setTravelData(prev => ({
                    ...prev,
                    paymentAmount: amount,
                    dueAmount: prev.customerFare - amount
                  }));
              }
            }}
          />
        </div>

        {isPartialPayment && (
          <div className="mt-4">
            <label htmlFor="dueAmount" className="block text-sm font-medium text-gray-700">
              Due Amount
            </label>
            <input
              type="number"
              id="dueAmount"
              readOnly
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 shadow-sm"
              value={
                businessType === 'telecom_recharge'
                  ? telecomRechargeData.dueAmount
                  : businessType === 'telecom_phone'
                  ? telecomPhoneData.dueAmount
                  : businessType === 'telecom_service'
                  ? telecomServiceData.dueAmount
                  : travelData.dueAmount
              }
            />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
          Payment Method
        </label>
        <select
          id="paymentMethod"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={
            businessType === 'telecom_recharge'
              ? telecomRechargeData.paymentMethod
              : businessType === 'telecom_phone'
              ? telecomPhoneData.paymentMethod
              : businessType === 'telecom_service'
              ? telecomServiceData.paymentMethod
              : travelData.paymentMethod
          }
          onChange={(e) => {
            switch (businessType) {
              case 'telecom_recharge':
                setTelecomRechargeData(prev => ({ ...prev, paymentMethod: e.target.value }));
                break;
              case 'telecom_phone':
                setTelecomPhoneData(prev => ({ ...prev, paymentMethod: e.target.value }));
                break;
              case 'telecom_service':
                setTelecomServiceData(prev => ({ ...prev, paymentMethod: e.target.value }));
                break;
              default:
                setTravelData(prev => ({ ...prev, paymentMethod: e.target.value }));
            }
          }}
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
          value={
            businessType === 'telecom_recharge'
              ? telecomRechargeData.notes
              : businessType === 'telecom_phone'
              ? telecomPhoneData.notes
              : businessType === 'telecom_service'
              ? telecomServiceData.notes
              : travelData.notes
          }
          onChange={(e) => {
            switch (businessType) {
              case 'telecom_recharge':
                setTelecomRechargeData(prev => ({ ...prev, notes: e.target.value }));
                break;
              case 'telecom_phone':
                setTelecomPhoneData(prev => ({ ...prev, notes: e.target.value }));
                break;
              case 'telecom_service':
                setTelecomServiceData(prev => ({ ...prev, notes: e.target.value }));
                break;
              default:
                setTravelData(prev => ({ ...prev, notes: e.target.value }));
            }
          }}
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
          Create Sale
        </button>
      </div>
    </form>
  );
};

export default SaleForm;