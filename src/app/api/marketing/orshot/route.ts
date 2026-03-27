import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      type, // e.g. "Just Listed"
      address = "TBD",
      cityState = "",
      features = "",
      price = "",
      bedrooms = "",
      bathrooms = "",
      sq_ft = "",
      propertyImage = "https://placehold.co/800x800/222/999?text=Replace%20Image",
      propertyId = null
    } = body;

    // Get Auth and user details
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
    let agentName = "ELITE AGENT";
    let phoneNumber = "555-0199";
    let brokerImage = "https://placehold.co/400x400/222/999?text=Broker";
    let brandPrimary = "#0B0E14";
    let brandSecondary = "#00D1FF";
    let brokerageName = "OnyxRE";

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          *,
          organizations (
            name,
            brand_primary_color,
            brand_secondary_color
          )
        `)
        .eq('id', user.id)
        .single();
      
      if (profile) {
        agentName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || agentName;
        phoneNumber = profile.phone_number || phoneNumber;
        brokerImage = profile.avatar_url || brokerImage;
        if (profile.organizations) {
          const org = Array.isArray(profile.organizations) ? profile.organizations[0] : profile.organizations;
          brokerageName = org?.name || brokerageName;
          brandPrimary = org?.brand_primary_color || brandPrimary;
          brandSecondary = org?.brand_secondary_color || brandSecondary;
        }
      }
    }

    // Call Orshot API
    const orshotApiUrl = 'https://api.orshot.com/v1/studio/render';
    
    let targetTemplateId = 4039;
    let modifications: any = {};
    const fullAddress = `${address}, ${cityState}`.replace(/^,\s/, '').trim();

    if (type === "Open House") {
      targetTemplateId = 6671;
      modifications = {
        price,
        "price.color": brandSecondary,
        phoneNumber,
        "phoneNumber.color": brandSecondary,
        text_1_20: fullAddress,
        "text_1_20.color": brandSecondary,
        brokerage: brokerageName,
        "brokerage.color": brandPrimary,
        agent_name: agentName,
        "agent_name.color": brandSecondary,
        bathrooms: bathrooms ? `${bathrooms} Bathrooms` : "",
        bedrooms: bedrooms ? `${bedrooms} Bedrooms` : "",
        sq_ft: sq_ft ? `${sq_ft} Sq Ft` : "",
        rectangle_s2: brandSecondary,
        headshot: brokerImage,
        hero_image: propertyImage,
        rectangle_s1: brandPrimary,
        title: "Open House",
        "title.color": brandSecondary
      };
    } else if (type === "In Contract") {
      targetTemplateId = 6675;
      modifications = {
        text_1_7: fullAddress,
        "text_1_7.color": brandSecondary,
        text_1_6: "Contract",
        "text_1_6.color": brandSecondary,
        text_1_5: "Under",
        "text_1_5.color": brandSecondary,
        img_1_3: propertyImage,
        rectangle_fdef3658: brandPrimary,
        headshot: brokerImage
      };
    } else if (type === "Just Sold") {
      targetTemplateId = 6739;
      modifications = {
        text_1_8_copy: agentName,
        propertyAddress: fullAddress,
        brokerName: brokerageName,
        "brokerName.color": brandSecondary,
        text_1_8: phoneNumber,
        heroImage: propertyImage,
        headshot: brokerImage,
        rectangle_S1: brandPrimary,
        circle_S1: brandPrimary
      };
    } else {
      // Default / Just Listed
      targetTemplateId = 4039;
      modifications = {
        type: type || "Just Listed",
        address,
        cityState,
        features,
        agentName,
        phoneNumber,
        brokerImage,
        propertyImage,
        "type.color": brandSecondary,
        "cityState.color": brandSecondary,
        "phoneNumber.color": brandSecondary,
        rectangle_s1: brandSecondary,
        rectangle_s2: brandPrimary,
        rectangle_s3: brandPrimary
      };
    }

    const orshotPayload = {
      templateId: targetTemplateId,
      modifications,
      response: {
        type: "url",
        format: "png",
        scale: 1
      }
    };

    const response = await fetch(orshotApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ORSHOT_API_KEY}`
      },
      body: JSON.stringify(orshotPayload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Orshot API Error:", errText);
      return NextResponse.json({ error: "Failed to generate creative via Orshot" }, { status: response.status });
    }

    const data = await response.json();
    const finalUrl = data.data ? data.data.content : data.content || data.url;

    // Create the media_assets entry!
    if (finalUrl && user) {
       const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
       
       await supabase.from('media_assets').insert({
         property_id: propertyId,
         agent_id: user.id,
         organization_id: profile?.organization_id, 
         asset_type: 'IMAGE',
         storage_path: finalUrl
       });
    }

    return NextResponse.json({ success: true, url: finalUrl });

  } catch (err: any) {
    console.error("Orshot Route Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
