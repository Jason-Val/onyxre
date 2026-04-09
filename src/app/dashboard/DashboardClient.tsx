"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow, parseISO } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardClient({
  totalLeads,
  activeLeads,
  recentTouchpoints,
  recentProperties,
  upcomingMilestones
}: {
  totalLeads: number,
  activeLeads: any[],
  recentTouchpoints: any[],
  recentProperties: any[],
  upcomingMilestones: any[]
}) {
  const router = useRouter();

  // Procedural Next Best Actions
  const nextBestActions = [];

  const drafts = recentTouchpoints.filter(t => t.status === 'draft');
  if (drafts.length > 0) {
    nextBestActions.push({
      title: `Review ${drafts.length} Action-Required Draft${drafts.length !== 1 ? 's' : ''}`,
      description: "AI-generated touches have blanks that require your attention before they can be sent.",
      action: "Review Drafts",
      icon: "mark_email_unread",
      color: "amber",
      link: `/contacts/${drafts[0].lead_id}`
    });
  }

  const overdues = upcomingMilestones.filter(m => new Date(m.due_date) < new Date());
  if (overdues.length > 0) {
    nextBestActions.push({
      title: `Resolve Overdue Milestones`,
      description: `You have ${overdues.length} transaction item${overdues.length !== 1 ? 's' : ''} past due.`,
      action: "View Checklist",
      icon: "warning",
      color: "rose",
      link: `/transactions/${overdues[0].transaction_id}`
    });
  }

  if (nextBestActions.length === 0) {
    nextBestActions.push({
      title: "Launch a new property blast",
      description: "You have zero critical actions pending! Excellent time to spin up a new marketing campaign.",
      action: "Start Campaign",
      icon: "campaign",
      color: "cyan",
      link: "/marketing"
    });
  }

  const pendingEmails = recentTouchpoints.filter(t => t.status === 'pending');
  const sentEmails = recentTouchpoints.filter(t => t.status === 'sent');

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 md:px-10 py-10 space-y-10 pb-20">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 font-display">Command Center</h1>
          <p className="text-slate-400 text-sm">Welcome back, Captain. Your operations are humming.</p>
        </div>

        {/* SpecularOS Logo Widget */}
        <img
          src="/specularos-logo.png"
          alt="SpecularOS Logo"
          className="
            max-h-[125px] 
            w-auto 
            rounded-xl 
            border border-[#27373a] 
            bg-onyx-surface 
            shadow-xl 
    cursor-pointer 
    transition-all 
    duration-300 
    hover:border-cyan/30 
    hover:shadow-cyan/10 
    object-contain"
        />
      </header>

      {/* Next Best Actions */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2 text-cyan">
          <span className="material-symbols-outlined">psychology</span> Next Best Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nextBestActions.map((action, i) => (
            <ActionCard key={i} {...action} onClick={() => router.push(action.link)} />
          ))}
        </div>
      </section>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Total Leads" value={totalLeads.toLocaleString()} trend="+New" icon="person_search" color="cyan" />
        <MetricCard title="Draft Touchpoints" value={drafts.length.toString()} trend="Action Req" icon="draw" color="amber" />
        <MetricCard title="Emails Delivered" value={sentEmails.length.toString()} trend="Lifetime" icon="mark_email_read" color="emerald" neutral />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <section className="space-y-5 xl:col-span-2">
          <h2 className="text-lg font-bold border-b border-[#27373a] pb-3">Recent Agent Leads</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeLeads.length > 0 ? activeLeads.map(lead => (
              <LeadCard key={lead.id} lead={lead} />
            )) : (
              <p className="text-slate-500 text-sm italic">No recent leads acquired.</p>
            )}
          </div>

          <h2 className="text-lg font-bold border-b border-[#27373a] pb-3 mt-8">Property Marketing Pulse</h2>
          <div className="space-y-3">
            {recentProperties.length > 0 ? recentProperties.map(prop => (
              <PropertyRow key={prop.id} property={prop} />
            )) : (
              <p className="text-slate-500 text-sm italic">No active properties tracking.</p>
            )}
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex items-center justify-between border-b border-[#27373a] pb-3">
            <h2 className="text-lg font-bold">Messaging Queue</h2>
          </div>
          <div className="space-y-2">
            {recentTouchpoints.filter(t => t.status !== 'sent').slice(0, 5).map(tp => (
              <ActivityRow
                key={tp.id}
                initials={tp.leads?.first_name?.[0] || "?"}
                name={`${tp.leads?.first_name || 'Unknown'} ${tp.leads?.last_name || ''}`}
                action={`scheduled for ${formatDistanceToNow(parseISO(tp.scheduled_for), { addSuffix: true })}`}
                status={tp.status}
                link={`/contacts/${tp.lead_id}`}
              />
            ))}
            {recentTouchpoints.filter(t => t.status !== 'sent').length === 0 && (
              <p className="text-slate-500 text-sm italic py-2">Queue is empty.</p>
            )}
          </div>

          <div className="flex items-center justify-between border-b border-[#27373a] pb-3 mt-8">
            <h2 className="text-lg font-bold text-slate-300">Transaction Milestones</h2>
          </div>
          <div className="space-y-2">
            {upcomingMilestones.length > 0 ? upcomingMilestones.map(ms => {
              const isOverdue = new Date(ms.due_date) < new Date();
              return (
                <div key={ms.id} className="flex items-center gap-4 p-3.5 bg-onyx-surface border border-[#27373a] rounded-xl hover:border-cyan/50 transition-all cursor-pointer">
                  <span className={`material-symbols-outlined text-[16px] ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`}>
                    {isOverdue ? 'error' : 'event'}
                  </span>
                  <div className="flex flex-col flex-1 truncate gap-0.5">
                    <p className="text-sm font-bold text-slate-200 truncate">{ms.title}</p>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isOverdue ? 'text-rose-500' : 'text-slate-500'}`}>
                      {isOverdue ? 'OVERDUE ' : 'DUE '} {formatDistanceToNow(parseISO(ms.due_date), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )
            }) : (
              <p className="text-slate-500 text-sm italic py-2">No active milestones pending.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function LeadCard({ lead }: { lead: any }) {
  const name = [lead.first_name, lead.last_name].filter(Boolean).join(" ") || "Unknown";
  const initials = lead.first_name ? lead.first_name.charAt(0) : "?";
  return (
    <Link href={`/contacts/${lead.id}`} className="group bg-onyx-surface border border-[#27373a] rounded-xl p-4 flex items-center gap-4 hover:bg-[#1a2029] hover:border-cyan/50 transition-all cursor-pointer">
      <div className="size-12 shrink-0 bg-cyan/10 border border-cyan/20 rounded-full flex items-center justify-center text-cyan text-lg font-black group-hover:bg-cyan group-hover:text-onyx transition-all shadow-lg">
        {initials}
      </div>
      <div className="flex flex-col gap-0.5">
        <h3 className="font-bold text-slate-100 group-hover:text-cyan transition-colors">{name}</h3>
        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">{lead.status}</p>
      </div>
    </Link>
  )
}

function ActionCard({ title, description, action, icon, color, onClick }: any) {
  const colorMap: any = {
    cyan: "bg-cyan/5 border-cyan/20 text-cyan hover:bg-cyan/10 hover:border-cyan/40",
    amber: "bg-amber-500/5 border-amber-500/20 text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/40",
    rose: "bg-rose-500/5 border-rose-500/20 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/40",
  }
  const btnColorMap: any = {
    cyan: "border-cyan/30 text-cyan group-hover:bg-cyan group-hover:text-onyx group-hover:shadow-[0_0_15px_rgba(0,209,255,0.4)]",
    amber: "border-amber-500/30 text-amber-500 group-hover:bg-amber-500 group-hover:text-onyx group-hover:shadow-[0_0_15px_rgba(245,158,11,0.4)]",
    rose: "border-rose-500/30 text-rose-500 group-hover:bg-rose-500 group-hover:text-onyx group-hover:shadow-[0_0_15px_rgba(244,63,94,0.4)]",
  }
  return (
    <div onClick={onClick} className={`border rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group transition-all cursor-pointer ${colorMap[color]}`}>
      <div className="flex flex-col gap-1.5 flex-1 pr-4">
        <h3 className="font-bold text-slate-100">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
      </div>
      <button className={`flex items-center justify-center gap-2 px-6 py-2.5 bg-onyx border text-sm font-bold rounded-lg whitespace-nowrap transition-all shadow-lg ${btnColorMap[color]}`}>
        <span className="material-symbols-outlined text-[18px]">{icon}</span> {action}
      </button>
    </div>
  )
}

function MetricCard({ title, value, trend, icon, neutral, color }: any) {
  const colorMap: any = { cyan: 'text-cyan', emerald: 'text-emerald-500', amber: 'text-amber-500' }
  const bgMap: any = { cyan: 'bg-cyan/10 border-cyan/20', emerald: 'bg-emerald-500/10 border-emerald-500/20', amber: 'bg-amber-500/10 border-amber-500/20' }

  return (
    <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-6 hover:border-slate-500/40 transition-all shadow-xl hover:-translate-y-1">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2.5 rounded-lg border shadow-lg ${bgMap[color]}`}>
          <span className={`material-symbols-outlined text-xl leading-none ${colorMap[color]}`}>{icon}</span>
        </div>
        <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">{title}</span>
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-4xl font-black font-display tracking-tight text-white">{value}</span>
        <span className={`text-sm font-bold ${neutral ? 'text-slate-500' : 'text-emerald-500'}`}>{trend}</span>
      </div>
    </div>
  )
}

function PropertyRow({ property }: { property: any }) {
  // Synthesize a marketing score out of 100 based on page_views
  const score = Math.min(100, Math.max(10, Math.floor((property.page_views / 250) * 100 + 10)));
  const address = property.address_line1 || "Unknown Address";

  return (
    <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-4 flex items-center justify-between hover:bg-[#1a2029] hover:border-cyan/30 transition-all cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="size-12 rounded-lg flex items-center justify-center bg-onyx border border-[#27373a] shadow-inner overflow-hidden">
          {property.thumbnail_url ? (
            <img src={property.thumbnail_url} className="w-full h-full object-cover" alt="Property" />
          ) : (
            <span className="material-symbols-outlined text-slate-600">home</span>
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-bold text-slate-100">{address}</h3>
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{property.page_views} Traffic Logs</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 min-w-[100px]">
        <div className="flex justify-between w-full items-end">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Score</span>
          <span className={`text-xs font-black uppercase tracking-widest text-emerald-400`}>{score}%</span>
        </div>
        <div className="w-full bg-onyx rounded-full h-1.5 border border-[#27373a] overflow-hidden">
          <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${score}%` }}></div>
        </div>
      </div>
    </div>
  )
}

function ActivityRow({ initials, name, action, status, link }: any) {
  const isDraft = status === 'draft';
  const color = isDraft ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'text-cyan bg-cyan/5 border-cyan/20';

  return (
    <Link href={link} className="flex items-center gap-4 p-3.5 rounded-xl border border-transparent hover:border-[#27373a] hover:bg-onyx-surface hover:shadow-md transition-all cursor-pointer group">
      <div className={`size-10 shrink-0 border rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-inner ${color}`}>
        {isDraft ? <span className="material-symbols-outlined text-sm">warning</span> : <span className="material-symbols-outlined text-sm">mail</span>}
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-sm text-slate-300 truncate"><span className="font-bold text-white group-hover:text-cyan transition-colors">{name}</span></p>
        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide truncate">{action}</p>
      </div>
      <span className="material-symbols-outlined text-slate-600 ml-auto group-hover:text-cyan transition-colors text-lg opacity-0 group-hover:opacity-100">chevron_right</span>
    </Link>
  )
}
