export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  joinDate: Date;
}

export interface CustomerNumber {
  id: string;
  customerId: string;
  name: string;
  carrier: string;
  customCarrier?: string;
  phoneNumber: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  data: string;
  calls: string;
  texts: string;
}

export interface CustomerPlan {
  id: string;
  customerId: string;
  planId: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'pending';
  reminderSent: boolean;
}

export interface Payment {
  id: string;
  saleId: string;
  amount: number;
  date: Date;
  method: 'cash' | 'card' | 'online';
  notes?: string;
}

export interface Sale {
  id: string;
  customerId: string;
  planId: string;
  amount: number;
  amountPaid: number;
  date: Date;
  paymentMethod: 'cash' | 'card' | 'online';
  status: 'paid' | 'partial' | 'unpaid' | 'not-delivered' | 'pending';
  notes: string;
  business: 'telecom' | 'travel';
}

export interface Invoice {
  id: string;
  customerId: string;
  saleId: string;
  date: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'paid' | 'unpaid' | 'overdue';
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface DashboardStats {
  totalSales: number;
  totalCustomers: number;
  activePlans: number;
  expiringSoon: number;
  revenueToday: number;
  revenueTrend: number[];
}