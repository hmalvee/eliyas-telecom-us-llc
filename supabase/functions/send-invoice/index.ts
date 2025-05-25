import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Resend } from 'npm:resend@3.2.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { pdfBase64, customerEmail, customerName } = await req.json();

    const data = await resend.emails.send({
      from: 'Eliyas Telecom <invoices@eliyastelecom.com>',
      to: customerEmail,
      subject: 'Your Invoice from Eliyas Telecom',
      html: `
        <h1>Invoice from Eliyas Telecom</h1>
        <p>Dear ${customerName},</p>
        <p>Please find your invoice attached.</p>
        <p>Thank you for your business!</p>
      `,
      attachments: [
        {
          filename: 'invoice.pdf',
          content: pdfBase64,
        },
      ],
    });

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders,
        } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
        status: 400,
      }
    );
  }
});