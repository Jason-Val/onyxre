import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { render } from "@react-email/components";
import React from "react";
import { AINurtureEmail } from "@/emails/AINurture";
import { JustListedEmail } from "@/emails/JustListed";
import { PriceReducedEmail } from "@/emails/PriceReduced";
import { BackOnMarketEmail } from "@/emails/BackOnMarket";
import { PersonalizedMatchEmail } from "@/emails/PersonalizedMatch";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      heatIndex, 
      leadType, 
      timeline, 
      a2pOptIn, 
      notes, 
      actionType, 
      selectedPropertyId, 
      propertySubtype 
    } = body;

    // 1. Get Agent Profile for Org ID
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!profile?.organization_id) {
       return NextResponse.json({ error: "Agent has no organization associated." }, { status: 400 });
    }

    // 2. Create the Lead
    const leadPayload = {
      agent_id: user.id,
      organization_id: profile.organization_id,
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      heat_index: heatIndex,
      type: leadType?.toUpperCase(), // Map leadType from UI to 'type' column
      internal_notes: `Source: New Contact Wizard\nTimeline: ${timeline}\nInitial Notes: ${notes}${!a2pOptIn ? '\nSMS Opt-out requested' : ''}`,
      status: "NEW"
    };

    const { data: leadData, error: leadError } = await supabase.from("leads").insert(leadPayload as any).select().single();

    if (leadError || !leadData) {
      console.error("Failed to insert lead:", leadError);
      return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
    }

    // 3. Handle Automated Actions
    if (actionType === "AI_CAMPAIGN") {
      await handleAICampaign(supabase, user, profile, leadData, leadType, heatIndex);
    } else if (actionType === "PROPERTY_BLAST" && selectedPropertyId && propertySubtype) {
      await handlePropertyBlast(supabase, user, profile, leadData, selectedPropertyId, propertySubtype);
    }

    return NextResponse.json({ success: true, leadId: leadData.id });

  } catch (error) {
    console.error("New Contact Creation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function handleAICampaign(supabase: any, user: any, profile: any, lead: any, leadType: string, heatIndex: string) {
  const campaignType = `Nurture: ${leadType}`;
  const targetAudience = `New ${leadType} (${heatIndex})`;
  
  // Insert Campaign Shell
  const { data: campaign, error: campaignError } = await supabase.from('crm_campaigns').insert({
    organization_id: profile.organization_id,
    agent_id: user.id,
    name: campaignType,
    campaign_type: 'General Nurture',
    target_audience: targetAudience
  }).select().single();

  if (campaignError) throw campaignError;

  const agentDetails = {
    name: [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Agent",
    title: profile.title || "Real Estate Professional",
    phone: profile.phone_number || profile.phone || "",
    email: profile.email || user.email,
    image: profile.avatar_url || ""
  };

  const prompt = `
    You are an expert real estate agent. Generate a strategic, 18-touchpoint email marketing and nurture sequence.
    Lead Name: ${lead.first_name || "Valued Client"}
    Lead Type: ${leadType}
    Heat Index: ${heatIndex}
    Lead Internal Notes: ${lead.internal_notes || "N/A"}

    CRITICAL REQUIREMENT: You MUST generate EXACTLY 18 distinct email touchpoints.
    Use the 'Lead Internal Notes' to thoroughly personalize the messaging.
    
    IMPORTANT RULES:
    1. DO NOT include a sign-off, signature, or agent contact information block at the end of the emails. That will be automatically attached by the system. End the email warmly but without names/titles.
    2. If you need to reference external resources or listings, use placeholders like [Link to listings] or [Name of specific neighborhood]. Do not attempt to guess actual URLs.
    
    Return as a STRICT JSON array:
    [
      { "day": 0, "type": "Email", "subject": "...", "content": "..." }
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const touchpointsJSON = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    const rowsToInsert = [];
    for (const tp of touchpointsJSON) {
      const sendDate = new Date();
      sendDate.setDate(sendDate.getDate() + (tp.day || 0));

      const isDraft = /\[.*?\]/.test(tp.subject || "") || /\[.*?\]/.test(tp.content || "");
      const tpStatus = isDraft ? "draft" : "pending";

      const emailComponent = React.createElement(AINurtureEmail, { 
        contentHtml: tp.content, 
        agentDetails: { ...agentDetails, headshotUrl: agentDetails.image } 
      });
      const compiledHtml = await render(emailComponent);

      rowsToInsert.push({
        campaign_id: campaign.id,
        lead_id: lead.id,
        agent_id: user.id,
        channel: 'Email',
        subject: tp.subject || 'Follow up',
        content: compiledHtml,
        raw_content: tp.content,
        scheduled_for: sendDate.toISOString(),
        status: tpStatus
      });
    }

    if (rowsToInsert.length > 0) {
      await supabase.from('crm_campaign_touchpoints').insert(rowsToInsert);
    }
  } catch (e) {
    console.error("AI Generation failed for new contact:", e);
  }
}

async function handlePropertyBlast(supabase: any, user: any, profile: any, lead: any, propertyId: string, subtype: string) {
  const { data: propertyData } = await supabase.from('properties').select('*').eq('id', propertyId).single();
  if (!propertyData) return;

  const agentDetails = {
    name: [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Agent",
    title: profile.title || "Real Estate Professional",
    phone: profile.phone_number || profile.phone || "",
    email: profile.email || user.email,
    image: profile.avatar_url || ""
  };

  const propertyDetails = {
    image: propertyData.thumbnail_url,
    address: propertyData.address_line1 || "No Address",
    cityStateZip: [propertyData.city, propertyData.state].filter(Boolean).join(", "),
    price: propertyData.price ? `$${propertyData.price.toLocaleString()}` : "Price on Request",
    beds: propertyData.bedrooms,
    baths: propertyData.bathrooms,
    sqft: propertyData.sq_ft,
    description: propertyData.description
  };

  let emailComponent = null;
  let subjectLine = "";
  const addressString = [propertyData.address_line1, propertyData.city, propertyData.state].filter(Boolean).join(", ");

  switch (subtype) {
    case "Price Reduction":
      emailComponent = React.createElement(PriceReducedEmail, { propertyDetails, agentDetails });
      subjectLine = `Price Reduced: ${addressString}`;
      break;
    case "Back On Market":
      emailComponent = React.createElement(BackOnMarketEmail, { propertyDetails, agentDetails });
      subjectLine = `Back on Market: ${addressString}`;
      break;
    case "Buyer Match":
      emailComponent = React.createElement(PersonalizedMatchEmail, { propertyDetails, agentDetails, personalMessage: "", clientName: lead.first_name || "there" });
      subjectLine = `A home I think you'll love: ${addressString}`;
      break;
    default:
      emailComponent = React.createElement(JustListedEmail, { propertyDetails, agentDetails });
      subjectLine = `Just Listed: ${addressString}`;
  }

  const compiledHtml = await render(emailComponent);

  // Insert Campaign Shell
  const { data: campaign } = await supabase.from('crm_campaigns').insert({
    organization_id: profile.organization_id,
    agent_id: user.id,
    name: `Property Blast: ${subtype}`,
    campaign_type: 'Property Marketing'
  }).select().single();

  const touchpoint = {
    campaign_id: campaign.id,
    lead_id: lead.id,
    agent_id: user.id,
    channel: 'Email',
    subject: subjectLine,
    content: compiledHtml,
    scheduled_for: new Date().toISOString(),
    status: 'pending'
  };

  const { data: insertedTp, error: tpError } = await supabase.from('crm_campaign_touchpoints').insert(touchpoint).select().single();
  
  if (!tpError && insertedTp) {
    // Immediately dispatch
    const { sendEmail } = await import('@/lib/resend');
    const safeFirstName = profile.first_name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const sendFromEmail = `${profile.first_name} ${profile.last_name} <${safeFirstName}@mail.specularos.com>`;
    
    const result = await sendEmail({
      to: lead.email,
      subject: subjectLine,
      html: compiledHtml,
      from: sendFromEmail,
      replyTo: profile.email || user.email || 'hello@specularos.com'
    });

    if (result.success && result.data?.id) {
       await supabase.from('crm_campaign_touchpoints').update({ status: 'processed', external_id: result.data.id }).eq('id', insertedTp.id);
    } else {
       await supabase.from('crm_campaign_touchpoints').update({ status: 'failed', error_log: JSON.stringify(result.error) }).eq('id', insertedTp.id);
    }
  }
}
