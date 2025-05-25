import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface ExportData {
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
  salesData: any[];
  customerData: any[];
}

export const exportToExcel = (data: ExportData) => {
  // Create workbook
  const wb = utils.book_new();

  // Summary sheet
  const summaryData = [
    ['Business Performance Report'],
    [],
    ['Report Overview'],
    ['Business Type', data.businessType],
    ['Period', `${format(data.dateRange.start, 'MMM dd, yyyy')} - ${format(data.dateRange.end, 'MMM dd, yyyy')}`],
    [],
    ['Financial Metrics'],
    ['Total Revenue', `$${data.metrics.totalRevenue.toFixed(2)}`],
    ['Total Profit', `$${data.metrics.totalProfit.toFixed(2)}`],
    ['Profit Margin', `${data.metrics.profitMargin.toFixed(1)}%`],
    ['Revenue Growth', `${data.metrics.revenueGrowth.toFixed(1)}%`],
    [],
    ['Customer Metrics'],
    ['Unique Customers', data.metrics.uniqueCustomers],
    ['Total Orders', data.metrics.totalSales],
    ['Average Order Value', `$${data.metrics.averageOrderValue.toFixed(2)}`]
  ];

  const ws = utils.aoa_to_sheet(summaryData);
  utils.book_append_sheet(wb, ws, 'Summary');

  // Sales sheet
  if (data.salesData.length > 0) {
    const salesWs = utils.json_to_sheet(data.salesData);
    utils.book_append_sheet(wb, salesWs, 'Sales Data');
  }

  // Customer sheet
  if (data.customerData.length > 0) {
    const customerWs = utils.json_to_sheet(data.customerData);
    utils.book_append_sheet(wb, customerWs, 'Customer Data');
  }

  // Save file
  writeFile(wb, `business-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};

export const exportToCSV = (data: ExportData) => {
  // Convert data to CSV format
  const salesCsv = utils.sheet_to_csv(utils.json_to_sheet(data.salesData));
  const customerCsv = utils.sheet_to_csv(utils.json_to_sheet(data.customerData));

  // Create download links
  const salesBlob = new Blob([salesCsv], { type: 'text/csv;charset=utf-8;' });
  const customerBlob = new Blob([customerCsv], { type: 'text/csv;charset=utf-8;' });

  // Download files
  const salesLink = document.createElement('a');
  salesLink.href = URL.createObjectURL(salesBlob);
  salesLink.download = `sales-data-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  salesLink.click();

  const customerLink = document.createElement('a');
  customerLink.href = URL.createObjectURL(customerBlob);
  customerLink.download = `customer-data-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  customerLink.click();
};

export const exportFinancialSummary = (data: ExportData) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text('Financial Summary Report', 20, 20);
  
  // Period
  doc.setFontSize(12);
  doc.text(`Period: ${format(data.dateRange.start, 'MMM dd, yyyy')} - ${format(data.dateRange.end, 'MMM dd, yyyy')}`, 20, 30);
  
  // Financial metrics table
  autoTable(doc, {
    startY: 40,
    head: [['Metric', 'Value']],
    body: [
      ['Total Revenue', `$${data.metrics.totalRevenue.toFixed(2)}`],
      ['Total Profit', `$${data.metrics.totalProfit.toFixed(2)}`],
      ['Profit Margin', `${data.metrics.profitMargin.toFixed(1)}%`],
      ['Revenue Growth', `${data.metrics.revenueGrowth.toFixed(1)}%`],
      ['Average Order Value', `$${data.metrics.averageOrderValue.toFixed(2)}`]
    ],
  });
  
  // Save PDF
  doc.save(`financial-summary-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};