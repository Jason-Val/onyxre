"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/client";
import { motion } from "framer-motion";

const PLANS = [
  { title: "Free Agent",    price: "$0",   features: ["Basic CRM", "1 Active Transaction"] },
  { title: "Junior Agent",  price: "$49",  features: ["Full CRM Access", "5 Active Transactions", "Basic Content Studio"] },
  { title: "Senior Agent",  price: "$99",  features: ["Unlimited Transactions", "Full Content Studio", "AI Coordinator"], popular: true },
  { title: "Broker",        price: "$249", features: ["Multi-agent Management", "Custom Brand Templates", "Priority 24/7 Support"] },
];

export default function PlanSelectionPage() {
  const [selected, setSelected] = useState("Senior Agent");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace("/signup");
      else setChecking(false);
    });
  }, []);

  async function handleContinue() {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/signup"); return; }

      // Single SECURITY DEFINER RPC — creates org + links profile atomically,
      // avoiding the RLS chicken-and-egg problem on the RETURNING clause.
      const { error: rpcError } = await supabase.rpc("create_org_and_link_profile", {
        p_name: "My Organization",
        p_subscription_tier: selected,
      });
      if (rpcError) throw new Error(rpcError.message);

      router.push("/onboarding");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(msg);
      console.error("[signup/plan]", msg);
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-cyan/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl z-10"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-cyan text-xs font-bold uppercase tracking-widest mb-3">Step 2 of 3</p>
          <h1 className="text-4xl font-bold font-display text-white mb-3">Choose Your Plan</h1>
          <p className="text-slate-400">Start free and upgrade anytime. No credit card required.</p>
        </div>

        {/* Pricing grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {PLANS.map((plan, i) => {
            const isSelected = selected === plan.title;
            return (
              <motion.div
                key={plan.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setSelected(plan.title)}
                className={`relative bg-[#161B26] rounded-2xl p-7 flex flex-col border-2 transition-all cursor-pointer hover:-translate-y-1 ${
                  isSelected
                    ? "border-cyan shadow-[0_0_25px_rgba(0,209,255,0.15)]"
                    : "border-[#30363D] hover:border-cyan/40"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-cyan text-onyx text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                    Most Popular
                  </div>
                )}
                <h2 className="text-lg font-bold text-white mb-1">{plan.title}</h2>
                <div className="flex items-baseline mb-6">
                  <span className="text-3xl font-black text-white">{plan.price}</span>
                  <span className="text-slate-500 ml-1.5 text-sm">/mo</span>
                </div>
                <ul className="space-y-3 flex-grow text-sm text-slate-300 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-cyan text-base mt-0.5">check_circle</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className={`w-full py-2.5 rounded-xl text-sm font-bold text-center transition-all ${
                  isSelected ? "bg-cyan text-onyx" : "bg-[#0A0D14] border border-[#30363D] text-slate-400"
                }`}>
                  {isSelected ? "✓ Selected" : "Select"}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={loading}
            className="px-12 py-4 bg-cyan text-onyx font-bold rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,209,255,0.2)] text-base disabled:opacity-50"
          >
            {loading ? "Setting up…" : `Continue with ${selected} →`}
          </button>
          {error && (
            <p className="mt-4 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 max-w-sm mx-auto">
              {error}
            </p>
          )}
          <p className="text-slate-500 text-xs mt-4">You can change your plan at any time from settings.</p>
        </div>
      </motion.div>
    </div>
  );
}
