import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { render } from '@react-email/components';
import React from 'react';
import { AINurtureEmail } from '@/emails/AINurture';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lead_id, campaign_id, subject, raw_content, scheduled_for } = await req.json();

    if (!lead_id || !subject || !raw_content || !scheduled_for) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch Agent Details (for compiling the email)
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    
    const agentDetails = {
      name: profile ? [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Agent" : "Agent",
      title: (profile as any)?.title || "Real Estate Professional",
      phone: (profile as any)?.phone_number || (profile as any)?.phone || "",
      email: (profile as any)?.email || user.email,
      image: profile?.avatar_url || "",
      headshotUrl: profile?.avatar_url || ""
    };

    // Compile HTML with raw content
    const emailComponent = React.createElement(AINurtureEmail, { 
      contentHtml: raw_content, 
      agentDetails 
    });
    
    const compiledHtml = await render(emailComponent);

    const isDraft = /\[.*?\]/.test(subject) || /\[.*?\]/.test(raw_content);
    const tpStatus = isDraft ? 'draft' : 'pending';

    // Insert into DB
    const { data: insertedTouchpoint, error: insertError } = await supabase
      .from('crm_campaign_touchpoints')
      .insert({
        agent_id: user.id,
        lead_id,
        campaign_id: campaign_id || undefined, // If null, constraints might fail if it's strictly required
        channel: 'Email',
        subject,
        raw_content,
        content: compiledHtml,
        status: tpStatus,
        scheduled_for: scheduled_for
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, compiledHtml, newStatus: tpStatus, newTouchpoint: insertedTouchpoint });

  } catch (error: any) {
    console.error("Failed to create touchpoint:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
