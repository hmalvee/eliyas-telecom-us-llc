import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Plan } from '../../types';

interface SaleFormProps {
  onSuccess?: () => void;
}

interface TelecomFormData {
  customerId: string;
  simCarrier: string;
  rechargeNumber: string;
  rechargeAmount: number;
  paymentAmount: number;
  dueAmount: number;
  status: string;
  paymentMethod: string;
  notes: string;
}

interface TravelFormData {
  customerId: string;
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
  const { customers, addSale } = useApp();
  const [business, setBusiness] = useState('telecom');
  const [isPartialPayment, setIsPartialPayment] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [telecomData, setTelecomData] = useState<TelecomFormData>({
    customerId: '',
    simCarrier: '',
    rechargeNumber: '',
    rechargeAmount: 0,
    paymentAmount: 0,
    dueAmount: 0,
    status: 'pending',
    paymentMethod: 'card',
    notes: ''
  });

  const [travelData, setTravelData] = useState<TravelFormData>({
    customerId: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (business === 'telecom') {
      const sale = await addSale({
        customerId: telecomData.customerId,
        amount: telecomData.rechargeAmount,
        date: new Date(),
        paymentMethod: telecomData.paymentMethod as 'cash' | 'card' | 'online',
        notes: `Carrier: ${telecomData.simCarrier}\nNumber: ${telecomData.rechargeNumber}\n${telecomData.notes}`,
        business: 'telecom',
        status: isPartialPayment ? 'partial' : telecomData.paymentAmount >= telecomData.rechargeAmount ? 'paid' : 'unpaid'
      });
    } else {
      const sale = await addSale({
        customerId: travelData.customerId,
        amount: travelData.customerFare,
        date: new Date(),
        paymentMethod: travelData.paymentMethod as 'cash' | 'card' | 'online',
        notes: `Route: ${travelData.route}\nOur Fare: $${travelData.ourFare}\nProfit: $${travelData.profit}\n${travelData.notes}`,
        business: 'travel',
        status: isPartialPayment ? 'partial' : travelData.paymentAmount >= travelData.customerFare ? 'paid' : 'unpaid'
      });
    }

    if (onSuccess) {
      onSuccess();
    }
    navigate('/sales');
  };

  const calculateProfit = (ourFare: number, customerFare: number) => {
    const profit = customerFare - ourFare;
    setTravelData(prev => ({ ...prev, profit }));
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
          value={business}
          onChange={(e) => setBusiness(e.target.value)}
        >
          <option value="telecom">Eliyas Telecom</option>
          <option value="travel">US Tours And Travels</option>
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
                    if (business === 'telecom') {
                      setTelecomData(prev => ({ ...prev, customerId: customer.id }));
                    } else {
                      setTravelData(prev => ({ ...prev, customerId: customer.id }));
                    }
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

      {business === 'telecom' ? (
        <>
          <div>
            <label htmlFor="simCarrier" className="block text-sm font-medium text-gray-700">
              SIM Carrier
            </label>
            <input
              type="text"
              id="simCarrier"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={telecomData.simCarrier}
              onChange={(e) => setTelecomData(prev => ({ ...prev, simCarrier: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="rechargeNumber" className="block text-sm font-medium text-gray-700">
              Number to Recharge
            </label>
            <input
              type="text"
              id="rechargeNumber"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={telecomData.rechargeNumber}
              onChange={(e) => setTelecomData(prev => ({ ...prev, rechargeNumber: e.target.value }))}
            />
          </div>

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
              value={telecomData.rechargeAmount}
              onChange={(e) => setTelecomData(prev => ({ ...prev, rechargeAmount: parseFloat(e.target.value) }))}
            />
          </div>
        </>
      ) : (
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
              Airline Ticketing Status
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
            value={business === 'telecom' ? telecomData.paymentAmount : travelData.paymentAmount}
            onChange={(e) => {
              const amount = parseFloat(e.target.value);
              if (business === 'telecom') {
                setTelecomData(prev => ({
                  ...prev,
                  paymentAmount: amount,
                  dueAmount: telecomData.rechargeAmount - amount
                }));
              } else {
                setTravelData(prev => ({
                  ...prev,
                  paymentAmount: amount,
                  dueAmount: travelData.customerFare - amount
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
              value={business === 'telecom' ? telecomData.dueAmount : travelData.dueAmount}
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
          value={business === 'telecom' ? telecomData.paymentMethod : travelData.paymentMethod}
          onChange={(e) => {
            if (business === 'telecom') {
              setTelecomData(prev => ({ ...prev, paymentMethod: e.target.value }));
            } else {
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
          value={business === 'telecom' ? telecomData.notes : travelData.notes}
          onChange={(e) => {
            if (business === 'telecom') {
              setTelecomData(prev => ({ ...prev, notes: e.target.value }));
            } else {
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