import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Invoice } from '../../types';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePDF from './InvoicePDF';
import { toast } from 'react-toastify';
import { Mail, Download } from 'lucide-react';

interface InvoiceActionsProps {
  invoice: Invoice;
}

const InvoiceActions: React.FC<InvoiceActionsProps> = ({ invoice }) => {
  const { customers } = useApp();
  const customer = customers.find(c => c.id === invoice.customerId);

  if (!customer) return null;

  const sendInvoiceEmail = async () => {
    try {
      // Create PDF blob
      const blob = await pdf(<InvoicePDF invoice={invoice} customer={customer} />).toBlob();
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result?.toString().split(',')[1];
        
        // Send to edge function
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-invoice`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pdfBase64: base64data,
            customerEmail: customer.email,
            customerName: customer.name,
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          toast.success('Invoice sent successfully');
        } else {
          throw new Error(data.error);
        }
      };
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error('Failed to send invoice');
    }
  };

  return (
    <div className="flex space-x-2">
      <PDFDownloadLink
        document={<InvoicePDF invoice={invoice} customer={customer} />}
        fileName={`invoice-${invoice.id}.pdf`}
        className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        <Download size={16} className="mr-1" />
        <span>Download</span>
      </PDFDownloadLink>
      
      <button
        onClick={sendInvoiceEmail}
        className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        <Mail size={16} className="mr-1" />
        <span>Email</span>
      </button>
    </div>
  );
};

export default InvoiceActions;