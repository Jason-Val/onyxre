"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding } from "./OnboardingContext";

interface BrokerA2PStepProps {
  onSkip: () => void;
}

const SUB_STEPS = ["Business Profile", "Messaging Intent"];

export function BrokerA2PStep({ onSkip }: BrokerA2PStepProps) {
  const { data, updateData } = useOnboarding();
  const [subStep, setSubStep] = useState(0);

  return (
    <div className="flex flex-col gap-6 h-full pr-2 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold font-display tracking-tight border-l-4 border-cyan pl-4">
          A2P 10DLC Compliance
        </h2>
        <p className="text-slate-400 pl-4">
          US carrier regulations require all businesses sending SMS to register their brand. This
          ensures your Loomis CRM messages achieve the highest deliverability.
        </p>
      </div>

      {/* Sub-step progress */}
      <div className="flex gap-2">
        {SUB_STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border-2 transition-all ${
                i < subStep
                  ? "bg-cyan border-cyan text-onyx"
                  : i === subStep
                  ? "border-cyan text-cyan"
                  : "border-[#30363D] text-slate-500"
              }`}
            >
              {i < subStep ? (
                <span className="material-symbols-outlined text-sm">check</span>
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`text-xs font-semibold hidden sm:block ${
                i === subStep ? "text-cyan" : "text-slate-500"
              }`}
            >
              {label}
            </span>
            {i < SUB_STEPS.length - 1 && (
              <div className={`flex-1 h-px ${i < subStep ? "bg-cyan/50" : "bg-[#30363D]"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Sub-step content */}
      <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-8 shadow-2xl flex-1">
        <AnimatePresence mode="wait">
          {subStep === 0 && (
            <motion.div
              key="business"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <InfoBanner icon="verified_user">
                <strong className="text-cyan">Step 1 — Business Profile</strong>
                <br />
                Register your brokerage with mobile carriers using your official business details.
              </InfoBanner>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Legal Business Name"
                  placeholder="Global Realty LLC"
                  value={data.a2pLegalName}
                  onChange={(v) => updateData({ a2pLegalName: v })}
                />
                <Input
                  label="Business Registration Number (EIN)"
                  placeholder="XX-XXXXXXX"
                  value={data.a2pEin}
                  onChange={(v) => updateData({ a2pEin: v })}
                />
                <Input
                  label="Business Type"
                  placeholder="LLC / Corporation / Partnership"
                  value={data.a2pBusinessType}
                  onChange={(v) => updateData({ a2pBusinessType: v })}
                />
                <Input
                  label="Industry"
                  placeholder="Real Estate"
                  value={data.a2pIndustry}
                  onChange={(v) => updateData({ a2pIndustry: v })}
                />
                <Input
                  label="Business Website"
                  placeholder="https://www.yourdomain.com"
                  value={data.a2pWebsite}
                  onChange={(v) => updateData({ a2pWebsite: v })}
                />
                <Input
                  label="Business Address"
                  placeholder="123 Main St, City, State, ZIP"
                  value={data.a2pAddress}
                  onChange={(v) => updateData({ a2pAddress: v })}
                />
              </div>
              {/* SMS Consent */}
              <div
                className="flex items-center gap-4 p-4 bg-onyx border border-[#27373a] rounded-lg cursor-pointer hover:border-cyan/50 transition-colors"
                onClick={() => updateData({ a2pSmsConsent: !data.a2pSmsConsent })}
              >
                <div
                  className={`size-6 rounded border flex items-center justify-center transition-all shrink-0 ${
                    data.a2pSmsConsent ? "border-cyan bg-cyan/10" : "border-slate-600"
                  }`}
                >
                  {data.a2pSmsConsent && (
                    <span className="material-symbols-outlined text-cyan text-sm">check</span>
                  )}
                </div>
                <p className="text-sm text-slate-300 select-none">
                  I consent to sending automated marketing and transactional SMS messages to
                  opted-in contacts via Specular OS Loomis CRM.
                </p>
              </div>
            </motion.div>
          )}

          {subStep === 1 && (
            <motion.div
              key="messaging"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <InfoBanner icon="chat">
                <strong className="text-cyan">Step 2 — Messaging Intent</strong>
                <br />
                Carriers need to see exactly what you&apos;ll be sending. We&apos;ve pre-filled
                these based on our high-conversion templates — feel free to tweak them.
              </InfoBanner>
              <Textarea
                label="Campaign Description"
                value={data.a2pCampaignDescription}
                onChange={(v) => updateData({ a2pCampaignDescription: v })}
                rows={3}
              />
              <Textarea
                label="Sample Message 1 — Inbound Lead"
                value={data.a2pSampleMessage1}
                onChange={(v) => updateData({ a2pSampleMessage1: v })}
                rows={3}
              />
              <Textarea
                label="Sample Message 2 — Follow-Up"
                value={data.a2pSampleMessage2}
                onChange={(v) => updateData({ a2pSampleMessage2: v })}
                rows={3}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sub-step nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => subStep > 0 && setSubStep((s) => s - 1)}
          disabled={subStep === 0}
          className="text-sm text-slate-400 hover:text-white disabled:opacity-0 transition-colors"
        >
          ← Back
        </button>
        {subStep < SUB_STEPS.length - 1 && (
          <button
            onClick={() => setSubStep((s) => s + 1)}
            className="px-6 py-2.5 bg-cyan text-onyx font-bold rounded-xl hover:brightness-110 transition-all text-sm"
          >
            Next →
          </button>
        )}
      </div>

      {/* Skip */}
      <div className="text-center -mt-2">
        <button
          onClick={onSkip}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-4"
        >
          Skip for now
        </button>
        <p className="text-xs text-yellow-500/70 mt-1">
          ⚠ Your Loomis CRM will not be able to send SMS until A2P registration is complete.
        </p>
      </div>
    </div>
  );
}

function InfoBanner({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 bg-cyan/5 border border-cyan/20 p-5 rounded-lg text-sm text-slate-300 leading-relaxed">
      <span className="material-symbols-outlined text-cyan text-2xl shrink-0">{icon}</span>
      <div>{children}</div>
    </div>
  );
}

function Input({
  label, placeholder, value, onChange,
}: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-slate-300 text-sm font-semibold ml-1">{label}</label>
      <input
        className="w-full bg-onyx border border-[#27373a] text-slate-100 rounded-lg h-12 px-4 focus:border-cyan outline-none transition-all placeholder:text-slate-600 focus:shadow-[0_0_10px_rgba(0,209,255,0.1)]"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Textarea({
  label, value, onChange, rows = 3,
}: {
  label: string; value: string; onChange: (v: string) => void; rows?: number;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-slate-300 text-sm font-semibold ml-1">{label}</label>
      <textarea
        rows={rows}
        className="w-full bg-onyx border border-[#27373a] text-slate-100 rounded-lg px-4 py-3 focus:border-cyan outline-none transition-all placeholder:text-slate-600 focus:shadow-[0_0_10px_rgba(0,209,255,0.1)] resize-none leading-relaxed text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
