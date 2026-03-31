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

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

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
      const { data: leadsData } = await supabase.from('leads').select('id, first_name').in('id', leadIds);

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
        name: profile?.full_name || "Agent",
        title: profile?.title || "Real Estate Professional",
        phone: profile?.phone_number || "",
        email: profile?.email || user.email,
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
    // AI NURTURE SEQUENCE (Original Gemini Logic)
    // -------------------------------------------------------------------------------- //
    else {
      const prompt = `
        Generate a real estate marketing and nurture sequence.
        Campaign Type: ${campaignType}
        Target Audience Description: ${targetAudience}
  
        The campaign should have a logical pacing (e.g., Day 0, Day 3, Day 7).
        If the Campaign Type indicates "HOT" leads, create high frequency urgent touchpoints.
        If it's for a "Property", create touchpoints for a listing launch (e.g., Just listed, Open house reminder, followup).
        
        Return the campaign as a JSON array of objects, exactly like this:
        [
          {
            "day": number, // Day 0 means send immediately today.
            "type": "Email", // We only support Email via Resend right now
            "subject": "Catchy AI-generated subject line",
            "content": "HTML email body content. You can write rich HTML here with headings and paragraphs. Do not use generic [Lead Name] placeholders since this gets sent directly. Just say Hello or Hi there."
          }
        ]
  
        Provide at least 3-5 touchpoints.
      `;
  
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      const touchpointsJSON = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  
      for (const leadId of leadIds) {
        for (const tp of touchpointsJSON) {
          const sendDate = new Date(now);
          sendDate.setDate(sendDate.getDate() + (tp.day || 0));
  
          rowsToInsert.push({
            campaign_id: campaign.id,
            lead_id: leadId,
            agent_id: user.id,
            channel: tp.type || 'Email',
            subject: tp.subject || 'Specular OS Update',
            content: tp.content || 'Update from Loomis CRM',
            scheduled_for: sendDate.toISOString(),
            status: 'pending'
          });
        }
      }
    }

    // -------------------------------------------------------------------------------- //
    // PERSIST TOUCHPOINTS
    // -------------------------------------------------------------------------------- //
    if (rowsToInsert.length > 0) {
      const { error: insertError } = await supabase.from('crm_campaign_touchpoints').insert(rowsToInsert);
      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true, campaign_id: campaign.id, touchpointsCount: rowsToInsert.length });
  } catch (error) {
    console.error("Campaign Generation/Dispatch Error:", error);
    return NextResponse.json({ error: "Failed to generate campaign" }, { status: 500 });
  }
}
