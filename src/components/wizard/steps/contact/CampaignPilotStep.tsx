"use client";

export function CampaignPilotStep() {
  return (
    <div className="flex flex-col gap-8 h-full pr-2 pb-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold font-display tracking-tight border-l-4 border-cyan pl-4">Campaign Pilot</h2>
        <p className="text-slate-400 pl-4">Select an Anthropic-powered 30-day automated drip campaign.</p>
      </div>

      <div className="bg-onyx-surface border border-[#27373a] rounded-xl overflow-hidden shadow-2xl">
        {/* Campaign Header */}
        <div className="bg-[#161B22] border-b border-[#27373a] p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="size-12 bg-cyan/20 text-cyan rounded-lg flex items-center justify-center border border-cyan/30">
              <span className="material-symbols-outlined text-2xl">smart_toy</span>
            </div>
            <div>
              <h3 className="font-bold text-xl text-white">"Warm Seller" 30-Day Nurture</h3>
              <p className="text-sm text-slate-400">Powered by Anthropic Claude 3.5 Sonnet</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-full border border-emerald-500/20">
            <span className="material-symbols-outlined text-sm">bolt</span>
            <span className="text-xs font-bold tracking-widest uppercase">High Conversion</span>
          </div>
        </div>

        {/* Campaign Nodes timeline */}
        <div className="p-8 flex flex-col gap-6 relative">
          <div className="absolute left-11 top-8 bottom-8 w-0.5 bg-[#27373a]"></div>

          <Node day={1} icon="mail" title="Introduction & Market Overview" type="Email" />
          <Node day={3} icon="sms" title="Quick Check-in (Casual)" type="SMS" />
          <Node day={7} icon="real_estate_agent" title="Recent Sold Properties Near Them" type="Email + Interactive CMA" active />
          <Node day={14} icon="call" title="Schedule Strategy Call Task" type="Action Required" />
        </div>
      </div>
    </div>
  );
}

function Node({ day, icon, title, type, active }: { day: number, icon: string, title: string, type: string, active?: boolean }) {
  return (
    <div className={`flex items-start gap-6 relative z-10 ${active ? 'opacity-100' : 'opacity-70'}`}>
      <div className={`mt-1 size-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${active ? 'bg-cyan border-cyan text-onyx shadow-[0_0_10px_rgba(0,209,255,0.5)]' : 'bg-onyx border-[#27373a] text-slate-400'}`}>
        {day}
      </div>
      <div className={`flex-1 flex items-center justify-between p-4 rounded-xl border ${active ? 'bg-cyan/5 border-cyan/30' : 'bg-onyx border-[#27373a]'}`}>
        <div className="flex items-center gap-3">
          <span className={`material-symbols-outlined ${active ? 'text-cyan' : 'text-slate-500'}`}>{icon}</span>
          <span className={`font-semibold ${active ? 'text-white' : 'text-slate-300'}`}>{title}</span>
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{type}</span>
      </div>
    </div>
  )
}
