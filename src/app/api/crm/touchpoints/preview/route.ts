import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse("Missing touchpoint ID", { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { data: touchpoint, error } = await supabase
      .from('crm_campaign_touchpoints')
      .select('content, subject')
      .eq('id', id)
      .eq('agent_id', user.id)
      .single();

    if (error || !touchpoint) {
      return new NextResponse("Touchpoint not found or access denied.", { status: 404 });
    }

    // Return the actual fully rendered HTML string returned from React Email
    return new NextResponse(touchpoint.content, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    });

  } catch (err: any) {
    console.error("Preview endpoint error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
