import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { action, existingCaption, propertyData, templateType } = await req.json();

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing Gemini API Key" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    let prompt = "";
    if (action === "polish") {
      prompt = `
        You are an elite real estate marketing copywriter. Polish the following social media caption to sound professional, luxurious, and engaging.
        Don't change the core information, just make it sound better. Add appropriate emojis and hashtags.
        Original Caption: "${existingCaption}"
        Return ONLY the updated text.
      `;
    } else {
      prompt = `
        You are an elite real estate marketing copywriter. Write an engaging social media caption for a property.
        Property Address: ${propertyData?.address || "A beautiful property"}
        Status / Type: ${templateType || "Just Listed"}
        Features: ${propertyData?.features || "Amazing amenities"}

        Tone: Luxurious, urgent, modern, but refined.
        Include a call to action to "tap the link in bio for the 3D tour".
        Add 3-5 relevant hashtags.
        Return ONLY the textual caption. Do not include markdown formatting or quotation marks around the entire response.
      `;
    }

    const result = await model.generateContent(prompt);
    const caption = result.response.text().trim();

    return NextResponse.json({ caption });
  } catch (error) {
    console.error("Gemini Caption Error:", error);
    return NextResponse.json({ error: "Failed to generate caption" }, { status: 500 });
  }
}
