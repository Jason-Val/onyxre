import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET() {
  return NextResponse.json({ status: "Ready", message: "Kie.ai Webhook is active and waiting for POST callbacks." });
}

export async function POST(req: Request) {
  // Always initialize local supabase client to log EVERYTHING even crashes
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://agaltnnnnaxjmjwuybhq.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return [] }, setAll() {} } }
  );

  try {
    const url = new URL(req.url);
    const postId = url.searchParams.get("postId");
    const indexStr = url.searchParams.get("index");
    
    if (!postId || !indexStr) {
      await supabaseAdmin.from('webhook_logs').insert({ source: 'kie.ai-badparams', error_msg: "Missing query params", payload: { url: req.url } });
      return NextResponse.json({ error: "Missing tracking params" }, { status: 400 });
    }
    
    const index = parseInt(indexStr, 10);
    
    const rawBody = await req.text();
    let body: any = {};
    try {
      body = rawBody ? JSON.parse(rawBody) : {};
    } catch (e: any) {
      body = { msg: "JSON Parse failed", raw: rawBody, err: e.message };
    }

    console.log(`[KIE WEBHOOK HIT] Post: ${postId}, Index: ${index}`);
    console.log("[KIE PAYLOAD]", JSON.stringify(body, null, 2));

    // Log the payload to our new debugging table
    await supabaseAdmin.from('webhook_logs').insert({
      source: 'kie.ai',
      post_id: postId,
      payload: { ...body, _rawHeaders: Object.fromEntries(req.headers) }
    });


    // Support multiple Kie.ai response formats by checking all common fields
    const videoUrl = 
      body?.data?.video_url || 
      body?.video_url || 
      body?.data?.url || 
      body?.url || 
      body?.output || 
      body?.response?.video_url ||
      body?.data?.output_url ||
      body?.output_url ||
      (body?.data && typeof body.data === 'string' && body.data.startsWith('http') ? body.data : null);
    
    if (!videoUrl) {
      await supabaseAdmin.from('webhook_logs').insert({ source: 'kie.ai-error', post_id: postId, error_msg: "No video URL found", payload: body });
      console.error("[KIE WEBHOOK ERROR] No video URL found in payload. Structure:", JSON.stringify(body));
      return NextResponse.json({ error: "No video returned", received: body }, { status: 400 });
    }


    // Fetch current post
    const { data: post, error: fetchErr } = await supabaseAdmin
      .from('property_marketing_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (fetchErr || !post) {
      await supabaseAdmin.from('webhook_logs').insert({ source: 'kie.ai-error', post_id: postId, error_msg: fetchErr ? fetchErr.message : "Post not found" });
      console.error(`[KIE WEBHOOK ERROR] Post ${postId} not found in DB.`, fetchErr);
      return NextResponse.json({ 
        error: "Post not found", 
        postId, 
        dbError: fetchErr,
        keyUsed: process.env.SUPABASE_SERVICE_ROLE_KEY ? "service_role" : "anon"
      }, { status: 404 });
    }

    const assets = post.motion_assets || { total: 5, completed: 0, urls: [] };
    const urls = assets.urls || [];
    urls[index] = videoUrl;
    
    const newCompleted = assets.completed + 1;
    const updatedAssets = { ...assets, urls, completed: newCompleted };

    const serializedAssets = JSON.parse(JSON.stringify(updatedAssets));
    const { error: updateErr } = await supabaseAdmin
      .from('property_marketing_posts')
      .update({ motion_assets: serializedAssets })
      .eq('id', postId);

    if (updateErr) {
      await supabaseAdmin.from('webhook_logs').insert({ source: 'kie.ai-error', post_id: postId, error_msg: updateErr.message });
      console.error(`[KIE WEBHOOK UPDATE FAILED] Post: ${postId}`, updateErr);
      return NextResponse.json({ 
        error: "Database update failed", 
        details: updateErr,
        hint: "Check if SUPABASE_SERVICE_ROLE_KEY is set in Vercel to bypass RLS." 
      }, { status: 500 });
    }

    console.log(`[KIE WEBHOOK PROGRESS] Post: ${postId}, Status: ${newCompleted}/${assets.total} videos completed.`);

    // Check if ALL videos are done!
    if (newCompleted >= assets.total) {
      console.log(`[KIE WEBHOOK] All ${assets.total} videos completed for post ${postId}. Dispatching to Creatomate!`);
      
      const domain = req.headers.get("host") || "localhost:3000";
      const protocol = domain.includes("localhost") ? "http" : "https";
      const creatomateWebhook = `${protocol}://${domain}/api/webhooks/creatomate?postId=${postId}`;

      // Fetch property and agent details for dynamic text and colors
      const { data: propData } = await supabaseAdmin.from('properties').select('*').eq('id', post.property_id).single();
      const { data: agentData } = await supabaseAdmin.from('profiles').select('*').eq('id', post.agent_id).single();

      const templateId = assets.templateId === "open-house" 
        ? "38e0a267-c05b-405d-8155-713964cbbe74" 
        : "f9f05e2d-7d1a-446b-8c2e-7c5cf897a9fe";

      const modifications: any = {
        "Video_1.source": urls[0] || "",
        "Video_2.source": urls[1] || "",
        "Video_3.source": urls[2] || "",
        
        "Bottom_Black_Floor.fill_color": agentData?.brand_primary_color || "rgba(0,0,0,0.6)",
        "Agent-Group-Shape.fill_color": agentData?.brand_primary_color || "rgba(0,0,0,0.6)",
        
        "Text-Address.text": propData ? `${propData.address_line1}, ${propData.city} ${propData.state} ${propData.zip_code}` : "Property Address",
        "Text-Price.text": propData?.price ? `$${propData.price.toLocaleString()}` : "Contact Agent",
        "Text-Price.fill_color": agentData?.brand_secondary_color || "#FFFFFF",
        
        "Stats_Text.text": propData ? `${propData.bedrooms || 0} bd  |  ${propData.bathrooms || 0} ba  |  ${propData.sq_ft ? propData.sq_ft.toLocaleString() : 0} sqft` : "Amazing Property",
        "Text-Agent-License.text": agentData?.license_number ? `DRE #${agentData.license_number}` : "DRE",
        "Text-Agent-Name.text": agentData ? `${agentData.first_name} ${agentData.last_name}` : "Agent",
        "Agent_Headshot.source": agentData?.avatar_url || "https://creatomate.com/files/assets/3de6151b-3b62-45c9-95f5-0f3c08641aa9"
      };

      if (assets.templateId === "open-house") {
         modifications["OH-Time.text"] = assets.ohDate || "03/30/26";
         modifications["OH-Date.text"] = assets.ohTime || "10am-12pm";
      }

      const creatomateData = {
        template_id: templateId,
        webhook_url: creatomateWebhook,
        modifications: modifications
      };

      const cRes = await fetch('https://api.creatomate.com/v2/renders', {
         method: 'POST',
         headers: {
            'Authorization': `Bearer ${process.env.CREATOMATE_API_KEY}`,
            'Content-Type': 'application/json'
         },
         body: JSON.stringify(creatomateData)
      });
      
      if (!cRes.ok) {
         console.error("Creatomate Dispatch Error", await cRes.text());
      }
    }

    return NextResponse.json({ success: true, progress: `${newCompleted}/${assets.total}` });

  } catch (err: any) {
    if (supabaseAdmin) {
      try { await supabaseAdmin.from('webhook_logs').insert({ source: 'kie.ai-crash', error_msg: err.message, payload: { rawUrl: req.url } }); } catch (_) {}
    }
    console.error("Kie Callback Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
