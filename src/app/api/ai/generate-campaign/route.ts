import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from '@/supabase/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
    if (!profile?.organization_id) throw new Error("No organization found");

    const { campaignType, targetAudience, leadIds } = await req.json();

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
    
    // Extract JSON
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const touchpointsJSON = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    const rowsToInsert = [];
    const now = new Date();

    for (const leadId of leadIds) {
      for (const tp of touchpointsJSON) {
        
        // Calculate the target send date based on the "day" offset
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

    if (rowsToInsert.length > 0) {
      const { error: insertError } = await supabase.from('crm_campaign_touchpoints').insert(rowsToInsert);
      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true, campaign_id: campaign.id, touchpointsCount: rowsToInsert.length });
  } catch (error) {
    console.error("Gemini Campaign Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate campaign" }, { status: 500 });
  }
}
