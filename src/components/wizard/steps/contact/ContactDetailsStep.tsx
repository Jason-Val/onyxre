"use client";

import { motion } from "framer-motion";

export function ContactDetailsStep() {
  const heatIndexOptions = [
    { label: "Hot", value: "HOT", color: "text-red-500", border: "border-red-500/50", bg: "bg-red-500/10" },
    { label: "Warm", value: "WARM", color: "text-orange-500", border: "border-orange-500/50", bg: "bg-orange-500/10" },
    { label: "Cold", value: "COLD", color: "text-blue-500", border: "border-blue-500/50", bg: "bg-blue-500/10" },
  ];

  return (
    <div className="flex flex-col gap-8 h-full pr-2 pb-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold font-display tracking-tight border-l-4 border-cyan pl-4">Contact Details</h2>
        <p className="text-slate-400 pl-4">Enter the primary information for your new lead or client.</p>
      </div>

      <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-8 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Input label="First Name" placeholder="Sarah" />
          <Input label="Last Name" placeholder="Kendrick" />
          <Input label="Email Address" placeholder="sarah.k@example.com" />
          <Input label="Phone Number" placeholder="(555) 123-4567" />
        </div>

        <div className="flex flex-col gap-4 mb-8">
          <label className="text-slate-300 text-sm font-semibold ml-1">Heat Index</label>
          <div className="grid grid-cols-3 gap-4">
            {heatIndexOptions.map((opt) => (
              <button
                key={opt.value}
                className={`flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all hover:scale-[1.02] ${opt.border} ${opt.bg}`}
              >
                <span className={`font-black uppercase tracking-tighter text-lg ${opt.color}`}>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-slate-300 text-sm font-semibold ml-1">Internal Notes</label>
          <textarea className="w-full bg-onyx border border-[#27373a] text-slate-100 rounded-lg p-4 focus:border-cyan outline-none resize-none h-32 transition-all placeholder:text-slate-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]" placeholder="Met at 123 Maple St open house. Looking to buy in next 3 months..."></textarea>
        </div>
      </div>
    </div>
  );
}

function Input({ label, placeholder, defaultValue }: { label: string, placeholder: string, defaultValue?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-slate-300 text-sm font-semibold ml-1">{label}</label>
      <input 
        className="w-full bg-onyx border border-[#27373a] text-slate-100 rounded-lg h-12 px-4 focus:border-cyan outline-none transition-all placeholder:text-slate-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]" 
        placeholder={placeholder} 
        defaultValue={defaultValue}
      />
    </div>
  )
}
