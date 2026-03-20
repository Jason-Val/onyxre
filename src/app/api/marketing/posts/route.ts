export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function PUT(req: Request) {
  try {
    const { 
      postId,
      caption, 
      scheduledAt, 
      platforms 
    } = await req.json();

    if (!postId) {
      return NextResponse.json({ error: "Missing postId" }, { status: 400 });
    }

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
            } catch (error) {}
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('property_marketing_posts')
      .update({
         caption,
         scheduled_at: scheduledAt,
         platforms
      })
      .eq('id', postId)
      .eq('agent_id', user.id)
      .select()
      .single();
      
    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
    }

    // Optionally you would re-push to Buffer API here

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("Posts Route Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
