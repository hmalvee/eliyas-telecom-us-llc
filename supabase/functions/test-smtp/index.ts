import { SMTPClient } from "npm:emailjs@4.0.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { host, port, username, password, secure } = await req.json();

    const client = new SMTPClient({
      user: username,
      password: password,
      host: host,
      port: parseInt(port),
      ssl: secure,
      tls: !secure,
    });

    try {
      await client.connect();
      await client.quit();
      
      return new Response(
        JSON.stringify({ success: true, message: 'SMTP connection successful!' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'SMTP connection failed. Please check your credentials.',
          error: error.message 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Invalid request',
        error: error.message 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});