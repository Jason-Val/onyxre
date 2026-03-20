"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/supabase/client";

interface LeadFormProps {
  agentId: string;
  orgId: string;
  agentName: string;
  primaryColor: string;
}

export function LeadForm({ agentId, orgId, agentName, primaryColor }: LeadFormProps) {
  const supabase = createClient();
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "" });

  useEffect(() => {
    setMounted(true);
  }, []);
  const [smsConsent, setSmsConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!smsConsent) { setError("Please agree to receive messages before submitting."); return; }
    setSubmitting(true);
    setError(null);
    try {
      const { error: rpcError } = await supabase.rpc("submit_agent_lead", {
        p_agent_id: agentId,
        p_org_id: orgId,
        p_first_name: form.firstName,
        p_last_name: form.lastName,
        p_email: form.email,
        p_phone: form.phone,
        p_sms_consent: smsConsent,
      });
      if (rpcError) throw new Error(rpcError.message);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const accent = primaryColor || "#00D1FF";

  if (submitted) {
    return (
      <div className="text-center py-12 flex flex-col items-center gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
          style={{ backgroundColor: `${accent}20`, border: `2px solid ${accent}50` }}
        >
          ✓
        </div>
        <h3 className="text-xl font-bold text-white">You&apos;re on the list!</h3>
        <p className="text-slate-400 text-sm max-w-xs">
          {agentName} will be in touch shortly. Check your phone for a confirmation text.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          required
          placeholder="First Name"
          value={form.firstName}
          onChange={(e) => update("firstName", e.target.value)}
          className="w-full bg-white/5 border border-white/10 text-white rounded-xl h-12 px-4 outline-none focus:border-white/40 transition-all placeholder:text-white/30 text-sm"
        />
        <input
          required
          placeholder="Last Name"
          value={form.lastName}
          onChange={(e) => update("lastName", e.target.value)}
          className="w-full bg-white/5 border border-white/10 text-white rounded-xl h-12 px-4 outline-none focus:border-white/40 transition-all placeholder:text-white/30 text-sm"
        />
      </div>
      <input
        required
        type="email"
        placeholder="Email Address"
        value={form.email}
        onChange={(e) => update("email", e.target.value)}
        className="w-full bg-white/5 border border-white/10 text-white rounded-xl h-12 px-4 outline-none focus:border-white/40 transition-all placeholder:text-white/30 text-sm"
      />
      <input
        required
        type="tel"
        placeholder="Phone Number"
        value={form.phone}
        onChange={(e) => update("phone", e.target.value)}
        className="w-full bg-white/5 border border-white/10 text-white rounded-xl h-12 px-4 outline-none focus:border-white/40 transition-all placeholder:text-white/30 text-sm"
      />

      {/* SMS Consent — required for A2P compliance */}
      <label className="flex gap-3 items-start cursor-pointer group mt-1">
        <div
          onClick={() => setSmsConsent((v) => !v)}
          className={`mt-0.5 w-5 h-5 shrink-0 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${smsConsent ? "border-current bg-current/20" : "border-white/30"}`}
          style={{ borderColor: smsConsent ? accent : undefined, backgroundColor: smsConsent ? `${accent}20` : undefined }}
        >
          {smsConsent && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12" style={{ color: accent }}>
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <span className="text-xs text-white/50 leading-relaxed select-none">
          I agree to receive text messages from <strong className="text-white/70">{agentName}</strong> about
          real estate listings, market updates, and appointment reminders. Msg &amp; data rates may apply.
          Reply <strong className="text-white/70">STOP</strong> to opt-out at any time.
          {" "}<span style={{ color: accent }}>*Required</span>
        </span>
      </label>

      {error && (
        <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>
      )}

      {/* Submit Button */}
      {!mounted ? (
        <button
          type="submit"
          disabled={submitting}
          className="w-full h-12 rounded-xl font-bold text-sm transition-all disabled:opacity-50 mt-1"
          style={{ backgroundColor: accent, color: "#0A0D14" }}
        >
          {submitting ? "Sending…" : "Connect with Me →"}
        </button>
      ) : (
        <motion.button
          type="submit"
          disabled={submitting}
          whileHover={{ 
            scale: 1.02,
            boxShadow: `0 0 20px ${accent}40`
          }}
          whileTap={{ scale: 0.98 }}
          animate={{
            boxShadow: [
              `0 0 0px ${accent}00`,
              `0 0 15px ${accent}30`,
              `0 0 0px ${accent}00`
            ]
          }}
          transition={{
            boxShadow: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          className="w-full h-12 rounded-xl font-bold text-sm transition-all disabled:opacity-50 mt-1 relative overflow-hidden group"
          style={{ backgroundColor: accent, color: "#0A0D14" }}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {submitting ? "Sending…" : "Connect with Me →"}
          </span>
          {/* Pulse Overlay */}
          <motion.div
            className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: `linear-gradient(90deg, transparent, ${accent}40, transparent)` }}
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </motion.button>
      )}

      {/* Legal Hygiene Disclosure */}
      <p className="text-[10px] text-[#64748b] text-center leading-tight mt-2 px-4">
        By clicking "Connect with Me", you agree to receive automated SMS/MMS messages from {agentName}. 
        Msg & data rates may apply. Reply STOP to opt-out. See our <a href="#" className="underline">Privacy Policy</a>.
      </p>
    </form>
  );
}
