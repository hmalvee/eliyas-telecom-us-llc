import { Resend } from 'npm:resend@3.2.0';
import { format } from 'npm:date-fns@3.3.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoice, customer } = await req.json();

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    };

    await resend.emails.send({
      from: 'Eliyas Telecom <invoices@eliyastelecom.com>',
      to: customer.email,
      subject: `Invoice #${invoice.id.slice(0, 8)} from Eliyas Telecom`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Invoice from Eliyas Telecom</h2>
          <p>Dear ${customer.name},</p>
          <p>Please find your invoice details below.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Invoice Details:</h3>
            <p>Invoice Number: #${invoice.id.slice(0, 8)}</p>
            <p>Date: ${format(new Date(invoice.date), 'MMM dd, yyyy')}</p>
            <p>Due Date: ${format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <th style="text-align: left; padding: 8px;">Description</th>
                <th style="text-align: right; padding: 8px;">Amount</th>
              </tr>
              ${invoice.items.map(item => `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 8px;">${item.description}</td>
                  <td style="text-align: right; padding: 8px;">${formatCurrency(item.total)}</td>
                </tr>
              `).join('')}
              <tr>
                <td style="padding: 8px; font-weight: bold;">Subtotal</td>
                <td style="text-align: right; padding: 8px;">${formatCurrency(invoice.subtotal)}</td>
              </tr>
              <tr>
                <td style="padding: 8px;">Tax</td>
                <td style="text-align: right; padding: 8px;">${formatCurrency(invoice.tax)}</td>
              </tr>
              <tr style="font-weight: bold;">
                <td style="padding: 8px;">Total</td>
                <td style="text-align: right; padding: 8px;">${formatCurrency(invoice.total)}</td>
              </tr>
            </table>
          </div>

          <div style="margin: 30px 0;">
            <a href="https://eliyastelecom.com/pay-invoice/${invoice.id}" 
               style="background: #2563eb; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px;">
              Pay Invoice
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            If you have any questions about this invoice, please contact our support team.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `invoice-${invoice.id.slice(0, 8)}.pdf`,
          content: await generateInvoicePDF(invoice, customer),
        },
      ],
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateInvoicePDF(invoice: any, customer: any) {
  // This is a placeholder for PDF generation
  // In a real implementation, you would use a PDF library to generate the PDF
  return Buffer.from('PDF content');
}