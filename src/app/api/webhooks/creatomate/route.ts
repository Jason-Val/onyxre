import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

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
    
    if (!postId) {
      await supabaseAdmin.from('webhook_logs').insert({ source: 'creatomate-badparams', error_msg: "Missing postId", payload: { url: req.url } });
      return NextResponse.json({ error: "Missing postId" }, { status: 400 });
    }
    
    const rawBody = await req.text();
    let body: any = {};
    try {
      body = rawBody ? JSON.parse(rawBody) : {};
    } catch (e: any) {
      body = { msg: "JSON Parse failed", raw: rawBody, err: e.message };
    }

    console.log(`[CREATOMATE WEBHOOK RECEIVED] Post ${postId}`, body);

    await supabaseAdmin.from('webhook_logs').insert({
      source: 'creatomate',
      post_id: postId,
      payload: { ...body, _rawHeaders: Object.fromEntries(req.headers) }
    });

    // Creatomate often sends an array of elements if multiple renders, or a single object.
    const payloadData = Array.isArray(body) ? body[0] : body;

    // Creatomate webhook status is 'succeeded' when done, url is body.url
    if (payloadData?.status !== 'succeeded' || !payloadData?.url) {
      console.log("Creatomate render not succeeded yet or missing URL.");
      return NextResponse.json({ received: true });
    }

    const { error: updateErr, data: post } = await supabaseAdmin
      .from('property_marketing_posts')
      .update({ 
         image_url: payloadData.url, // Reusing image_url column to store video URL
         status: 'draft' // Or whatever the finalized un-scheduled state is
      })
      .eq('id', postId)
      .select('property_id, agent_id')
      .single();

    if (updateErr) {
      await supabaseAdmin.from('webhook_logs').insert({ source: 'creatomate-update-fail', post_id: postId, error_msg: updateErr.message });
      console.error("Failed to update post after Creatomate render", updateErr);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    // Insert the finalized video into the media_assets table as requested by the user
    if (post && post.agent_id) {
       // Fetch the organization_id from the profiles table, which is a required NOT NULL field for media_assets
       const { data: profile } = await supabaseAdmin.from('profiles').select('organization_id').eq('id', post.agent_id).single();

       const { error: insertErr } = await supabaseAdmin.from('media_assets').insert({
         property_id: post.property_id,
         agent_id: post.agent_id,
         organization_id: profile?.organization_id, // Fill the NOT NULL constraint
         asset_type: 'video',
         storage_path: payloadData.url
       });

       if (insertErr) {
         await supabaseAdmin.from('webhook_logs').insert({ source: 'creatomate-mediaassets-fail', post_id: postId, error_msg: insertErr.message });
         console.error("Failed to insert media_asset", insertErr);
       }
    }

    return NextResponse.json({ success: true, videoUrl: payloadData.url });

  } catch (err: any) {
    if (supabaseAdmin) {
      try { await supabaseAdmin.from('webhook_logs').insert({ source: 'creatomate-crash', error_msg: err.message, payload: { rawUrl: req.url } }); } catch (_) {}
    }
    console.error("Creatomate Callback Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

