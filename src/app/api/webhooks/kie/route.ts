import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const postId = url.searchParams.get("postId");
    const indexStr = url.searchParams.get("index");
    
    if (!postId || !indexStr) {
      return NextResponse.json({ error: "Missing tracking params" }, { status: 400 });
    }
    
    const index = parseInt(indexStr, 10);
    const body = await req.json();
    console.log(`[KIE WEBHOOK RECEIVED] Post ${postId} Index ${index}`, body);

    // Kie.ai response structure might vary, adjust the videoUrl extraction as appropriate
    const videoUrl = body?.response?.video_url || body?.output || body?.video_url;
    
    if (!videoUrl) {
      console.error("No video URL found in Kie.ai callback.");
      return NextResponse.json({ error: "No video returned" }, { status: 400 });
    }

    // Initialize Supabase admin client (Service Role is needed because Webhooks are unauthenticated)
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return [] },
          setAll() {},
        },
      }
    );

    // Fetch current post
    const { data: post, error: fetchErr } = await supabaseAdmin
      .from('property_marketing_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (fetchErr || !post) {
      console.error("Post not found", fetchErr);
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const assets = post.motion_assets || { total: 5, completed: 0, urls: [] };
    const urls = assets.urls || [];
    urls[index] = videoUrl;
    
    const newCompleted = assets.completed + 1;
    const updatedAssets = { ...assets, urls, completed: newCompleted };

    const { error: updateErr } = await supabaseAdmin
      .from('property_marketing_posts')
      .update({ motion_assets: updatedAssets })
      .eq('id', postId);

    if (updateErr) {
      console.error("Failed to update post assets", updateErr);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

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
    console.error("Kie Callback Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
