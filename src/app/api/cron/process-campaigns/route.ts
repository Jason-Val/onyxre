import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/resend';
import { Database } from '@/supabase/database.types';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(req: Request) {
  // 1. Verify Vercel Cron Secret for security
  if (
    process.env.NODE_ENV === 'production' &&
    req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. Initialize Supabase Admin Client to bypass RLS for background job
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 3. Fetch all pending touchpoints that are scheduled for today or earlier
    const { data: touchpoints, error: fetchError } = await supabase
      .from('crm_campaign_touchpoints')
      .select('*, leads:lead_id(email, first_name)')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString());

    if (fetchError) {
      throw fetchError;
    }

    if (!touchpoints || touchpoints.length === 0) {
      return NextResponse.json({ message: 'No pending campaigns to process today.' });
    }

    let processedCount = 0;
    let failedCount = 0;

    // 4. Process each touchpoint
    for (const touchpoint of touchpoints) {
      const email = (touchpoint.leads as any)?.email;

      if (!email) {
        // Mark as failed if the lead has no email
        await supabase
          .from('crm_campaign_touchpoints')
          .update({ status: 'failed', error_log: 'Lead has no email address.' })
          .eq('id', touchpoint.id);
        failedCount++;
        continue;
      }

      if (touchpoint.channel.toLowerCase() === 'email') {
        const result = await sendEmail({
          to: email,
          subject: touchpoint.subject || 'Specular OS Update',
          html: touchpoint.content, // HTML format email
        });

        if (result.success) {
          // Success update
          await supabase
            .from('crm_campaign_touchpoints')
            .update({ status: 'processed' })
            .eq('id', touchpoint.id);
          processedCount++;
        } else {
          // Send grid / Resend error
          await supabase
            .from('crm_campaign_touchpoints')
            .update({ 
              status: 'failed', 
              error_log: JSON.stringify(result.error) 
            })
            .eq('id', touchpoint.id);
          failedCount++;
        }
      } else {
        // SMS is not implemented in Resend, mark as pending manual SMS or build a Twilio integration
        await supabase
          .from('crm_campaign_touchpoints')
          .update({ status: 'failed', error_log: 'SMS processing not yet connected.' })
          .eq('id', touchpoint.id);
        failedCount++;
      }
    }

    return NextResponse.json({ 
      message: 'Campaign processing complete', 
      processed: processedCount, 
      failed: failedCount 
    });

  } catch (error) {
    console.error('Process Campaigns Cron Error:', error);
    return NextResponse.json({ error: 'Internal server error while processing campaigns.' }, { status: 500 });
  }
}
