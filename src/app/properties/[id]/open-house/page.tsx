import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import OpenHouseKiosk from "./OpenHouseKiosk";

export default async function OpenHousePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: property, error } = await supabase
    .from('properties')
    .select('id, address_line1, city, state, thumbnail_url')
    .eq('id', id)
    .single();

  if (error || !property) {
    redirect("/crm");
  }

  // Get the base url from environment or request. Assuming standard Vercel or localhost.
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  // Attempt to use Vercel URL, fallback to localhost
  const host = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'localhost:3000';
  const baseUrl = `${protocol}://${host}`;

  return <OpenHouseKiosk property={property} baseUrl={baseUrl} />;
}
