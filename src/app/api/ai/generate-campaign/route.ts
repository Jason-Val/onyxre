import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from '@/supabase/server';
import { render } from '@react-email/components';
import React from 'react';

// Email Templates
import { JustListedEmail } from '@/emails/JustListed';
import { PriceReducedEmail } from '@/emails/PriceReduced';
import { PersonalizedMatchEmail } from '@/emails/PersonalizedMatch';
import { BackOnMarketEmail } from '@/emails/BackOnMarket';
import { AINurtureEmail } from '@/emails/AINurture';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!profile?.organization_id) throw new Error("No organization found");

    const { 
      campaignType, 
      targetAudience, 
      leadIds,
      propertyId,
      propertyCampaignSubtype,
      priceReductionAmount,
      buyerMatchMessage
    } = await req.json();

    if (!leadIds || leadIds.length === 0) {
      return NextResponse.json({ error: "No leads selected" }, { status: 400 });
    }

    const { data: leadsData } = await supabase.from('leads').select('*').in('id', leadIds);

    // Insert Campaign Shell
    const { data: campaign, error: campaignError } = await supabase.from('crm_campaigns').insert({
      organization_id: profile.organization_id,
      agent_id: user.id,
      name: campaignType || 'Unnamed Campaign',
      campaign_type: campaignType || 'General Nurture',
      target_audience: targetAudience || 'Selected Leads'
    }).select().single();

    if (campaignError) throw campaignError;

    const rowsToInsert = [];
    const now = new Date();

    // -------------------------------------------------------------------------------- //
    // PROPERTY MARKETING SEQUENCE
    // -------------------------------------------------------------------------------- //
    if (campaignType?.startsWith('Property') && propertyId) {
      
      const { data: propertyData } = await supabase.from('properties').select('*').eq('id', propertyId).single();

      const addressString = [propertyData?.address_line1, propertyData?.city, propertyData?.state].filter(Boolean).join(", ");
      const displayPrice = propertyData?.price ? `$${propertyData.price.toLocaleString()}` : "Price on Request";

      const propertyDetails = {
        image: propertyData?.thumbnail_url,
        address: propertyData?.address_line1 || "No Address",
        cityStateZip: [propertyData?.city, propertyData?.state].filter(Boolean).join(", "),
        price: displayPrice,
        priceReduction: priceReductionAmount,
        beds: propertyData?.bedrooms,
        baths: propertyData?.bathrooms,
        sqft: propertyData?.sq_ft,
        description: propertyData?.description
      };

      const agentDetails = {
        name: profile ? [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Agent" : "Agent",
        title: (profile as any)?.title || "Real Estate Professional",
        phone: (profile as any)?.phone_number || (profile as any)?.phone || "",
        email: (profile as any)?.email || user.email,
        image: profile?.avatar_url || ""
      };

      for (const lead of (leadsData || [])) {
        let emailComponent = null;
        let subjectLine = "";

        // Dynamically instantiate the correct React Email Component
        switch (propertyCampaignSubtype) {
          case "Price Reduction":
            emailComponent = React.createElement(PriceReducedEmail, { propertyDetails, agentDetails });
            subjectLine = `Price Reduced: ${addressString}`;
            break;
          case "Back On Market":
            emailComponent = React.createElement(BackOnMarketEmail, { propertyDetails, agentDetails });
            subjectLine = `Back on Market: ${addressString}`;
            break;
          case "Buyer Match":
            emailComponent = React.createElement(PersonalizedMatchEmail, { 
              propertyDetails, 
              agentDetails, 
              personalMessage: buyerMatchMessage,
              clientName: lead.first_name || "there"
            });
            subjectLine = `A home I think you'll love: ${addressString}`;
            break;
          case "New Listing":
          default:
            emailComponent = React.createElement(JustListedEmail, { propertyDetails, agentDetails });
            subjectLine = `Just Listed: ${addressString}`;
            break;
        }

        // Render React abstraction into raw HTML string
        const compiledHtml = await render(emailComponent);

        rowsToInsert.push({
          campaign_id: campaign.id,
          lead_id: lead.id,
          agent_id: user.id,
          channel: 'Email',
          subject: subjectLine,
          content: compiledHtml,
          scheduled_for: now.toISOString(), // Send Property updates immediately (Day 0)
          status: 'pending'
        });
      }

    } 
    // -------------------------------------------------------------------------------- //
    // AI NURTURE SEQUENCE (18-Touchpoint Drip)
    // -------------------------------------------------------------------------------- //
    else {
      const agentDetails = {
        name: profile ? [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Agent" : "Agent",
        title: (profile as any)?.title || "Real Estate Professional",
        phone: (profile as any)?.phone_number || (profile as any)?.phone || "",
        email: (profile as any)?.email || user.email,
        image: profile?.avatar_url || ""
      };

      // Generate sequence concurrently for all selected leads to incorporate their internal notes
      await Promise.all((leadsData || []).map(async (lead) => {
        const prompt = `
          You are an expert real estate agent. Generate a strategic, 18-touchpoint email marketing and nurture sequence.
          Campaign Type: ${campaignType}
          Target Audience Description: ${targetAudience}
          Lead Name: ${lead.first_name || "Valued Client"}
          Lead Internal Notes: ${// @ts-ignore
          lead.internal_notes || "N/A"}
    
          CRITICAL REQUIREMENT: You MUST generate EXACTLY 18 distinct email touchpoints.
          Use the 'Lead Internal Notes' to thoroughly personalize the messaging to their context, timeline, and interests.

          IMPORTANT RULES:
          1. DO NOT include a sign-off, signature, or agent contact information block at the end of the emails. That will be automatically attached by the system. End the email warmly but without names/titles.
          2. If you need to reference external resources or listings, use placeholders like [Link to listings] or [Name of specific neighborhood]. Do not attempt to guess actual URLs.
          
          The pacing MUST span approximately 12 months with the following structure:
          - Front-loaded urgency: Days 0, 3, 7, 14.
          - Tapering off: Days 21, 30, 45, 60, 75.
          - Long-term check-ins: Days 90, 120, 150, 180, 210, 240, 270, 300, 330.
          
          Return the campaign as a STRICT JSON array of exactly 18 objects, like this:
          [
            {
              "day": 0, // Number of days from launch to send this email
              "type": "Email", // Always "Email"
              "subject": "Catchy, personalized subject line",
              "content": "Rich HTML email body content. Write professional, consultative copy. Use <p>, <strong>, and <br/> tags."
            }
          ]
        `;
    
        try {
          const result = await model.generateContent(prompt);
          const text = result.response.text();
          
          const jsonMatch = text.match(/\[[\s\S]*\]/);
          const touchpointsJSON = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      
          for (const tp of touchpointsJSON) {
            const isDraft = /\[.*?\]/.test(tp.subject || "") || /\[.*?\]/.test(tp.content || "");
            const tpStatus = isDraft ? "draft" : "pending";
            const sendDate = new Date(now);
            sendDate.setDate(sendDate.getDate() + (tp.day || 0));
    
            // Render React abstraction into HTML string
            const emailComponent = React.createElement(AINurtureEmail, { 
              contentHtml: tp.content, 
              agentDetails: {
                ...agentDetails,
                headshotUrl: agentDetails.image
              } 
            });
            const compiledHtml = await render(emailComponent);
  
            rowsToInsert.push({
              campaign_id: campaign.id,
              lead_id: lead.id,
              agent_id: user.id,
              channel: tp.type || 'Email',
              subject: tp.subject || 'Follow up',
              content: compiledHtml,
              raw_content: tp.content,
              scheduled_for: sendDate.toISOString(),
              status: tpStatus
            });
          }
        } catch (e) {
          console.error(`Failed to generate or parse sequence for lead ${lead.id}:`, e);
        }
      }));
    }

    // -------------------------------------------------------------------------------- //
    // PERSIST TOUCHPOINTS
    // -------------------------------------------------------------------------------- //
    let insertedRows: any[] = [];
    if (rowsToInsert.length > 0) {
      const { data, error: insertError } = await supabase.from('crm_campaign_touchpoints').insert(rowsToInsert).select();
      if (insertError) throw insertError;
      insertedRows = data || [];
    }

    // -------------------------------------------------------------------------------- //
    // IMMEDIATELY DISPATCH PROPERTY MARKETING TOUCHPOINTS
    // -------------------------------------------------------------------------------- //
    if (campaignType?.startsWith('Property') && insertedRows.length > 0) {
      const { sendEmail } = await import('@/lib/resend');
      
      const agentFirstName = profile?.first_name || 'Loomis';
      const agentLastName = profile?.last_name || 'Agent';
      const replyToEmail = (profile as any)?.email || user.email || 'hello@specularos.com';
      const safeFirstName = agentFirstName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const sendFromEmail = `${agentFirstName} ${agentLastName}`.trim() + ` <${safeFirstName}@mail.specularos.com>`;

      // Get lead emails
      const leadEmailsMap = new Map();
      const { data: leadsDataForEmail } = await supabase.from('leads').select('id, email').in('id', leadIds);
      if (leadsDataForEmail) {
        leadsDataForEmail.forEach(l => leadEmailsMap.set(l.id, l.email));
      }

      // Send all emails in parallel
      await Promise.all(insertedRows.map(async (touchpoint) => {
        if (touchpoint.channel.toLowerCase() === 'email') {
          const email = leadEmailsMap.get(touchpoint.lead_id);
          if (email) {
            const result = await sendEmail({
              to: email,
              subject: touchpoint.subject,
              html: touchpoint.content,
              from: sendFromEmail,
              replyTo: replyToEmail
            });
            
            if (result.success && result.data?.id) {
              await supabase.from('crm_campaign_touchpoints').update({ status: 'processed', external_id: result.data.id }).eq('id', touchpoint.id);
            } else {
              await supabase.from('crm_campaign_touchpoints').update({ status: 'failed', error_log: JSON.stringify(result.error) }).eq('id', touchpoint.id);
            }
          } else {
            await supabase.from('crm_campaign_touchpoints').update({ status: 'failed', error_log: 'Lead has no email address.' }).eq('id', touchpoint.id);
          }
        }
      }));
    }

    return NextResponse.json({ success: true, campaign_id: campaign.id, touchpointsCount: rowsToInsert.length });
  } catch (error) {
    console.error("Campaign Generation/Dispatch Error:", error);
    return NextResponse.json({ error: "Failed to generate campaign" }, { status: 500 });
  }
}
