import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/resend';

export async function POST(req: Request) {
  try {
    const { to, subject, html } = await req.json();

    if (!to) {
      return NextResponse.json({ error: 'Missing "to" email address' }, { status: 400 });
    }

    const result = await sendEmail({
      to,
      subject: subject || 'Test Email from Loomis CRM',
      html: html || '<p>This is a test email sent via <strong>Resend</strong>!</p>'
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ message: 'Email sent successfully!', data: result.data });

  } catch (error) {
    console.error('Test Resend Route Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
