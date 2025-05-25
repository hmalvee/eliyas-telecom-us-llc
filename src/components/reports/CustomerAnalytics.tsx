import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  table: {
    display: 'table',
    width: 'auto',
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
  },
  tableCell: {
    padding: 5,
    flex: 1,
  },
});

interface CustomerAnalyticsProps {
  data: {
    customers: any[];
    metrics: {
      uniqueCustomers: number;
      averageOrderValue: number;
      totalSales: number;
    };
    dateRange: {
      start: Date;
      end: Date;
    };
  };
}

export const CustomerAnalytics = ({ data }: CustomerAnalyticsProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Customer Analytics Report</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Report Period</Text>
        <Text>
          {format(data.dateRange.start, 'MMM dd, yyyy')} - {format(data.dateRange.end, 'MMM dd, yyyy')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.tableCell}>
              <Text>Metric</Text>
            </View>
            <View style={styles.tableCell}>
              <Text>Value</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text>Unique Customers</Text>
            </View>
            <View style={styles.tableCell}>
              <Text>{data.metrics.uniqueCustomers}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text>Average Order Value</Text>
            </View>
            <View style={styles.tableCell}>
              <Text>${data.metrics.averageOrderValue.toFixed(2)}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text>Total Orders</Text>
            </View>
            <View style={styles.tableCell}>
              <Text>{data.metrics.totalSales}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Details</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.tableCell}>
              <Text>Customer</Text>
            </View>
            <View style={styles.tableCell}>
              <Text>Orders</Text>
            </View>
            <View style={styles.tableCell}>
              <Text>Total Spent</Text>
            </View>
          </View>
          {data.customers.map((customer, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text>{customer.name}</Text>
              </View>
              <View style={styles.tableCell}>
                <Text>{customer.orders}</Text>
              </View>
              <View style={styles.tableCell}>
                <Text>${customer.totalSpent.toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);