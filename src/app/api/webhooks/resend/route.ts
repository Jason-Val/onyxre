import { Webhook } from 'svix';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/supabase/database.types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    let event: any;

    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

    if (webhookSecret) {
      // 1. Verify webhook signature if secret is provided (Production)
      const svix_id = req.headers.get("svix-id");
      const svix_timestamp = req.headers.get("svix-timestamp");
      const svix_signature = req.headers.get("svix-signature");

      if (!svix_id || !svix_timestamp || !svix_signature) {
        return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
      }

      const wh = new Webhook(webhookSecret);
      try {
        event = wh.verify(rawBody, {
          "svix-id": svix_id,
          "svix-timestamp": svix_timestamp,
          "svix-signature": svix_signature,
        });
      } catch (err) {
        console.error('Svix signature verification failed', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } else {
      // 2. Bypass for Local/Testing (ONLY if secret is explicitly empty/missing)
      console.warn('⚠️ WARNING: RESEND_WEBHOOK_SECRET is not set. Bypassing signature verification.');
      event = JSON.parse(rawBody);
    }

    const { type, data } = event;
    const emailId = data?.email_id;

    // Use Service Role to bypass RLS since this is a background webhook
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 3. Fallback: Log the raw payload for full debug visibility
    await supabase.from('webhook_logs').insert({
      source: 'resend',
      payload: event as any
    });

    if (!emailId) {
       return NextResponse.json({ message: 'Logged event (no email_id to update)' }, { status: 200 });
    }

    // 4. Update the touchpoint based on the event type
    const now = new Date().toISOString();
    let updateData: any = {};

    switch (type) {
      case 'email.delivered':
        updateData.status = 'delivered';
        break;
      case 'email.opened':
        updateData.opened_at = now;
        break;
      case 'email.clicked':
        updateData.clicked_at = now;
        break;
      case 'email.bounced':
      case 'email.complained':
        updateData.status = 'failed';
        updateData.bounced_at = now;
        updateData.error_log = type;
        break;
      default:
        // Ignore other events
        return NextResponse.json({ message: 'Event type ignored' }, { status: 200 });
    }

    // 5. Commit the actual engagement update to CRM Touchpoints
    const { error: updateError } = await supabase
      .from('crm_campaign_touchpoints')
      .update(updateData)
      .eq('external_id', emailId);

    if (updateError) {
      console.error('Failed to update touchpoint:', updateError);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Webhook processed successfully' });
  } catch (err: any) {
    console.error('Webhook processing error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
