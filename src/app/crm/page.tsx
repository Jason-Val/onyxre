import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import CRMClient from "./CRMClient";

export default async function CRMPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all leads
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  // Fetch all touchpoints for this agent to calculate global stats
  const { data: touchpoints } = await supabase
    .from('crm_campaign_touchpoints')
    .select('*')
    .eq('agent_id', user.id);

  // Fetch properties for Open House Mode
  const { data: properties } = await supabase
    .from('properties')
    .select('id, address_line1, city, state, thumbnail_url, status')
    .eq('agent_id', user.id);

  return <CRMClient leads={leads || []} touchpoints={touchpoints || []} properties={properties || []} />;
}
