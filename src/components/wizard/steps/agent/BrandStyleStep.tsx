"use client";

import { useOnboarding } from "./OnboardingContext";

const DNA_OPTIONS = [
  { title: "Modern", subtitle: "Minimalist, bold typography" },
  { title: "Classic", subtitle: "Refined symmetry, elegant serifs" },
  { title: "Luxury", subtitle: "Prestigious accents, gold details" },
];

const FONT_OPTIONS = [
  { label: "Inter (Sans-Serif)", value: "Inter (Sans-Serif)", className: "" },
  { label: "Playfair Display (Serif)", value: "Playfair Display (Serif)", className: "font-serif" },
];

export function BrandStyleStep() {
  const { data, updateData } = useOnboarding();

  return (
    <div className="flex flex-col gap-8 h-full pr-2">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold font-display tracking-tight border-l-4 border-cyan pl-4">Style & Brand Calibration</h2>
        <p className="text-slate-400 pl-4">Select your visual DNA, brand colors, and typography preferences.</p>
      </div>

      {/* Visual DNA Selection */}
      <h3 className="font-bold text-xl mt-4">Visual DNA</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {DNA_OPTIONS.map((opt) => (
          <DnaCard
            key={opt.title}
            title={opt.title}
            subtitle={opt.subtitle}
            active={data.visualDna === opt.title}
            onClick={() => updateData({ visualDna: opt.title })}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        {/* Colors */}
        <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-6 flex flex-col gap-6 shadow-xl">
          <h3 className="font-bold mb-2">Brand Colors</h3>
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-slate-300">Primary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={data.primaryColor}
                onChange={(e) => updateData({ primaryColor: e.target.value })}
                className="size-12 rounded bg-transparent border-2 border-white/20 cursor-pointer p-0.5"
              />
              <input
                className="flex-1 bg-onyx border border-[#27373a] rounded-lg h-12 px-4 outline-none text-slate-100 focus:border-cyan"
                value={data.primaryColor}
                onChange={(e) => updateData({ primaryColor: e.target.value })}
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-slate-300">Secondary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={data.secondaryColor}
                onChange={(e) => updateData({ secondaryColor: e.target.value })}
                className="size-12 rounded bg-transparent border-2 border-white/20 cursor-pointer p-0.5"
              />
              <input
                className="flex-1 bg-onyx border border-[#27373a] rounded-lg h-12 px-4 outline-none text-slate-100 focus:border-cyan"
                value={data.secondaryColor}
                onChange={(e) => updateData({ secondaryColor: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-6 flex flex-col gap-6 shadow-xl">
          <h3 className="font-bold mb-2">Typography Setup</h3>
          <div className="flex flex-col gap-4">
            {FONT_OPTIONS.map((font) => {
              const isActive = data.typography === font.value;
              return (
                <button
                  key={font.value}
                  onClick={() => updateData({ typography: font.value })}
                  className={`w-full py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${isActive ? "bg-cyan text-onyx shadow-[0_0_15px_rgba(0,209,255,0.2)]" : "bg-onyx border border-[#27373a] text-slate-400 hover:bg-[#161B22]"} ${font.className}`}
                >
                  <span className="material-symbols-outlined">{isActive ? "check_circle" : "font_download"}</span>
                  {font.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function DnaCard({ title, subtitle, active, onClick }: { title: string; subtitle: string; active?: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border-2 transition-all cursor-pointer bg-onyx-surface ${active ? "border-cyan shadow-[0_0_15px_rgba(0,209,255,0.2)] scale-[1.02]" : "border-[#27373a] hover:border-slate-500 hover:scale-[1.02]"}`}
    >
      <div className="h-40 rounded-lg bg-onyx mb-4 border border-white/5 flex flex-col items-center justify-center text-slate-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan/5 to-transparent" />
        <span className="material-symbols-outlined text-5xl mb-2 z-10 text-slate-600">style</span>
      </div>
      <p className="font-bold text-lg text-slate-100">{title}</p>
      <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
    </div>
  );
}
