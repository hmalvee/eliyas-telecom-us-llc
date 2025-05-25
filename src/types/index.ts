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
  planId?: string;
  amount: number;
  amountPaid: number;
  date: Date;
  paymentMethod: 'cash' | 'card' | 'online';
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  orderStatus: 'delivered' | 'canceled' | 'processing';
  notes: string;
  businessType?: 'telecom_recharge' | 'telecom_phone' | 'telecom_service' | 'telecom_other' | 'travel_domestic' | 'travel_international' | 'travel_visa' | 'travel_custom';
  customerNumberId?: string;
  profit?: number;
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
  currency: string;
  exchangeRate: number;
  template: 'standard' | 'professional' | 'minimal';
  notes: string[];
  terms: string[];
  paymentSchedule?: PaymentSchedule[];
  signature?: string;
  qrCode?: string;
  customFields: { [key: string]: string };
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  tax?: number;
  discount?: number;
  category?: string;
  notes?: string;
}

export interface PaymentSchedule {
  dueDate: Date;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  paymentMethod?: string;
  notes?: string;
}

export interface DashboardStats {
  totalSales: number;
  totalCustomers: number;
  activePlans: number;
  expiringSoon: number;
  revenueToday: number;
  revenueTrend: number[];
}

export interface Settings {
  businessInfo: {
    telecom: {
      name: string;
      logo: string;
      address: string;
      phone: string;
      email: string;
    };
    travel: {
      name: string;
      logo: string;
      address: string;
      phone: string;
      email: string;
    };
  };
  invoiceTemplate: {
    colors: {
      primary: string;
      secondary: string;
    };
    font: string;
    showQrCode: boolean;
    showSignature: boolean;
    showWatermark: boolean;
    footer: string;
    currency: string;
    template: 'standard' | 'professional' | 'minimal';
  };
  email: {
    senderName: string;
    senderEmail: string;
    subject: string;
    template: string;
  };
}