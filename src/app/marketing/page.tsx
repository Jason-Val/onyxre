"use client";

import Link from "next/link";

export default function MarketingManagerPage() {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 md:px-10 py-10 space-y-10 pb-20">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight font-display">Marketing Manager</h1>
        <p className="text-slate-400 text-sm">Create high-end media via our Content Studios and manage your Buffer schedule.</p>
      </header>

      {/* Content Studios Entry */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold border-b border-[#27373a] pb-2 text-cyan">Content Studios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Static Studio */}
          <Link href="/marketing/static" className="group">
            <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-8 hover:border-cyan/50 hover:shadow-[0_0_20px_rgba(0,209,255,0.1)] transition-all flex flex-col items-center text-center gap-4 h-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="size-20 rounded-full bg-cyan/10 border-2 border-cyan/20 flex items-center justify-center text-cyan group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(0,209,255,0.1)] z-10 font-bold">
                <span className="material-symbols-outlined text-4xl">burst_mode</span>
              </div>
              <div className="z-10">
                <h3 className="text-2xl font-bold text-white mb-2">Static Studio</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Generate beautiful static image posts with AI-optimized copy.</p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1.5 text-cyan font-bold uppercase tracking-widest text-[11px] group-hover:bg-cyan/10 px-4 py-2 rounded-full transition-all z-10 border border-transparent group-hover:border-cyan/30">
                Launch Studio <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </span>
            </div>
          </Link>

          {/* Motion Studio */}
          <Link href="/marketing/motion" className="group">
            <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-8 hover:border-indigo-400/50 hover:shadow-[0_0_20px_rgba(129,140,248,0.1)] transition-all flex flex-col items-center text-center gap-4 h-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="size-20 rounded-full bg-indigo-500/10 border-2 border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(129,140,248,0.1)] z-10">
                <span className="material-symbols-outlined text-4xl">movie_filter</span>
              </div>
              <div className="z-10">
                <h3 className="text-2xl font-bold text-white mb-2">Motion Studio</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Turn 3 photos into cinematic reels with branding overlays and AI-Optimized copy</p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1.5 text-indigo-400 font-bold uppercase tracking-widest text-[11px] group-hover:bg-indigo-500/10 px-4 py-2 rounded-full transition-all z-10 border border-transparent group-hover:border-indigo-500/30">
                Launch Studio <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </span>
            </div>
          </Link>

        </div>
      </section>

      {/* Buffer Schedule */}
      <section className="space-y-4 pt-4">
        <h2 className="text-xl font-bold border-b border-[#27373a] pb-2 text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-500">calendar_month</span> Scheduled Posts (Buffer)
        </h2>
        <div className="bg-onyx-surface border border-[#27373a] rounded-xl overflow-hidden shadow-xl">
          <ScheduleRow platform="Instagram" type="Reel" content="123 Maple St - Cinematic Fly-through" date="Today, 2:00 PM" status="Pending" icon="photo_camera" />
          <ScheduleRow platform="Facebook" type="Post" content="Market Update - Q3 Beverly Hills" date="Tomorrow, 9:00 AM" status="Scheduled" icon="public" />
          <ScheduleRow platform="LinkedIn" type="Article" content="Why now is the time to sell..." date="Fri, Oct 12, 11:30 AM" status="Scheduled" icon="work" />
        </div>
      </section>
    </div>
  );
}

function ScheduleRow({ platform, type, content, date, status, icon }: { platform: string, type: string, content: string, date: string, status: string, icon: string }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 p-5 py-4 border-b border-[#27373a] last:border-0 hover:bg-[#1a2029] transition-colors cursor-pointer group">
      <div className="flex items-center gap-4 flex-1">
        <div className="size-10 shrink-0 rounded bg-onyx border border-[#27373a] flex items-center justify-center text-slate-400 group-hover:text-cyan group-hover:border-cyan/50 transition-colors">
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-slate-200">{platform}</h4>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-onyx border border-[#27373a] text-slate-500 shadow-inner group-hover:bg-[#27373a] transition-colors">{type}</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{content}</p>
        </div>
      </div>
      <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-2 md:mt-0">
        <p className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wide"><span className="material-symbols-outlined text-[14px] text-slate-500">schedule</span> {date}</p>
        <span className={`text-[10px] uppercase tracking-widest font-black px-3 py-1 bg-onyx border rounded-full ${status === 'Pending' ? 'text-amber-500 border-amber-500/30 shadow-[0_0_5px_rgba(245,158,11,0.2)]' : 'text-cyan border-cyan/30 shadow-[0_0_5px_rgba(0,209,255,0.2)]'}`}>{status}</span>
      </div>
    </div>
  )
}
