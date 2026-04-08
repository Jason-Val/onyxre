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

    const { id, subject, raw_content } = await req.json();

    if (!id || !subject || !raw_content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get current touchpoint to ensure they own it & recompile the HTML
    const { data: touchpoint, error: fetchError } = await supabase
      .from('crm_campaign_touchpoints')
      .select('agent_id, lead_id, crm_campaigns(agent_id)')
      .eq('id', id)
      .single();

    if (fetchError || !touchpoint) {
      return NextResponse.json({ error: "Touchpoint not found" }, { status: 404 });
    }

    // Fetch Agent Details (for re-compiling the email)
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    
    const agentDetails = {
      name: profile ? [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Agent" : "Agent",
      title: (profile as any)?.title || "Real Estate Professional",
      phone: (profile as any)?.phone_number || (profile as any)?.phone || "",
      email: (profile as any)?.email || user.email,
      image: profile?.avatar_url || "",
      headshotUrl: profile?.avatar_url || ""
    };

    // Re-compile HTML with edited raw content
    const emailComponent = React.createElement(AINurtureEmail, { 
      contentHtml: raw_content, 
      agentDetails 
    });
    
    const compiledHtml = await render(emailComponent);

    // Update in DB
    const { error: updateError } = await supabase
      .from('crm_campaign_touchpoints')
      .update({
        subject,
        raw_content,
        content: compiledHtml,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('agent_id', user.id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, compiledHtml });

  } catch (error: any) {
    console.error("Failed to update touchpoint:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
