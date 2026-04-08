import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { render } from "@react-email/render";
import AINurtureEmail from "@/emails/AINurture";
import React from "react";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();

    const {
      property,
      first_name,
      last_name,
      email,
      phone,
      working_with_realtor,
      keep_me_informed,
      immediate_email
    } = body;

    // Determine Heat Index
    let heat_index = "WARM";
    if (keep_me_informed && !working_with_realtor) heat_index = "HOT";
    if (!keep_me_informed && working_with_realtor) heat_index = "COLD";

    // 1. Insert the Lead
    const leadPayload = {
      agent_id: property.agent_id,
      first_name,
      last_name,
      email,
      phone,
      status: "NEW",
      heat_index,
      internal_notes: `Source: Open House\nAttended open house for: ${property.address_line1}\nWorking with realtor: ${working_with_realtor ? 'Yes' : 'No'}\nKeep informed: ${keep_me_informed ? 'Yes' : 'No'}`
    };

    const { data: leadData, error: leadError } = await supabase.from("leads").insert(leadPayload as any).select().single();

    if (leadError || !leadData) {
      console.error("Failed to insert lead:", leadError);
      return NextResponse.json({ error: "Failed to insert lead" }, { status: 500 });
    }

    // 2. Fetch Agent Details for the Email
    const { data: agentData } = await supabase.from("profiles").select("*").eq("id", property.agent_id).single();
    const agentProfile = agentData as any;
    
    const agentDetails = {
      name: agentProfile ? `${agentProfile.first_name} ${agentProfile.last_name}` : "Your Agent",
      title: "Real Estate Agent",
      phone: agentProfile?.phone || "",
      email: agentProfile?.email || "",
      headshotUrl: agentProfile?.avatar_url || "",
      brokerage: property.brokerage_name,
      address: "",
      website: ""
    };

    // Queue standard open house campaign if missing
    let campaign;
    const { data: existingCampaign } = await supabase.from("crm_campaigns").select().eq("name", "Open House Automations").eq("agent_id", property.agent_id).maybeSingle();
    
    if (existingCampaign) {
       campaign = existingCampaign;
    } else {
       const { data: newCampaign } = await supabase.from("crm_campaigns").insert({
          organization_id: property.org_id,
          agent_id: property.agent_id,
          name: "Open House Automations",
          campaign_type: "Nurture",
          target_audience: "Open House Attendees",
          status: "active"
       }).select().single();
       campaign = newCampaign;
    }

    // 3. Queue the "Just Listed" Touchpoint
    const sendDate = immediate_email ? new Date() : new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now or immediate

    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const host = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    const propertyUrl = `${baseUrl}/property/${property.id}`;

    const rawContent = `Hi ${first_name},<br/><br/>
It was a pleasure meeting you today at the open house for <strong>${property.address_line1}</strong>!<br/><br/>
As promised, here is the official listing package for your review:<br/>
<strong>Price:</strong> ${property.price ? '$' + property.price.toLocaleString() : 'Contact for Price'}<br/>
<strong>Beds:</strong> ${property.bedrooms || 'N/A'}<br/>
<strong>Baths:</strong> ${property.bathrooms || 'N/A'}<br/>
<strong>Sq Ft:</strong> ${property.sq_ft?.toLocaleString() || 'N/A'}<br/><br/>
<a href="${propertyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #00D1FF; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-bottom: 20px;">View Official Listing Site</a><br/><br/>
Please let me know if you would like to schedule a private tour, or if you're interested in seeing similar properties in the area.<br/><br/>
Best regards,<br/>
${agentDetails.name}`;

    const emailComponent = React.createElement(AINurtureEmail, {
      contentHtml: rawContent,
      agentDetails
    });

    const compiledHtml = await render(emailComponent);

    const touchpointPayload = {
      campaign_id: campaign?.id || "00000000-0000-0000-0000-000000000000",
      lead_id: leadData.id,
      agent_id: property.agent_id,
      channel: 'Email',
      subject: `Just Listed: ${property.address_line1}`,
      content: compiledHtml,
      raw_content: rawContent,
      scheduled_for: sendDate.toISOString(),
      status: 'pending'
    };

    const { error: touchpointError } = await supabase.from("crm_campaign_touchpoints").insert(touchpointPayload as any);

    if (touchpointError) {
      console.error("Failed to queue open house email:", touchpointError);
      // We don't fail the request if just the email queue fails, but we log it.
    }

    return NextResponse.json({ success: true, lead: leadData });
  } catch (err) {
    console.error("Open House Submit Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
