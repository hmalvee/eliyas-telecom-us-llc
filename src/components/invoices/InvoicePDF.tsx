import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Invoice, Customer } from '../../types';
import { format } from 'date-fns';

interface InvoicePDFProps {
  invoice: Invoice;
  customer: Customer;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  header: {
    marginBottom: 30,
  },
  companyName: {
    fontSize: 24,
    marginBottom: 10,
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
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 5,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
  },
  description: { width: '60%' },
  quantity: { width: '10%' },
  price: { width: '15%' },
  total: { width: '15%' },
  totals: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#000',
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
});

const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, customer }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.companyName}>Eliyas Telecom USA</Text>
        <View style={styles.companyDetails}>
          <Text>123 Business Street</Text>
          <Text>City, State 12345</Text>
          <Text>Phone: (555) 123-4567</Text>
          <Text>Email: billing@eliyastelecom.com</Text>
        </View>
      </View>

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
          <Text>Date: {format(invoice.date, 'MM/dd/yyyy')}</Text>
          <Text>Due Date: {format(invoice.dueDate, 'MM/dd/yyyy')}</Text>
        </View>
        <View>
          <Text style={styles.bold}>Status: {invoice.status.toUpperCase()}</Text>
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
            <Text style={styles.price}>${item.unitPrice.toFixed(2)}</Text>
            <Text style={styles.total}>${item.total.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text style={styles.bold}>Subtotal: ${invoice.subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.bold}>Tax: ${invoice.tax.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={[styles.bold, { fontSize: 14 }]}>
            Total: ${invoice.total.toFixed(2)}
          </Text>
        </View>
      </View>
    </Page>
  </Document>
);

export default InvoicePDF;