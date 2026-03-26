import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const postId = url.searchParams.get("postId");
    
    if (!postId) {
      return NextResponse.json({ error: "Missing postId" }, { status: 400 });
    }
    
    const body = await req.json();
    console.log(`[CREATOMATE WEBHOOK RECEIVED] Post ${postId}`, body);

    // Creatomate webhook status is 'succeeded' when done, url is body.url
    if (body.status !== 'succeeded' || !body.url) {
      console.log("Creatomate render not succeeded yet or missing URL.");
      return NextResponse.json({ received: true });
    }

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

    const { error: updateErr } = await supabaseAdmin
      .from('property_marketing_posts')
      .update({ 
         image_url: body.url, // Reusing image_url column to store video URL
         status: 'draft' // Or whatever the finalized un-scheduled state is
      })
      .eq('id', postId);

    if (updateErr) {
      console.error("Failed to update post after Creatomate render", updateErr);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    return NextResponse.json({ success: true, videoUrl: body.url });

  } catch (err: any) {
    console.error("Creatomate Callback Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
