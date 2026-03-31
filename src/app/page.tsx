"use client";

import { useState } from "react";
import Link from "next/link";
import SplineScene from "@/components/ui/SplineScene";
import Starfield from "@/components/ui/Starfield";
import AuthSlider from "@/components/ui/AuthSlider";

export default function Home() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden bg-onyx text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Starfield />
      </div>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 glass-morphism h-20 flex items-center px-6 md:px-12 justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center p-1 rounded-xl bg-cyan/5 border border-cyan/20 shadow-[0_0_15px_rgba(0,209,255,0.1)]">
            <img src="/SpecOS_LOGO.png" alt="Specular OS Logo" className="h-8 w-auto object-contain drop-shadow-[0_0_10px_rgba(0,209,255,0.3)]" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight hidden sm:block">
            Specular OS
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium text-slate-300 hover:text-cyan transition-colors">Features</Link>
          <Link href="#pricing" className="text-sm font-medium text-slate-300 hover:text-cyan transition-colors">Pricing</Link>
          <Link href="#mission" className="text-sm font-medium text-slate-300 hover:text-cyan transition-colors">Mission</Link>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsAuthOpen(true)} 
            className="hidden sm:block text-sm font-bold text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={() => setIsAuthOpen(true)}
            className="px-5 py-2.5 bg-cyan/10 border border-cyan/30 text-cyan text-sm font-bold rounded-lg hover:bg-cyan hover:text-onyx transition-all shadow-[0_0_15px_rgba(0,209,255,0.2)] hover:shadow-[0_0_25px_rgba(0,209,255,0.5)]"
          >
            Get Demo
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 min-h-[90vh] flex flex-col items-center justify-center z-10 text-center pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-onyx-surface border border-[#30363D] mb-8 animate-[fade-in-up_1s_ease-out] pointer-events-auto">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan"></span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Specular OS OS 2.0 is Live</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black font-serif tracking-tight mb-2 max-w-4xl mx-auto leading-tight pointer-events-auto">
          Elite Intelligence for the <br />
          <span className="text-gradient">Modern Realtor.</span>
        </h1>

        {/* 3D Asset */}
        <div className="w-[50%] h-[400px] md:h-[125px] pointer-events-auto relative z-20 my-4 flex justify-center items-center">
          <SplineScene scene="https://prod.spline.design/D5g4b1oh5zQ8zu8j/scene.splinecode" />
        </div>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 font-medium pointer-events-auto">
          Automating the busy work of marketing and communication to amplify the elite agent. Stop managing software, start closing deals.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto pointer-events-auto">
          <button 
            onClick={() => setIsAuthOpen(true)}
            className="w-full sm:w-auto px-8 py-4 bg-cyan text-onyx font-bold rounded-xl hover:bg-white transition-all shadow-[0_0_30px_rgba(0,209,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2"
          >
            Enter Command Center <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
          <button className="w-full sm:w-auto px-8 py-4 bg-onyx-surface border border-[#30363D] text-white font-bold rounded-xl hover:bg-[#1f2631] transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[20px]">play_circle</span> Watch Video
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div id="features" className="w-full max-w-7xl mx-auto mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-0 pointer-events-auto perspective-1000 scroll-mt-32">
          {[
            {
              title: "Marketing Manager",
              description: "Generate, Schedule and Post",
              icon: "campaign"
            },
            {
              title: "Loomis CRM",
              description: "Intelligent Lead Management",
              icon: "contact_page"
            },
            {
              title: "Transaction Manager",
              description: "Seamless Deal Tracking",
              icon: "handshake"
            },
            {
              title: "Property Manager",
              description: "Comprehensive Listing Control",
              icon: "real_estate_agent"
            }
          ].map((feature, i) => (
            <div 
              key={i} 
              className="aspect-[4/5] rounded-3xl border border-t-white/10 border-x-white/5 border-b-black/50 bg-gradient-to-b from-[#161B26]/40 to-[#0A0D14]/60 backdrop-blur-md p-8 flex flex-col items-center justify-center text-center hover:-translate-y-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_15px_40px_rgba(0,0,0,0.8)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_20px_40px_rgba(0,209,255,0.15)] hover:border-t-cyan/40 hover:border-x-cyan/20 transition-all duration-500 group relative overflow-hidden"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -top-24 -right-24 size-48 bg-cyan/20 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              <div className="size-20 rounded-2xl bg-gradient-to-br from-[#1F2633] to-[#0A0D14] border border-t-white/10 border-x-white/5 border-b-black shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_10px_20px_rgba(0,0,0,0.5)] flex items-center justify-center mb-8 group-hover:border-cyan/30 group-hover:from-cyan/10 group-hover:to-transparent transition-colors duration-500 relative z-10 overflow-hidden">
                 <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="material-symbols-outlined text-4xl text-cyan transition-all duration-500 drop-shadow-[0_0_10px_rgba(0,209,255,0.3)] group-hover:drop-shadow-[0_0_20px_rgba(0,209,255,0.8)] group-hover:scale-110">
                  {feature.icon}
                </span>
              </div>
              
              <h3 className="font-display font-bold text-xl mb-3 tracking-tight text-white group-hover:text-cyan transition-colors duration-300 relative z-10 drop-shadow-md">
                {feature.title}
              </h3>
              
              <p className="text-sm text-slate-400 font-medium relative z-10 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative py-24 px-6 z-10 flex flex-col items-center scroll-mt-20">
        <h2 className="text-4xl md:text-5xl font-black font-serif tracking-tight mb-4 text-center">
          Transparent <span className="text-gradient">Pricing</span>
        </h2>
        <p className="text-slate-400 max-w-2xl text-center mb-16">
          Scalable intelligence for every stage of your real estate career.
        </p>
        
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 perspective-1000 pointer-events-auto">
          {[
            { title: "Free Agent", price: "$0/mo", desc: "For individual agents getting started." },
            { title: "Junior Agent", price: "$49/mo", desc: "Advanced tools and automation." },
            { title: "Senior Agent", price: "$99/mo", desc: "Elite capabilities for top producers." },
            { title: "Broker", price: "Custom", desc: "Enterprise scale for entire brokerages." }
          ].map((tier, i) => (
            <div 
              key={i} 
              className="aspect-[4/5] rounded-3xl border border-t-white/10 border-x-white/5 border-b-black/50 bg-gradient-to-b from-[#161B26]/40 to-[#0A0D14]/60 backdrop-blur-md p-8 flex flex-col items-center justify-center text-center hover:-translate-y-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_15px_40px_rgba(0,0,0,0.8)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_20px_40px_rgba(0,209,255,0.15)] hover:border-t-cyan/40 hover:border-x-cyan/20 transition-all duration-500 group relative overflow-hidden"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -top-24 -right-24 size-48 bg-cyan/20 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              <h3 className="font-display font-bold text-2xl mb-2 tracking-tight text-white group-hover:text-cyan transition-colors duration-300 relative z-10 drop-shadow-md">
                {tier.title}
              </h3>
              
              <div className="text-3xl font-black mb-6 relative z-10 text-cyan">
                {tier.price}
              </div>
              
              <p className="text-sm text-slate-400 font-medium relative z-10 leading-relaxed group-hover:text-slate-300 transition-colors duration-300 mb-8">
                {tier.desc}
              </p>
              
              <Link 
                href={`/onboarding?tier=${encodeURIComponent(tier.title)}`}
                className="mt-auto relative z-10 px-6 py-3 w-full rounded-xl bg-onyx-surface border border-[#30363D] font-bold text-white group-hover:bg-cyan group-hover:text-onyx transition-all duration-300 text-center block"
              >
                Select Tier
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="relative py-32 px-6 z-10 flex flex-col items-center justify-center min-h-[60vh] scroll-mt-20 border-t border-white/5 bg-gradient-to-b from-transparent to-[#050608] pointer-events-auto">
        <div className="w-full max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black font-serif tracking-tight mb-8">
            Our <span className="text-gradient">Mission</span>
          </h2>
          <div className="rounded-3xl border border-t-white/10 border-x-white/5 border-b-black/50 bg-gradient-to-b from-[#161B26]/40 to-[#0A0D14]/60 backdrop-blur-md p-10 md:p-16 relative overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_15px_40px_rgba(0,0,0,0.8)]">
            <div className="absolute inset-0 bg-cyan/5 opacity-50 blur-3xl rounded-full" />
            <p className="text-xl md:text-2xl leading-relaxed text-slate-300 font-medium relative z-10 italic">
              "To be decided..."
            </p>
          </div>
        </div>
      </section>

      <AuthSlider isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
