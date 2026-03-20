"use client";

import { useState, useEffect } from "react";
import { WizardFrame } from "@/components/wizard/WizardFrame";

const STEPS = [
  { title: "Select Property & Engine" },
  { title: "Media Selection" },
  { title: "Style & Music" },
  { title: "Kie Assembly" },
];

export default function MotionStudioWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleNext = () => {
    if (currentStep === 2) {
      setCurrentStep(3);
      setIsGenerating(true);
      setTimeout(() => setIsGenerating(false), 5000);
    } else if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      window.location.href = "/marketing";
    }
  };

  const handlePrev = () => {
    if (currentStep > 0 && !isGenerating) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-onyx text-slate-100 flex items-center justify-center mt-8">
      <WizardFrame
        title="Motion Studio"
        steps={STEPS}
        currentStep={currentStep}
        onNext={handleNext}
        onPrev={handlePrev}
        nextLabel={currentStep === 2 ? "Generate Reel" : currentStep === 3 ? "Export to Buffer" : "Continue"}
        isNextDisabled={isGenerating}
      >
        <Step1Property />
        <Step2Media />
        <Step3Style />
        <Step4Generate isGenerating={isGenerating} />
      </WizardFrame>
    </div>
  );
}

function Step1Property() {
  return (
    <div className="flex flex-col gap-8 pr-2">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold border-l-4 border-indigo-400 pl-4 tracking-tight">Select Property & Goal</h2>
        <p className="text-slate-400 pl-4">Choose the subject of your cinematic reel.</p>
      </div>
      <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-8 shadow-2xl">
        <h3 className="font-bold mb-4">Active Listings</h3>
        <select className="w-full bg-onyx border border-[#27373a] text-slate-100 rounded-lg h-12 px-4 outline-none focus:border-indigo-400 transition-colors mb-8 appearance-none">
          <option>123 Maple St, Beverly Hills ($2.45M)</option>
          <option>456 Oak Ave, Santa Monica ($1.85M)</option>
        </select>
        
        <h3 className="font-bold mb-4">Campaign Goal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GoalCard title="Just Listed" desc="High energy, FOMO-driven." active />
          <GoalCard title="Open House" desc="Inviting, date/time focused." />
          <GoalCard title="Price Drop" desc="Urgency, value emphasis." />
          <GoalCard title="Just Sold" desc="Social proof, agent boasting." />
        </div>
      </div>
    </div>
  )
}

function GoalCard({ title, desc, active }: { title: string, desc: string, active?: boolean }) {
  return (
    <div className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${active ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-onyx-surface border-[#27373a] hover:border-slate-500'}`}>
      <h4 className={`font-bold ${active ? 'text-indigo-400' : 'text-slate-200'}`}>{title}</h4>
      <p className="text-xs text-slate-400 mt-1">{desc}</p>
    </div>
  )
}

function Step2Media() {
  return (
    <div className="flex flex-col gap-8 pr-2">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold border-l-4 border-indigo-400 pl-4 tracking-tight">Media Selection</h2>
        <p className="text-slate-400 pl-4">Select exactly 5 photos. Kie.ai will animate them into 3-second fly-throughs.</p>
      </div>
      <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-8 shadow-2xl">
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
           {[...Array(10)].map((_, i) => (
             <div key={i} className={`aspect-square bg-onyx border-2 rounded-lg relative cursor-pointer overflow-hidden group ${i < 5 ? 'border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]' : 'border-[#27373a]'}`}>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-600 text-3xl group-hover:scale-110 transition-transform">image</span>
                </div>
                {i < 5 && (
                  <div className="absolute top-2 right-2 size-5 rounded-full bg-indigo-500 text-onyx flex items-center justify-center text-[10px] font-bold shadow-lg">
                    {i + 1}
                  </div>
                )}
             </div>
           ))}
        </div>
        <p className="text-center mt-6 text-sm font-bold text-indigo-400">5 of 5 Photos Selected</p>
      </div>
    </div>
  )
}

function Step3Style() {
  return (
    <div className="flex flex-col gap-8 pr-2">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold border-l-4 border-indigo-400 pl-4 tracking-tight">Style & Music</h2>
        <p className="text-slate-400 pl-4">Remotion will assemble the clips with dynamic text overlays synced to the beat.</p>
      </div>
      <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-8 shadow-2xl flex flex-col gap-8">
        <div>
          <h3 className="font-bold mb-4">Text Overlay Style</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="py-4 border-2 border-indigo-500 bg-indigo-500/10 text-indigo-400 font-bold rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.2)]">Modern Minimal (Default)</button>
            <button className="py-4 border-2 border-[#27373a] hover:border-slate-500 text-slate-300 font-bold rounded-xl transition-colors">Luxury Serif</button>
          </div>
        </div>
        <div>
          <h3 className="font-bold mb-4 flex items-center justify-between">
            Audio Track
            <span className="text-xs text-indigo-400 font-bold bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]">Trending on IG/TikTok</span>
          </h3>
          <div className="p-4 bg-onyx border border-[#27373a] rounded-lg flex items-center justify-between cursor-pointer hover:border-indigo-400 transition-colors">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-3xl text-slate-500">play_circle</span>
              <div>
                <p className="font-bold text-slate-200">Midnight City (Instrumental)</p>
                <p className="text-xs text-slate-400">140 BPM • High Energy</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-indigo-400">equalizer</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Step4Generate({ isGenerating }: { isGenerating: boolean }) {
  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center p-20 h-full text-center">
        <div className="relative size-32 mb-8">
           <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
           <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin shadow-[0_0_20px_rgba(99,102,241,0.5)]"></div>
           <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-4xl text-indigo-400 animate-pulse">movie_filter</span>
        </div>
        <h2 className="text-3xl font-bold mb-3 font-display">Kie.ai Processing...</h2>
        <p className="text-slate-400 max-w-sm">Generating 3D camera sweeps from 5 static photos and assembling overlays via Remotion.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 h-full pr-2">
      <div className="flex justify-between items-end">
        <h2 className="text-3xl font-bold border-l-4 border-emerald-500 pl-4 tracking-tight">Render Complete</h2>
        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]">Ready for Export</span>
      </div>

      <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-8 shadow-2xl flex flex-col md:flex-row gap-8 items-center">
        <div className="aspect-[9/16] w-[280px] bg-onyx rounded-xl border border-[#27373a] flex flex-col items-center justify-center relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <span className="material-symbols-outlined text-5xl text-slate-700">play_circle</span>
          <div className="absolute bottom-10 inset-x-0 flex flex-col items-center">
            <h1 className="text-2xl font-black text-white drop-shadow-lg tracking-tight">JUST LISTED</h1>
            <p className="text-sm font-bold text-white drop-shadow-md">123 Maple St</p>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-6">
          <div className="p-5 bg-onyx border border-[#27373a] rounded-xl shadow-inner">
            <h3 className="font-bold text-sm text-slate-300 mb-2">Automatically Generated Caption</h3>
            <p className="text-sm text-slate-400 italic">"Step into luxury at 123 Maple St. Features a chef's kitchen, custom hardwood, and an amazing pool setup. Ready to see it in person? DM me or hit the link in my bio. 🏡✨ #BeverlyHillsRealEstate #JustListed #LuxuryHomes"</p>
          </div>
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-5 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
             <h3 className="font-bold text-indigo-400 text-sm mb-2 flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">calendar_month</span> Buffer Schedule</h3>
             <p className="text-sm text-slate-300">This media and caption will be pushed to your Buffer queue as an Instagram Reel, TikTok, and YouTube Short.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
