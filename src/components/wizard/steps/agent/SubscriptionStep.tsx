"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useOnboarding } from "./OnboardingContext";

const PLANS = [
  { title: "Free Agent", price: "$0", features: ["Basic CRM", "1 Active Transaction"] },
  { title: "Junior Agent", price: "$49", features: ["Full CRM Access", "5 Active Transactions", "Basic Content Studio"] },
  { title: "Senior Agent", price: "$99", features: ["Unlimited Transactions", "Full Content Studio", "AI Coordinator"], popular: true },
  { title: "Broker", price: "$249", features: ["Multi-agent Management", "Custom Brand Templates", "Priority 24/7 Support"] },
];

function SubscriptionStepContent() {
  const { data, updateData } = useOnboarding();
  const searchParams = useSearchParams();
  // On first render, if a tier is passed via URL and context is still default, honour it
  const [initialised, setInitialised] = useState(false);
  if (!initialised) {
    const tier = searchParams.get("tier");
    if (tier) updateData({ subscriptionTier: tier });
    setInitialised(true);
  }

  return (
    <div className="flex flex-col gap-8 h-full pr-2 pb-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold font-display tracking-tight border-l-4 border-cyan pl-4">Select Your Plan</h2>
        <p className="text-slate-400 pl-4">Choose the workspace that best fits your real estate business needs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
        {PLANS.map((plan) => (
          <PricingCard
            key={plan.title}
            title={plan.title}
            price={plan.price}
            features={plan.features}
            popular={plan.popular}
            isSelected={data.subscriptionTier === plan.title}
            onClick={() => updateData({ subscriptionTier: plan.title })}
          />
        ))}
      </div>
    </div>
  );
}

export function SubscriptionStep() {
  return (
    <Suspense fallback={<div className="animate-pulse h-96 bg-white/5 rounded-xl" />}>
      <SubscriptionStepContent />
    </Suspense>
  );
}

function PricingCard({ title, price, features, popular, isSelected, onClick }: { title: string; price: string; features: string[]; popular?: boolean; isSelected: boolean; onClick: () => void }) {
  return (
    <div
      className={`relative bg-onyx-surface rounded-xl p-8 flex flex-col border-2 transition-all cursor-pointer hover:-translate-y-1 ${isSelected ? "border-cyan shadow-[0_0_20px_rgba(0,209,255,0.15)] scale-[1.02]" : "border-[#27373a] hover:border-cyan/50 hover:shadow-lg"}`}
      onClick={onClick}
    >
      {popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-cyan text-onyx text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-[0_0_10px_rgba(0,209,255,0.5)]">
          Most Popular
        </div>
      )}
      <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
      <div className="flex items-baseline mb-8">
        <span className="text-4xl font-black text-white">{price}</span>
        <span className="text-slate-500 ml-2 font-medium">/mo</span>
      </div>
      <ul className="space-y-4 mb-8 flex-grow text-sm text-slate-300">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="material-symbols-outlined text-cyan text-lg">check_circle</span>
            {feature}
          </li>
        ))}
      </ul>
      <button className={`w-full py-3 px-4 rounded-lg font-bold transition-all ${isSelected ? "bg-cyan text-onyx shadow-lg shadow-cyan/20" : "bg-onyx border border-[#27373a] text-slate-300 hover:bg-[#27373a] hover:text-white"}`}>
        {isSelected ? "Selected" : "Select Plan"}
      </button>
    </div>
  );
}
