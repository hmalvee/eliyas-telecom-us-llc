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
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: 150,
  },
  value: {
    flex: 1,
  },
});

interface PDFReportProps {
  data: {
    businessType: string;
    timeRange: string;
    metrics: {
      totalRevenue: number;
      totalProfit: number;
      profitMargin: number;
      revenueGrowth: number;
      uniqueCustomers: number;
      totalSales: number;
      averageOrderValue: number;
    };
    dateRange: {
      start: Date;
      end: Date;
    };
  };
}

export const PDFReport: React.FC<PDFReportProps> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Business Performance Report</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Report Overview</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Business Type:</Text>
          <Text style={styles.value}>{data.businessType}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Period:</Text>
          <Text style={styles.value}>
            {format(data.dateRange.start, 'MMM dd, yyyy')} - {format(data.dateRange.end, 'MMM dd, yyyy')}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial Metrics</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Total Revenue:</Text>
          <Text style={styles.value}>${data.metrics.totalRevenue.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total Profit:</Text>
          <Text style={styles.value}>${data.metrics.totalProfit.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Profit Margin:</Text>
          <Text style={styles.value}>{data.metrics.profitMargin.toFixed(1)}%</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Revenue Growth:</Text>
          <Text style={styles.value}>{data.metrics.revenueGrowth.toFixed(1)}%</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Metrics</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Unique Customers:</Text>
          <Text style={styles.value}>{data.metrics.uniqueCustomers}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total Orders:</Text>
          <Text style={styles.value}>{data.metrics.totalSales}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Average Order Value:</Text>
          <Text style={styles.value}>${data.metrics.averageOrderValue.toFixed(2)}</Text>
        </View>
      </View>
    </Page>
  </Document>
);