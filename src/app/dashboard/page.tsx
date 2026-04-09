import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Execute Parallel Queries
  const [
    { count: totalLeads },
    { data: activeLeads },
    { data: recentTouchpoints },
    { data: recentProperties },
    { data: upcomingMilestones }
  ] = await Promise.all([
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('agent_id', user.id),
    supabase.from('leads').select('*').eq('agent_id', user.id).order('created_at', { ascending: false }).limit(5),
    // For touchpoints, fetching the lead info helps UI
    supabase.from('crm_campaign_touchpoints').select('*, leads(first_name, last_name)').eq('agent_id', user.id).order('scheduled_for', { ascending: true }).limit(20),
    supabase.from('properties').select('*').eq('agent_id', user.id).order('created_at', { ascending: false }).limit(4),
    // Use inner join on transactions to filter by agent
    supabase.from('transaction_milestones')
      .select('*, transactions!inner(*)')
      .eq('transactions.agent_id', user.id)
      .in('status', ['pending', 'active'])
      .order('due_date', { ascending: true })
      .limit(5)
  ]);

  return (
    <DashboardClient 
      totalLeads={totalLeads || 0}
      activeLeads={activeLeads || []}
      recentTouchpoints={recentTouchpoints || []}
      recentProperties={recentProperties || []}
      upcomingMilestones={upcomingMilestones || []}
    />
  );
}
