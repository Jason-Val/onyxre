"use client";

export function LeadTypeStep() {
  return (
    <div className="flex flex-col gap-8 h-full pr-2 pb-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold font-display tracking-tight border-l-4 border-cyan pl-4">Lead Classification</h2>
        <p className="text-slate-400 pl-4">Categorize this contact to personalize AI communication.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
        <TypeCard title="Buyer" icon="real_estate_agent" description="Searching for properties." />
        <TypeCard title="Seller" icon="sell" description="Looking to list." active />
        <TypeCard title="Investor" icon="account_balance" description="High-volume ROI focus." />
        <TypeCard title="Agent" icon="badge" description="Agent-to-Agent marketing." />
      </div>

      <div className="flex flex-col md:flex-row gap-6 mt-4">
        <div className="flex-1 bg-onyx-surface border border-[#27373a] rounded-xl p-6 flex flex-col gap-4">
          <h3 className="font-bold text-lg">Timeline & Urgency</h3>
          <div className="flex gap-4">
            <button className="flex-1 py-3 rounded-lg border border-[#27373a] text-slate-400 hover:border-cyan hover:text-cyan transition-colors">ASAP</button>
            <button className="flex-1 py-3 rounded-lg border border-cyan bg-cyan/10 text-cyan font-bold shadow-[0_0_10px_rgba(0,209,255,0.15)]">Soon</button>
            <button className="flex-1 py-3 rounded-lg border border-[#27373a] text-slate-400 hover:border-cyan hover:text-cyan transition-colors">Later</button>
          </div>
        </div>

        <div className="flex-1 bg-onyx-surface border border-cyan/30 rounded-xl p-6 flex flex-col gap-4 shadow-[0_0_20px_rgba(0,209,255,0.05)]">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">A2P Compliance</h3>
            <span className="text-[10px] bg-cyan/10 text-cyan px-2 py-1 rounded-md border border-cyan/20 font-black uppercase tracking-widest">Required</span>
          </div>
          <label className="flex items-start gap-4 cursor-pointer group">
            <div className="mt-1 relative">
              <input type="checkbox" className="peer size-6 opacity-0 absolute cursor-pointer" defaultChecked />
              <div className="size-6 bg-onyx border-2 border-[#27373a] rounded group-hover:border-cyan transition-all peer-checked:bg-cyan peer-checked:border-cyan flex items-center justify-center">
                <span className="material-symbols-outlined text-onyx text-xl font-bold">check</span>
              </div>
            </div>
            <div className="flex-1">
              <span className="text-slate-200 font-bold block mb-1">SMS Opt-in</span>
              <p className="text-[11px] text-slate-500 leading-tight">
                By checking this box, I confirm the lead has provided explicit consent to receive SMS communications.
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}

function TypeCard({ title, icon, description, active }: { title: string, icon: string, description: string, active?: boolean }) {
  return (
    <div className={`p-6 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-4 ${active ? 'bg-cyan/5 border-cyan shadow-[0_0_15px_rgba(0,209,255,0.2)] scale-[1.02]' : 'bg-onyx-surface border-[#27373a] hover:border-slate-500 hover:scale-[1.02]'}`}>
      <div className={`size-14 rounded-full flex items-center justify-center ${active ? 'bg-cyan text-onyx' : 'bg-onyx border border-[#27373a] text-slate-400'}`}>
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>
      <div>
        <h3 className={`font-bold text-xl mb-1 ${active ? 'text-white' : 'text-slate-200'}`}>{title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{description}</p>
      </div>
    </div>
  )
}
