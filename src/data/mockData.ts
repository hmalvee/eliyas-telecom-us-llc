import { Customer, Plan, CustomerPlan, Sale, Invoice, DashboardStats } from '../types';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Generate dates
const today = new Date();
const getRandomDate = (daysBack = 365) => {
  const date = new Date(today);
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date;
};

const getFutureDate = (daysAhead = 30) => {
  const date = new Date(today);
  date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead));
  return date;
};

// Mock Plans
export const plans: Plan[] = [
  {
    id: 'plan1',
    name: 'Basic Plan',
    description: 'Essential coverage for everyday use',
    price: 29.99,
    duration: 30,
    data: '3 GB',
    calls: 'Unlimited',
    texts: 'Unlimited',
  },
  {
    id: 'plan2',
    name: 'Standard Plan',
    description: 'Great coverage for regular users',
    price: 49.99,
    duration: 30,
    data: '10 GB',
    calls: 'Unlimited',
    texts: 'Unlimited',
  },
  {
    id: 'plan3',
    name: 'Premium Plan',
    description: 'Ultimate coverage for heavy users',
    price: 69.99,
    duration: 30,
    data: 'Unlimited',
    calls: 'Unlimited',
    texts: 'Unlimited',
  },
  {
    id: 'plan4',
    name: 'Family Plan',
    description: 'Coverage for the whole family',
    price: 99.99,
    duration: 30,
    data: '30 GB Shared',
    calls: 'Unlimited',
    texts: 'Unlimited',
  },
  {
    id: 'plan5',
    name: 'International Plan',
    description: 'Great for travelers',
    price: 79.99,
    duration: 30,
    data: '15 GB (2GB International)',
    calls: 'Unlimited + 300 Int\'l Minutes',
    texts: 'Unlimited + 300 Int\'l Texts',
  },
];

// Mock Customers
export const customers: Customer[] = [
  {
    id: 'cust1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '(555) 123-4567',
    address: '123 Main St, Anytown, CA 90210',
    joinDate: getRandomDate(180),
  },
  {
    id: 'cust2',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '(555) 987-6543',
    address: '456 Oak Ave, Somecity, NY 10001',
    joinDate: getRandomDate(90),
  },
  {
    id: 'cust3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    phone: '(555) 456-7890',
    address: '789 Pine Rd, Otherville, TX 75001',
    joinDate: getRandomDate(60),
  },
  {
    id: 'cust4',
    name: 'Sarah Williams',
    email: 'sarah.williams@example.com',
    phone: '(555) 321-7654',
    address: '321 Elm Blvd, Somewhere, IL 60007',
    joinDate: getRandomDate(30),
  },
  {
    id: 'cust5',
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    phone: '(555) 234-5678',
    address: '654 Maple Dr, Anywhere, WA 98001',
    joinDate: getRandomDate(15),
  },
];

// Mock Customer Plans
export const customerPlans: CustomerPlan[] = [
  {
    id: 'cp1',
    customerId: 'cust1',
    planId: 'plan2',
    startDate: getRandomDate(25),
    endDate: getFutureDate(5),
    status: 'active',
    reminderSent: false,
  },
  {
    id: 'cp2',
    customerId: 'cust2',
    planId: 'plan3',
    startDate: getRandomDate(15),
    endDate: getFutureDate(15),
    status: 'active',
    reminderSent: false,
  },
  {
    id: 'cp3',
    customerId: 'cust3',
    planId: 'plan1',
    startDate: getRandomDate(35),
    endDate: getRandomDate(-5),
    status: 'expired',
    reminderSent: true,
  },
  {
    id: 'cp4',
    customerId: 'cust4',
    planId: 'plan5',
    startDate: getRandomDate(10),
    endDate: getFutureDate(20),
    status: 'active',
    reminderSent: false,
  },
  {
    id: 'cp5',
    customerId: 'cust5',
    planId: 'plan4',
    startDate: getRandomDate(5),
    endDate: getFutureDate(25),
    status: 'active',
    reminderSent: false,
  },
];

