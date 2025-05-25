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
    business?: 'telecom' | 'travel';
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