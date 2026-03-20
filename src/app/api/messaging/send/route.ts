import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { leadId, type, content, role } = await req.json();

    // 1. Fetch lead details for context and compliance
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .single();

    if (leadError || !lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // 2. A2P Compliance Check for SMS
    if (type === "SMS" && !lead.sms_opt_in) {
      return NextResponse.json({ error: "SMS Opt-in required for A2P compliance" }, { status: 403 });
    }

    let finalSubject = "";
    let finalContent = content;

    // 3. AI Subject Line Generation for Email
    if (type === "Email") {
      const subjectPrompt = `Generate a catchy, high-open-rate subject line for this real estate email: "${content}"`;
      const result = await model.generateContent(subjectPrompt);
      finalSubject = result.response.text().trim().replace(/^"|"$/g, '');
    }

    // 4. Agent-to-Agent Logic
    if (lead.role === "AGENT") {
      const agentPrompt = `Rewrite this message to be professional for an Agent-to-Agent marketing context: "${content}"`;
      const result = await model.generateContent(agentPrompt);
      finalContent = result.response.text().trim();
    }

    // 5. Mock Sending (In a real app, this would call Twilio/SendGrid)
    console.log(`Sending ${type} to ${lead.first_name}: Sub: ${finalSubject} Content: ${finalContent}`);

    // 6. Log the communication
    await supabase.from("leads").update({
      last_message: finalContent,
      last_message_at: new Date().toISOString(),
    }).eq("id", leadId);

    return NextResponse.json({ success: true, subject: finalSubject, content: finalContent });
  } catch (error) {
    console.error("Messaging Error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