// Mock Sales
export const sales: Sale[] = [
  {
    id: 'sale1',
    customerId: 'cust1',
    planId: 'plan2',
    amount: 49.99,
    date: getRandomDate(25),
    paymentMethod: 'card',
    notes: 'Renewed plan',
  },
  {
    id: 'sale2',
    customerId: 'cust2',
    planId: 'plan3',
    amount: 69.99,
    date: getRandomDate(15),
    paymentMethod: 'cash',
    notes: 'New customer',
  },
  {
    id: 'sale3',
    customerId: 'cust3',
    planId: 'plan1',
    amount: 29.99,
    date: getRandomDate(35),
    paymentMethod: 'online',
    notes: '',
  },
  {
    id: 'sale4',
    customerId: 'cust4',
    planId: 'plan5',
    amount: 79.99,
    date: getRandomDate(10),
    paymentMethod: 'card',
    notes: 'Added international option',
  },
  {
    id: 'sale5',
    customerId: 'cust5',
    planId: 'plan4',
    amount: 99.99,
    date: getRandomDate(5),
    paymentMethod: 'cash',
    notes: 'Family plan setup',
  },
  {
    id: 'sale6',
    customerId: 'cust1',
    planId: 'plan1',
    amount: 29.99,
    date: getRandomDate(2),
    paymentMethod: 'card',
    notes: 'Additional line',
  },
  {
    id: 'sale7',
    customerId: 'cust2',
    planId: 'plan2',
    amount: 49.99,
    date: getRandomDate(1),
    paymentMethod: 'online',
    notes: 'Added second line',
  },
];

// Mock Invoices
export const invoices: Invoice[] = [
  {
    id: 'inv1',
    customerId: 'cust1',
    saleId: 'sale1',
    date: getRandomDate(25),
    dueDate: getRandomDate(10),
    items: [
      {
        id: 'item1',
        description: 'Standard Plan - Monthly Subscription',
        quantity: 1,
        unitPrice: 49.99,
        total: 49.99,
      }
    ],
    subtotal: 49.99,
    tax: 4.50,
    total: 54.49,
    status: 'paid',
  },
  {
    id: 'inv2',
    customerId: 'cust2',
    saleId: 'sale2',
    date: getRandomDate(15),
    dueDate: getFutureDate(15),
    items: [
      {
        id: 'item2',
        description: 'Premium Plan - Monthly Subscription',
        quantity: 1,
        unitPrice: 69.99,
        total: 69.99,
      }
    ],
    subtotal: 69.99,
    tax: 6.30,
    total: 76.29,
    status: 'paid',
  },
  {
    id: 'inv3',
    customerId: 'cust3',
    saleId: 'sale3',
    date: getRandomDate(35),
    dueDate: getRandomDate(-5),
    items: [
      {
        id: 'item3',
        description: 'Basic Plan - Monthly Subscription',
        quantity: 1,
        unitPrice: 29.99,
        total: 29.99,
      }
    ],
    subtotal: 29.99,
    tax: 2.70,
    total: 32.69,
    status: 'overdue',
  },
  {
    id: 'inv4',
    customerId: 'cust4',
    saleId: 'sale4',
    date: getRandomDate(10),
    dueDate: getFutureDate(5),
    items: [
      {
        id: 'item4',
        description: 'International Plan - Monthly Subscription',
        quantity: 1,
        unitPrice: 79.99,
        total: 79.99,
      }
    ],
    subtotal: 79.99,
    tax: 7.20,
    total: 87.19,
    status: 'unpaid',
  },
  {
    id: 'inv5',
    customerId: 'cust5',
    saleId: 'sale5',
    date: getRandomDate(5),
    dueDate: getFutureDate(10),
    items: [
      {
        id: 'item5',
        description: 'Family Plan - Monthly Subscription',
        quantity: 1,
        unitPrice: 99.99,
        total: 99.99,
      }
    ],
    subtotal: 99.99,
    tax: 9.00,
    total: 108.99,
    status: 'paid',
  },
];

// Dashboard Stats
export const dashboardStats: DashboardStats = {
  totalSales: sales.length,
  totalCustomers: customers.length,
  activePlans: customerPlans.filter(cp => cp.status === 'active').length,
  expiringSoon: customerPlans.filter(cp => {
    const daysUntilExpiry = Math.floor((cp.endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return cp.status === 'active' && daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
  }).length,
  revenueToday: sales
    .filter(sale => sale.date.toDateString() === today.toDateString())
    .reduce((sum, sale) => sum + sale.amount, 0),
  revenueTrend: Array(7).fill(0).map((_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - 6 + i);
    const dateString = date.toDateString();
    return sales
      .filter(sale => sale.date.toDateString() === dateString)
      .reduce((sum, sale) => sum + sale.amount, 0);
  }),
};