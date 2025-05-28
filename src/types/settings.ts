export interface Settings {
  dashboard?: {
    refreshInterval: number;
    defaultDateRange: '7d' | '30d' | '90d' | '1y';
    showRevenueChart: boolean;
    showProfitChart: boolean;
    showCustomerStats: boolean;
    showExpiringPlans: boolean;
    showRecentSales: boolean;
    alertThresholds: {
      lowStock: number;
      expiringPlans: number;
      paymentOverdue: number;
    };
    chartColors: {
      revenue: string;
      profit: string;
      expenses: string;
    };
  };
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
  smtp?: {
    host: string;
    port: string;
    username: string;
    password: string;
    secure: boolean;
  };
}