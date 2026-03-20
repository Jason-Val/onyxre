"use client";

export default function DashboardPage() {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 md:px-10 py-10 space-y-10 pb-20">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 font-display">Command Center</h1>
          <p className="text-slate-400 text-sm">Welcome back, Captain. Your AI marketing engine is primed.</p>
        </div>
        
        {/* AI Brain Status Widget */}
        <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-4 min-w-[300px] relative overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)] cursor-pointer hover:border-cyan/30 transition-colors">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-cyan uppercase tracking-widest flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">memory</span> AI Pulse
            </span>
            <span className="text-xs text-slate-300 font-mono uppercase tracking-widest flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan shadow-[0_0_5px_rgba(0,209,255,1)]"></span>
              </span> 
              Active
            </span>
          </div>
          <div className="relative h-1 w-full bg-onyx rounded-full overflow-hidden border border-[#27373a]">
            <div className="absolute left-0 top-0 h-full w-[85%] bg-cyan rounded-full shadow-[0_0_10px_rgba(0,209,255,0.8)]"></div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            <span>Processing Nodes: 124</span>
            <span>Latency: 12ms</span>
          </div>
        </div>
      </header>

      {/* Next Best Actions */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2 text-cyan">
          <span className="material-symbols-outlined">psychology</span> Next Best Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <ActionCard 
             title="Follow up with Sarah Kendrick" 
             description="Sarah opened your CMA email 3 times today. High likelihood of conversion."
             action="Draft SMS"
             icon="sms"
           />
           <ActionCard 
             title="Publish New Listing Media" 
             description="Your AI-generated video for 123 Maple St is ready for review."
             action="Review Media"
             icon="movie"
           />
        </div>
      </section>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Total Conversion" value="18.4%" trend="+2.1%" icon="trending_up" />
        <MetricCard title="Active Leads" value="2,842" trend="+14%" icon="person_search" />
        <MetricCard title="Campaign ROI" value="4.2x" trend="Steady" icon="ads_click" neutral />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <section className="space-y-5">
            <h2 className="text-lg font-bold border-b border-[#27373a] pb-3">Active Campaigns</h2>
            <div className="space-y-3">
              <CampaignRow title="Summer Outreach 2024" subtitle="Email + Social • 12.4k targets" status="RUNNING" progress="45%" color="bg-cyan" />
              <CampaignRow title="AI Lead Retargeting" subtitle="Automated • 1.2k targets" status="OPTIMIZING" progress="89%" color="bg-[#8b5cf6]" />
            </div>
         </section>
         <section className="space-y-5">
            <div className="flex items-center justify-between border-b border-[#27373a] pb-3">
              <h2 className="text-lg font-bold">Recent Lead Activity</h2>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 uppercase tracking-widest">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                </span> 
                LIVE
              </span>
            </div>
            <div className="space-y-2">
               <ActivityRow initials="SK" name="Sarah Kendrick" action="interacted with High-Yield CTA" time="2 mins ago" />
               <ActivityRow initials="RM" name="Robert Miller" action="completed Onboarding Survey" time="15 mins ago" />
               <ActivityRow initials="JH" name="Julia Huang" action="booked Strategy Call" time="42 mins ago" />
            </div>
         </section>
      </div>
    </div>
  );
}

function ActionCard({ title, description, action, icon }: { title: string, description: string, action: string, icon: string }) {
  return (
    <div className="bg-cyan/5 border border-cyan/20 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-cyan/10 hover:border-cyan/40 transition-all cursor-pointer">
      <div className="flex flex-col gap-1.5 flex-1 pr-4">
        <h3 className="font-bold text-slate-100">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
      </div>
      <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-onyx border border-cyan/30 text-cyan text-sm font-bold rounded-lg whitespace-nowrap group-hover:bg-cyan group-hover:text-onyx transition-all shadow-lg group-hover:shadow-[0_0_15px_rgba(0,209,255,0.4)]">
        <span className="material-symbols-outlined text-[18px]">{icon}</span> {action}
      </button>
    </div>
  )
}

function MetricCard({ title, value, trend, icon, neutral }: { title: string, value: string, trend: string, icon: string, neutral?: boolean }) {
  return (
    <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-6 hover:border-cyan/40 transition-all shadow-xl hover:-translate-y-1">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-cyan/10 rounded-lg border border-cyan/20 shadow-[0_0_10px_rgba(0,209,255,0.1)]">
          <span className="material-symbols-outlined text-cyan text-xl leading-none">{icon}</span>
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

function CampaignRow({ title, subtitle, status, progress, color }: { title: string, subtitle: string, status: string, progress: string, color: string }) {
  const isCyan = color === 'bg-cyan';
  return (
    <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-5 flex items-center justify-between hover:bg-[#1a2029] hover:border-[#384a4d] transition-all cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="size-12 rounded-lg flex items-center justify-center bg-onyx border border-[#27373a] shadow-inner">
          <div className={`size-4 rounded-full ${color} shadow-[0_0_10px_currentColor] opacity-90`}></div>
        </div>
        <div className="flex flex-col gap-0.5">
          <h3 className="text-base font-bold text-slate-100">{title}</h3>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <span className={`text-[11px] font-black uppercase tracking-widest ${isCyan ? 'text-cyan' : 'text-[#a78bfa]'}`}>{status}</span>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{progress} complete</span>
      </div>
    </div>
  )
}

function ActivityRow({ initials, name, action, time }: { initials: string, name: string, action: string, time: string }) {
  return (
    <div className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-onyx-surface hover:shadow-md transition-all cursor-pointer group">
      <div className="size-10 shrink-0 bg-onyx-surface border border-[#27373a] rounded-full flex items-center justify-center text-xs font-bold text-slate-300 group-hover:border-cyan group-hover:text-cyan group-hover:bg-cyan/5 transition-all">
        {initials}
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-sm text-slate-300"><span className="font-bold text-white group-hover:text-cyan transition-colors">{name}</span> {action}</p>
        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">{time}</p>
      </div>
      <span className="material-symbols-outlined text-slate-600 ml-auto group-hover:text-cyan transition-colors text-lg opacity-0 group-hover:opacity-100">chevron_right</span>
    </div>
  )
}
