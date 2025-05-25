export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  joinDate: Date;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in days
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

export interface Sale {
  id: string;
  customerId: string;
  planId: string;
  amount: number;
  date: Date;
  paymentMethod: 'cash' | 'card' | 'online';
  notes: string;
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