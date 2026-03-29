
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function testResend() {
  console.log('Attempting to send a test email to delivered@resend.dev (Resends built-in success simulator address)...');
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', 
      to: 'delivered@resend.dev', 
      subject: 'Resend Test Delivery',
      html: '<h1>Success!</h1><p>The Resend SDK and API Key from your .env.local are wired up perfectly.</p>',
    });

    if (error) {
      console.error('❌ Resend API Error:', error);
      return;
    }

    console.log('✅ Test Email Dispatched Successfully!', data);
  } catch (err) {
    console.error('❌ Unexpected Error:', err);
  }
}

testResend();