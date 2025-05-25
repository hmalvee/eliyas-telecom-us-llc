import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { Invoice, Customer, Settings } from '../../types';
import { format } from 'date-fns';
import QRCode from 'qrcode';

// Register fonts
Font.register({
  family: 'Inter',
  fonts: [
    {
      src: 'https://rsms.me/inter/font-files/Inter-Regular.woff2',
      fontWeight: 400,
    },
    {
      src: 'https://rsms.me/inter/font-files/Inter-Medium.woff2',
      fontWeight: 500,
    },
    {
      src: 'https://rsms.me/inter/font-files/Inter-Bold.woff2',
      fontWeight: 700,
    },
  ],
});

// Register Helvetica as fallback
Font.register({
  family: 'Helvetica',
  fonts: [
    {
      src: 'https://db.onlinewebfonts.com/t/5a8e8ddbf44cd03d7a6e3a0f46c5fee6.woff2',
    },
  ],
});

interface InvoicePDFProps {
  invoice: Invoice;
  customer: Customer;
  settings: Settings;
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, customer, settings }) => {
  const [qrCodeUrl, setQrCodeUrl] = React.useState<string>('');

  // Determine which business info to use based on invoice type
  const businessInfo = invoice.businessType?.startsWith('travel_') 
    ? settings.businessInfo.travel 
    : settings.businessInfo.telecom;

  const styles = StyleSheet.create({
    page: {
      padding: 30,
      fontSize: 12,
      fontFamily: 'Inter',
      color: '#333',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 30,
    },
    logo: {
      width: 120,
      height: 50,
      objectFit: 'contain',
    },
    companyInfo: {
      marginBottom: 20,
    },
    customerSection: {
      marginBottom: 30,
    },
    invoiceInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 30,
    },
    table: {
      marginBottom: 30,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: settings.invoiceTemplate.colors.primary + '20',
      borderBottomWidth: 1,
      borderBottomColor: settings.invoiceTemplate.colors.primary,
      paddingVertical: 8,
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
      paddingVertical: 8,
    },
    description: { width: '40%', paddingHorizontal: 8 },
    quantity: { width: '15%', paddingHorizontal: 8 },
    price: { width: '15%', paddingHorizontal: 8 },
    total: { width: '15%', paddingHorizontal: 8 },
    totals: {
      marginTop: 30,
      borderTopWidth: 1,
      borderTopColor: '#e5e7eb',
      paddingTop: 10,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginBottom: 5,
    },
    paymentDetails: {
      marginTop: 30,
      padding: 10,
      backgroundColor: '#f3f4f6',
    },
    signature: {
      marginTop: 50,
      borderTopWidth: 1,
      borderTopColor: '#e5e7eb',
      paddingTop: 10,
    },
    qrCode: {
      marginTop: 20,
      alignItems: 'center',
    },
    footer: {
      position: 'absolute',
      bottom: 30,
      left: 30,
      right: 30,
      textAlign: 'center',
      color: '#6b7280',
      fontSize: 10,
    },
    watermark: settings.invoiceTemplate.showWatermark ? {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%) rotate(-45deg)',
      fontSize: 60,
      color: '#f3f4f6',
      opacity: 0.3,
    } : {},
  });

  React.useEffect(() => {
    if (settings.invoiceTemplate.showQrCode) {
      const generateQRCode = async () => {
        try {
          const url = await QRCode.toDataURL(JSON.stringify({
            invoiceId: invoice.id,
            amount: invoice.total,
            customer: customer.name,
            date: invoice.date
          }));
          setQrCodeUrl(url);
        } catch (err) {
          console.error('Error generating QR code:', err);
        }
      };
      generateQRCode();
    }
  }, [invoice, customer, settings.invoiceTemplate.showQrCode]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.invoiceTemplate.currency || 'USD',
    }).format(amount);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {settings.invoiceTemplate.showWatermark && (
          <View style={styles.watermark}>
            <Text>{invoice.status.toUpperCase()}</Text>
          </View>
        )}

        <View style={styles.header}>
          {businessInfo.logo && (
            <Image src={businessInfo.logo} style={styles.logo} />
          )}
          <View style={styles.companyInfo}>
            <Text style={{ fontSize: 20, color: settings.invoiceTemplate.colors.primary }}>
              {businessInfo.name}
            </Text>
            <Text>{businessInfo.address}</Text>
            <Text>Phone: {businessInfo.phone}</Text>
            <Text>Email: {businessInfo.email}</Text>
          </View>
        </View>

        <View style={styles.customerSection}>
          <Text style={{ fontSize: 14, marginBottom: 8 }}>Bill To:</Text>
          <Text>{customer.name}</Text>
          <Text>{customer.address}</Text>
          <Text>{customer.email}</Text>
          <Text>{customer.phone}</Text>
        </View>

        <View style={styles.invoiceInfo}>
          <View>
            <Text style={{ fontSize: 14 }}>Invoice #{invoice.id.slice(0, 8)}</Text>
            <Text>Date: {format(invoice.date, 'MMM dd, yyyy')}</Text>
            <Text>Due Date: {format(invoice.dueDate, 'MMM dd, yyyy')}</Text>
          </View>
          <View>
            <Text style={{ 
              color: invoice.status === 'paid' ? '#059669' :
                     invoice.status === 'overdue' ? '#dc2626' :
                     '#eab308'
            }}>
              {invoice.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.description}>Description</Text>
            <Text style={styles.quantity}>Qty</Text>
            <Text style={styles.price}>Price</Text>
            <Text style={styles.total}>Total</Text>
          </View>
          
          {invoice.items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.quantity}>{item.quantity}</Text>
              <Text style={styles.price}>{formatCurrency(item.unitPrice)}</Text>
              <Text style={styles.total}>{formatCurrency(item.total)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Subtotal: {formatCurrency(invoice.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Tax: {formatCurrency(invoice.tax)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={{ fontSize: 14, fontWeight: 'bold' }}>
              Total: {formatCurrency(invoice.total)}
            </Text>
          </View>
        </View>

        <View style={styles.paymentDetails}>
          <Text style={{ fontSize: 14, marginBottom: 8 }}>Payment Details:</Text>
          <Text>Bank Name: {businessInfo.name} Business Account</Text>
          <Text>Account Name: {businessInfo.name}</Text>
          <Text>Account Number: XXXX-XXXX-XXXX</Text>
          <Text>Routing Number: XXXXXXXXX</Text>
          <Text>Payment Methods: Cash, Card, Bank Transfer</Text>
        </View>

        {settings.invoiceTemplate.showSignature && (
          <View style={styles.signature}>
            <Text>Authorized Signature:</Text>
            {invoice.signature && (
              <Image src={invoice.signature} style={{ width: 150, height: 50 }} />
            )}
          </View>
        )}

        {settings.invoiceTemplate.showQrCode && qrCodeUrl && (
          <View style={styles.qrCode}>
            <Image src={qrCodeUrl} style={{ width: 100, height: 100 }} />
            <Text style={{ fontSize: 10, marginTop: 5 }}>Scan to view digital copy</Text>
          </View>
        )}

        <Text style={styles.footer}>
          {settings.invoiceTemplate.footer || 'Thank you for your business!'}
        </Text>
      </Page>
    </Document>
  );
};

export default InvoicePDF;