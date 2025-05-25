import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Invoice, Customer, InvoiceTemplate } from '../../types';
import { format } from 'date-fns';
import QRCode from 'qrcode';

interface InvoicePDFProps {
  invoice: Invoice;
  customer: Customer;
  template?: InvoiceTemplate;
}

const defaultTemplate: InvoiceTemplate = {
  id: 'default',
  name: 'Standard Template',
  style: {
    primaryColor: '#3b82f6',
    secondaryColor: '#1d4ed8',
    fontFamily: 'Helvetica',
    fontSize: 12,
    layout: 'standard'
  },
  sections: {
    header: true,
    footer: true,
    watermark: false,
    signature: true,
    qrCode: true
  },
  customFields: []
};

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
  },
  companyName: {
    fontSize: 24,
    marginBottom: 10,
    color: '#3b82f6',
  },
  companyDetails: {
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
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
  tax: { width: '15%', paddingHorizontal: 8 },
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
  bold: {
    fontWeight: 'bold',
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
  notes: {
    marginTop: 30,
    padding: 10,
    backgroundColor: '#f3f4f6',
  },
  terms: {
    marginTop: 20,
    fontSize: 10,
    color: '#6b7280',
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: 60,
    color: '#f3f4f6',
    opacity: 0.3,
  },
});

const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, customer, template = defaultTemplate }) => {
  const [qrCodeUrl, setQrCodeUrl] = React.useState<string>('');

  React.useEffect(() => {
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

    if (template.sections.qrCode) {
      generateQRCode();
    }
  }, [invoice, customer, template.sections.qrCode]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency || 'USD',
    }).format(amount * (invoice.exchangeRate || 1));
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {template.sections.watermark && (
          <View style={styles.watermark}>
            <Text>{invoice.status.toUpperCase()}</Text>
          </View>
        )}

        {template.sections.header && (
          <View style={styles.header}>
            <Text style={styles.companyName}>Eliyas Telecom USA</Text>
            <View style={styles.companyDetails}>
              <Text>123 Business Street</Text>
              <Text>City, State 12345</Text>
              <Text>Phone: (555) 123-4567</Text>
              <Text>Email: billing@eliyastelecom.com</Text>
            </View>
          </View>
        )}

        <View style={styles.customerSection}>
          <Text style={styles.bold}>Bill To:</Text>
          <Text>{customer.name}</Text>
          <Text>{customer.address}</Text>
          <Text>{customer.email}</Text>
          <Text>{customer.phone}</Text>
        </View>

        <View style={styles.invoiceInfo}>
          <View>
            <Text style={styles.bold}>Invoice #{invoice.id}</Text>
            <Text>Date: {format(invoice.date, 'MMM dd, yyyy')}</Text>
            <Text>Due Date: {format(invoice.dueDate, 'MMM dd, yyyy')}</Text>
          </View>
          <View>
            <Text style={[styles.bold, { color: 
              invoice.status === 'paid' ? '#059669' :
              invoice.status === 'overdue' ? '#dc2626' :
              '#eab308'
            }]}>
              {invoice.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.description}>Description</Text>
            <Text style={styles.quantity}>Qty</Text>
            <Text style={styles.price}>Price</Text>
            <Text style={styles.tax}>Tax</Text>
            <Text style={styles.total}>Total</Text>
          </View>
          
          {invoice.items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <View style={styles.description}>
                <Text>{item.description}</Text>
                {item.notes && <Text style={{ fontSize: 10, color: '#6b7280' }}>{item.notes}</Text>}
              </View>
              <Text style={styles.quantity}>{item.quantity}</Text>
              <Text style={styles.price}>{formatCurrency(item.unitPrice)}</Text>
              <Text style={styles.tax}>{formatCurrency(item.tax || 0)}</Text>
              <Text style={styles.total}>{formatCurrency(item.total)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.bold}>Subtotal: {formatCurrency(invoice.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.bold}>Tax: {formatCurrency(invoice.tax)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.bold, { fontSize: 14 }]}>
              Total: {formatCurrency(invoice.total)}
            </Text>
          </View>
        </View>

        {invoice.paymentSchedule && invoice.paymentSchedule.length > 0 && (
          <View style={styles.notes}>
            <Text style={styles.bold}>Payment Schedule:</Text>
            {invoice.paymentSchedule.map((payment, index) => (
              <Text key={index}>
                {format(payment.dueDate, 'MMM dd, yyyy')}: {formatCurrency(payment.amount)}
                {payment.status === 'paid' ? ' (Paid)' : ''}
              </Text>
            ))}
          </View>
        )}

        {invoice.notes && invoice.notes.length > 0 && (
          <View style={styles.notes}>
            <Text style={styles.bold}>Notes:</Text>
            {invoice.notes.map((note, index) => (
              <Text key={index}>{note}</Text>
            ))}
          </View>
        )}

        {invoice.terms && invoice.terms.length > 0 && (
          <View style={styles.terms}>
            <Text style={styles.bold}>Terms and Conditions:</Text>
            {invoice.terms.map((term, index) => (
              <Text key={index}>• {term}</Text>
            ))}
          </View>
        )}

        {template.sections.signature && invoice.signature && (
          <View style={styles.signature}>
            <Text style={styles.bold}>Authorized Signature:</Text>
            <Image src={invoice.signature} style={{ width: 150, height: 50 }} />
          </View>
        )}

        {template.sections.qrCode && qrCodeUrl && (
          <View style={styles.qrCode}>
            <Image src={qrCodeUrl} style={{ width: 100, height: 100 }} />
            <Text style={{ fontSize: 10, marginTop: 5 }}>Scan to view digital copy</Text>
          </View>
        )}

        {template.sections.footer && (
          <Text style={[styles.terms, { textAlign: 'center', marginTop: 40 }]}>
            Thank you for your business!
          </Text>
        )}
      </Page>
    </Document>
  );
};

export default InvoicePDF;