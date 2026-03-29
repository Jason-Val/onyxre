import { Resend } from 'resend';

// Initialize the Resend SDK with the API key from .env.local
const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailProps {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

/**
 * Utility function to send an email via Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  // Using onboarding@resend.dev as default since it's universally permitted on free/sandbox tier
  from = 'Loomis CRM <onboarding@resend.dev>', 
}: SendEmailProps) {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Resend Unexpected Error:', err);
    return { success: false, error: err };
  }
}
