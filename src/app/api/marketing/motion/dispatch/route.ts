import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { propertyId, imageUrls, text, scheduledAt, platforms, motionData } = await req.json();

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch (error) { }
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Create a placeholder post in the database
    const { data: post, error: dbError } = await supabase
      .from('property_marketing_posts')
      .insert({
        property_id: propertyId || null,
        agent_id: user.id,
        image_url: imageUrls[0], // Temporary preview
        caption: text || "Generated Motion Post",
        scheduled_at: scheduledAt || null,
        platforms: platforms || [],
        status: 'generating',
        motion_assets: { total: imageUrls.length, completed: 0, urls: [], ...motionData }
      })
      .select('id')
      .single();

    if (dbError || !post) {
      console.error("DB Insert Error", dbError);
      return NextResponse.json({ error: "Failed to create post record" }, { status: 500 });
    }

    // 2. Dispatch to Kie.ai Grok-Imagine for each image
    const domain = req.headers.get("host") || "localhost:3000";
    const protocol = domain.includes("localhost") ? "http" : "https";

    const kiePromises = imageUrls.map(async (url: string, index: number) => {
      const callbackUrl = `${protocol}://${domain}/api/webhooks/kie?postId=${post.id}&index=${index}`;

      try {
        const res = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.KIE_API_KEY || process.env.KIE_AI_GENERATICE_AI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: "hailuo/2-3-image-to-video-standard",
            callBackUrl: callbackUrl,
            input: {
              image_urls: [url],
              prompt: "A slow, cinematic gimbal push-in shot moving smoothly toward the center of the frame. The camera performs a gentle, micro-arc clockwise rotation around the focal point. High-end real estate videography style, 24fps, perfectly stable motion. Zero morphing. Maintain all original architectural details and furniture exactly as they appear in the static image. No new objects, no hallucinations, no people. Lighting remains static and natural.",
              mode: "normal",
              duration: "6",
              resolution: "768p"
            }
          })
        });

        if (!res.ok) {
          const errBody = await res.text();
          console.error(`[KIE DISPATCH ERROR] Image ${index} failed:`, errBody);
          return { ok: false, error: errBody, index };
        }

        const data = await res.json();
        return { ok: true, data, index };
      } catch (err: any) {
        console.error(`[KIE DISPATCH EXCEPTION] Image ${index}:`, err);
        return { ok: false, error: err.message, index };
      }
    });

    const results = await Promise.all(kiePromises);
    const failedResults = results.filter(r => !r.ok);

    if (failedResults.length > 0) {
      console.error(`[KIE DISPATCH] ${failedResults.length} requests failed.`, failedResults);

      if (failedResults.length === imageUrls.length) {
        // All failed - definitely an upstream or auth issue
        const firstErrBody = failedResults[0].error;
        return NextResponse.json({
          error: `Kie.ai (Grok) rejected your request: ${firstErrBody}`,
          details: failedResults,
          hint: "Check Kie.ai / Grok status page. Today (Mar 26) has reported outages."
        }, { status: 502 });
      }
    }

    return NextResponse.json({
      success: true,
      postId: post.id,
      message: `${results.filter(r => r.ok).length} videos dispatched successfully.`
    });

  } catch (err: any) {
    console.error("Motion Dispatch Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
