import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export async function POST(req: Request) {
  try {
    const { name, role, heatIndex, notes } = await req.json();

    const prompt = `
      Generate a real estate nurture campaign for a new lead.
      Lead Name: ${name}
      Role: ${role} (Buyer/Seller/Agent)
      Heat Index: ${heatIndex} (HOT/WARM/COLD)
      Notes: ${notes}

      The campaign should scale based on the Heat Index:
      - HOT: 14 days, high frequency (every 2-3 days), urgent and helpful tone.
      - WARM: 30 days, medium frequency (every 5-7 days), educational and professional tone.
      - COLD: 60-90 days, low frequency (every 14 days), long-term value and "set it and forget it" tone.

      If Role is 'Agent', use 'Agent-to-Agent' marketing logic (e.g., inviting them to see a new listing or sharing pocket listings).

      Return the campaign as a JSON array of objects, each with:
      {
        "day": number,
        "type": "Email" | "SMS",
        "subject": "Catchy AI-generated subject line (for Email only)",
        "content": "The actual message content",
        "title": "Short title for the touchpoint"
      }

      Provide at least 5 touchpoints.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Extract JSON from potential markdown blocks
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const campaign = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error("Gemini Campaign Error:", error);
    return NextResponse.json({ error: "Failed to generate campaign" }, { status: 500 });
  }
}
