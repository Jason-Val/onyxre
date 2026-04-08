import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import DossierClient from "./DossierClient";

export default async function ContactDossierPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch lead data
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();

  if (leadError || !lead) {
    redirect("/contacts");
  }

  // Fetch their sequence timeline
  const { data: touchpoints } = await supabase
    .from('crm_campaign_touchpoints')
    .select('*')
    .eq('lead_id', id)
    .order('scheduled_for', { ascending: true });

  return <DossierClient initialLead={lead} initialTouchpoints={touchpoints || []} />;
}
