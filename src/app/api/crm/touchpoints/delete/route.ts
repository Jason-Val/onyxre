import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Delete in DB (ensure agent_id matches so agents can only delete their own)
    const { error: deleteError } = await supabase
      .from('crm_campaign_touchpoints')
      .delete()
      .eq('id', id)
      .eq('agent_id', user.id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Failed to delete touchpoint:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
