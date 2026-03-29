"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding } from "./OnboardingContext";

interface AgentA2PStepProps {
  onSkip: () => void;
}

const SUB_STEPS = ["Identity", "Compliance Site", "Messaging Intent"];

export function AgentA2PStep({ onSkip }: AgentA2PStepProps) {
  const { data, updateData } = useOnboarding();
  // SSN is ephemeral — never stored in context or DB
  const [ssn, setSsn] = useState("");
  const [subStep, setSubStep] = useState(0);

  const agentDisplayName =
    data.agentLegalName || `${data.firstName} ${data.lastName}`.trim() || "Your Name";

  return (
    <div className="flex flex-col gap-6 h-full pr-2 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold font-display tracking-tight border-l-4 border-cyan pl-4">
          A2P 10DLC Registration
        </h2>
        <p className="text-slate-400 pl-4">
          To ensure your messages reach clients&apos; inboxes and avoid spam filters, we need to
          register your professional identity with mobile carriers.
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
              key="identity"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <InfoBanner icon="person_check">
                <strong className="text-cyan">Step 1 — Identity Verification</strong>
                <br />
                Carriers require you to register as a{" "}
                <span className="text-white font-semibold">Sole Proprietor</span>. Your legal name
                and SSN are used only to verify your identity — Specular OS never stores your SSN.
              </InfoBanner>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Legal Name"
                  placeholder="Jane Marie Smith"
                  value={data.agentLegalName}
                  onChange={(v) => updateData({ agentLegalName: v })}
                  hint="Must match your ID or tax return"
                />
                <div className="flex flex-col gap-2">
                  <label className="text-slate-300 text-sm font-semibold ml-1">
                    Social Security Number (SSN)
                  </label>
                  <input
                    type="password"
                    placeholder="•••-••-••••"
                    value={ssn}
                    onChange={(e) => setSsn(e.target.value)}
                    maxLength={11}
                    className="w-full bg-onyx border border-[#27373a] text-slate-100 rounded-lg h-12 px-4 focus:border-cyan outline-none transition-all placeholder:text-slate-600 focus:shadow-[0_0_10px_rgba(0,209,255,0.1)] tracking-widest"
                  />
                  <p className="text-xs text-slate-500 ml-1">
                    🔒 Encrypted and sent directly to the carrier registry. Specular OS never stores
                    your SSN on our servers.
                  </p>
                </div>
                <div className="md:col-span-2">
                  <Input
                    label="Primary Business Address"
                    placeholder="123 Main St, City, State, ZIP"
                    value={data.agentAddress}
                    onChange={(v) => updateData({ agentAddress: v })}
                    hint="Home address is acceptable for independent agents"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {subStep === 1 && (
            <motion.div
              key="site"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <InfoBanner icon="language">
                <strong className="text-cyan">Step 2 — Compliance Website</strong>
                <br />
                Carriers require a live website proving you&apos;re a legitimate real estate
                professional. We&apos;ve automatically generated a compliant landing page for you.
              </InfoBanner>

              {/* Agent site mock preview */}
              <div className="border border-[#27373a] rounded-xl overflow-hidden">
                <div className="bg-[#0B0E14] px-4 py-2 flex items-center gap-2 border-b border-[#27373a]">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <span className="ml-3 text-xs text-slate-500 font-mono">
                    {agentDisplayName.toLowerCase().replace(/\s+/g, "")}.specularos.com
                  </span>
                </div>
                <div className="bg-[#161B26] p-8 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-cyan/10 border border-cyan/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-cyan text-3xl">person</span>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-xl">{agentDisplayName}</h3>
                      <p className="text-slate-400 text-sm">Licensed Real Estate Agent · Specular OS</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 bg-[#0B0E14] border border-[#27373a] rounded-lg p-3 leading-relaxed">
                    📋 <strong className="text-slate-400">SMS Opt-In Disclosure:</strong> By
                    providing your number, you agree to receive text messages from{" "}
                    {agentDisplayName}. Message and data rates may apply. Reply STOP to opt-out at
                    any time.
                  </p>
                </div>
              </div>

              {/* Compliance checks */}
              <div className="flex flex-col gap-3">
                <ComplianceCheck label="Contact info clearly displayed" />
                <ComplianceCheck label={`SMS opt-in disclosure added to all lead capture forms`} />
              </div>
            </motion.div>
          )}

          {subStep === 2 && (
            <motion.div
              key="messaging"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <InfoBanner icon="chat">
                <strong className="text-cyan">Step 3 — Messaging Intent</strong>
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

      {/* Sub-step navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => subStep > 0 && setSubStep((s) => s - 1)}
          disabled={subStep === 0}
          className="text-sm text-slate-400 hover:text-white disabled:opacity-0 transition-colors"
        >
          ← Back
        </button>

        {subStep < SUB_STEPS.length - 1 ? (
          <button
            onClick={() => setSubStep((s) => s + 1)}
            className="px-6 py-2.5 bg-cyan text-onyx font-bold rounded-xl hover:brightness-110 transition-all text-sm"
          >
            Next →
          </button>
        ) : null}
      </div>

      {/* Skip option */}
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

function ComplianceCheck({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 bg-green-500/5 border border-green-500/20 rounded-lg px-4 py-3">
      <span className="material-symbols-outlined text-green-400 text-lg">check_circle</span>
      <span className="text-sm text-slate-300">{label}</span>
    </div>
  );
}

function Input({
  label, placeholder, value, onChange, hint,
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; hint?: string;
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
      {hint && <p className="text-xs text-slate-500 ml-1">{hint}</p>}
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
