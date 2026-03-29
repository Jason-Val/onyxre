"use client";

import { useOnboarding } from "./OnboardingContext";

export function A2PComplianceStep() {
  const { data, updateData } = useOnboarding();

  return (
    <div className="flex flex-col gap-8 h-full pr-2 pb-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold font-display tracking-tight border-l-4 border-cyan pl-4">A2P 10DLC Compliance</h2>
        <p className="text-slate-400 pl-4">Required for Twilio SMS integration. Please register your business profile.</p>
      </div>

      <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-8 shadow-2xl">
        <div className="flex items-start gap-4 mb-8 bg-cyan/5 border border-cyan/20 p-5 rounded-lg">
          <span className="material-symbols-outlined text-cyan text-3xl">verified_user</span>
          <div>
            <h4 className="text-cyan font-bold text-sm">Why do we need this?</h4>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">US carrier regulations require all businesses sending text messages to register their brand. This ensures your Loomis CRM messages achieve the highest deliverability directly to your clients&apos; phones.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Input label="Legal Business Name" placeholder="Global Realty LLC" value={data.a2pLegalName} onChange={(v) => updateData({ a2pLegalName: v })} />
          <Input label="Business Registration Number (EIN)" placeholder="XX-XXXXXXX" value={data.a2pEin} onChange={(v) => updateData({ a2pEin: v })} />
          <Input label="Business Type" placeholder="Sole Proprietorship / LLC / Corp" value={data.a2pBusinessType} onChange={(v) => updateData({ a2pBusinessType: v })} />
          <Input label="Industry" placeholder="Real Estate" value={data.a2pIndustry} onChange={(v) => updateData({ a2pIndustry: v })} />
          <Input label="Business Website" placeholder="https://www.yourdomain.com" value={data.a2pWebsite} onChange={(v) => updateData({ a2pWebsite: v })} />
          <Input label="Business Address" placeholder="123 Main St, City, State, ZIP" value={data.a2pAddress} onChange={(v) => updateData({ a2pAddress: v })} />
        </div>

        {/* SMS Consent Toggle */}
        <div
          className="flex items-center gap-4 p-4 bg-onyx border border-[#27373a] rounded-lg cursor-pointer hover:border-cyan/50 transition-colors"
          onClick={() => updateData({ a2pSmsConsent: !data.a2pSmsConsent })}
        >
          <div className={`size-6 rounded border flex items-center justify-center transition-all ${data.a2pSmsConsent ? "border-cyan bg-cyan/10" : "border-slate-600 bg-transparent"}`}>
            {data.a2pSmsConsent && (
              <span className="material-symbols-outlined text-cyan text-sm shadow-[0_0_10px_rgba(0,209,255,1)]">check</span>
            )}
          </div>
          <p className="text-sm text-slate-300 select-none">
            I consent to sending automated marketing and transactional SMS messages to my opted-in contacts via Specular OS Loomis CRM.
          </p>
        </div>
      </div>
    </div>
  );
}

function Input({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (v: string) => void }) {
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
