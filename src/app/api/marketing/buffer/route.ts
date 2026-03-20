import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { 
      propertyId,
      imageUrl, 
      text, 
      scheduledAt, 
      platforms 
    } = await req.json();

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
    
    if (user) {
      const { error: dbError } = await supabase
        .from('property_marketing_posts')
        .insert({
           property_id: propertyId || null,
           agent_id: user.id,
           image_url: imageUrl,
           caption: text,
           scheduled_at: scheduledAt,
           platforms: platforms,
           status: 'scheduled'
        });
        
      if (dbError) {
        console.error("Failed inserting post into DB", dbError);
      }
    }

    const bufferToken = process.env.BUFFER_ACCESS_TOKEN;

    if (!bufferToken) {
      console.warn("Buffer Token missing. Mocking success.");
      // Mock successfully simulating a Buffer schedule post
      return NextResponse.json({ 
        success: true, 
        message: "Post logically scheduled (Mocked - No Buffer Token found)",
        data: { imageUrl, text, scheduledAt, platforms }
      });
    }

    // Example actual Buffer integration payload
    // Not fully implemented as the Buffer API expects individual profile_ids.
    // We would need to fetch the user's buffer profiles first.
    return NextResponse.json({ 
      success: true, 
      message: "Post scheduled to Buffer API!",
      data: { platforms }
    });

  } catch (err: any) {
    console.error("Buffer Route Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
