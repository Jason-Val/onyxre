import { createClient } from "@/supabase/server";
import { notFound } from "next/navigation";
import { PropertyClientView } from "./PropertyClientView";
import { LeadForm } from "@/app/agent/[id]/LeadForm";

interface PropertyPublic {
  id: string;
  address_line1: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  price: number | null;
  status: string;
  bedrooms: number | null;
  bathrooms: number | null;
  sq_ft: number | null;
  year_built: number | null;
  description: string | null;
  thumbnail_url: string | null;
  features: string[] | null;
  images: Array<{ url: string; sort_order: number }>;
  media_assets: Array<{ asset_type: string; storage_path: string }>;
  agent_first_name: string | null;
  agent_last_name: string | null;
  agent_avatar_url: string | null;
  agent_license: string | null;
  agent_id: string;
  org_id: string;
  brokerage_name: string;
  brand_primary: string;
  brand_secondary: string;
}



export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_property_public", { p_property_id: id });
  if (!data) return { title: "Property | Specular OS" };
  const p = data as unknown as PropertyPublic;
  const addr = [p.address_line1, p.city, p.state].filter(Boolean).join(", ");
  return {
    title: `${addr} | Specular OS`,
    description: p.description ?? `${addr} — Listed at $${p.price?.toLocaleString() ?? "Contact for price"}`,
    openGraph: {
      title: `${addr} | Specular OS`,
      description: p.description ?? "",
      images: p.thumbnail_url ? [{ url: p.thumbnail_url }] : [],
    },
  };
}

export default async function PropertyLandingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_property_public", { p_property_id: id });

  if (!data) notFound();
  const p = data as unknown as PropertyPublic;

  // Manual fetch for features and assets
  const [featuresRes, assetsRes] = await Promise.all([
    supabase.from("properties").select("features").eq("id", id).single(),
    supabase.from("media_assets").select("asset_type, storage_path").eq("property_id", id)
  ]);

  const features = featuresRes.data?.features ?? [];
  const rawAssets = assetsRes.data ?? [];
  
  // Transform assets to include full URLs for videos
  const media_assets = rawAssets.map(asset => {
    if (asset.asset_type === "VIDEO") {
      const { data: { publicUrl } } = supabase.storage.from("media-assets").getPublicUrl(asset.storage_path);
      return { ...asset, url: publicUrl };
    }
    return asset;
  }) as any;

  p.features = features;
  p.media_assets = media_assets;

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  return <PropertyClientView property={p} googleMapsApiKey={googleMapsApiKey} />;
}

