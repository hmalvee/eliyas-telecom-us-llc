import { Resend } from 'npm:resend@3.2.0';

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
    const { customer, rechargeDetails, type } = await req.json();

    const subject = type === 'expiring' 
      ? 'Your Plan is Expiring Soon'
      : 'Your Plan Has Expired';

    const daysText = type === 'expiring'
      ? 'will expire in 3 days'
      : 'has expired';

    await resend.emails.send({
      from: 'Eliyas Telecom <notifications@eliyastelecom.com>',
      to: customer.email,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Plan Expiry Notification</h2>
          <p>Dear ${customer.name},</p>
          <p>Your mobile plan ${daysText}.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Plan Details:</h3>
            <p>Phone Number: ${rechargeDetails.phoneNumber}</p>
            <p>Expiry Date: ${rechargeDetails.expiryDate}</p>
            <p>Amount: $${rechargeDetails.amount}</p>
          </div>

          <p>To ensure uninterrupted service, please recharge your plan before it expires.</p>
          
          <div style="margin: 30px 0;">
            <a href="https://eliyastelecom.com/recharge" 
               style="background: #2563eb; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px;">
              Recharge Now
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            If you have any questions, please contact our support team.
          </p>
        </div>
      `,
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