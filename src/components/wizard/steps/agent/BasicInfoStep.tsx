"use client";

import { useRef, useState } from "react";
import { useOnboarding } from "./OnboardingContext";
import { createClient } from "@/supabase/client";

export function BasicInfoStep() {
  const { data, updateData } = useOnboarding();
  const [avatarPreview, setAvatarPreview] = useState<string>(data.avatarUrl || "");
  const [logoPreview, setLogoPreview] = useState<string>(data.logoUrl || "");
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  async function handleImageUpload(
    file: File,
    bucket: string,
    field: "avatarUrl" | "logoUrl",
    setPreview: (url: string) => void
  ) {
    const ext = file.name.split(".").pop();
    const path = `onboarding/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) { console.error(error); return; }
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    const publicUrl = urlData.publicUrl;
    setPreview(publicUrl);
    updateData({ [field]: publicUrl });
  }

  return (
    <div className="flex flex-col gap-8 h-full pr-2">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold font-display tracking-tight border-l-4 border-cyan pl-4">Agent Information</h2>
        <p className="text-slate-400 pl-4">Provide your professional details and brokerage information.</p>
      </div>

      <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-8 shadow-2xl">
        {/* Profile / Logo Upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Headshot */}
          <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, "avatars", "avatarUrl", setAvatarPreview); }} />
          <div className="flex flex-col items-center group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
            <div className="size-32 rounded-full border-2 border-dashed border-cyan/40 flex flex-col items-center justify-center bg-onyx transition-all group-hover:border-cyan group-hover:bg-cyan/5 overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Headshot" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-cyan text-4xl mb-1">add_a_photo</span>
              )}
            </div>
            <p className="mt-4 text-slate-100 text-lg font-bold">Headshot</p>
            <p className="text-slate-400 text-sm">Recommended: 500x500px</p>
          </div>

          {/* Logo */}
          <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, "logos", "logoUrl", setLogoPreview); }} />
          <div className="flex flex-col items-center group cursor-pointer" onClick={() => logoInputRef.current?.click()}>
            <div className="size-32 rounded-lg border-2 border-dashed border-cyan/40 flex flex-col items-center justify-center bg-onyx transition-all group-hover:border-cyan group-hover:bg-cyan/5 overflow-hidden">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <span className="material-symbols-outlined text-cyan text-4xl mb-1">branding_watermark</span>
              )}
            </div>
            <p className="mt-4 text-slate-100 text-lg font-bold">Brokerage Logo</p>
            <p className="text-slate-400 text-sm">Transparent PNG</p>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Input label="First Name" placeholder="Johnathan" value={data.firstName} onChange={(v) => updateData({ firstName: v })} />
          <Input label="Last Name" placeholder="Doe" value={data.lastName} onChange={(v) => updateData({ lastName: v })} />
          <Input label="Phone Number" placeholder="(555) 867-5309" type="tel" value={data.phoneNumber} onChange={(v) => updateData({ phoneNumber: v })} />
          <Input label="Brokerage Name" placeholder="Global Realty" value={data.brokerageName} onChange={(v) => updateData({ brokerageName: v })} />
          <Input label="License Number" placeholder="RE-99021-X" value={data.licenseNumber} onChange={(v) => updateData({ licenseNumber: v })} />
          <CommissionSplitInput value={data.commissionSplit} onChange={(v) => updateData({ commissionSplit: v })} />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-slate-300 text-sm font-semibold">Professional Bio</label>
            <button className="text-cyan text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <span className="material-symbols-outlined text-sm">auto_awesome</span> AI Polish
            </button>
          </div>
          <textarea
            className="w-full bg-onyx border border-[#27373a] text-slate-100 rounded-lg p-4 focus:border-cyan outline-none resize-none h-32 transition-all placeholder:text-slate-600"
            placeholder="Experience, specialties, and what makes you unique..."
            value={data.professionalBio}
            onChange={(e) => updateData({ professionalBio: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

function Input({ label, placeholder, value, onChange, type = "text" }: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-slate-300 text-sm font-semibold ml-1">{label}</label>
      <input
        type={type}
        className="w-full bg-onyx border border-[#27373a] text-slate-100 rounded-lg h-12 px-4 focus:border-cyan outline-none transition-all placeholder:text-slate-600"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function CommissionSplitInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-slate-300 text-sm font-semibold ml-1">
        Broker Commission Split
        <span className="text-slate-500 font-normal ml-2 text-xs">(Agent receives X%)</span>
      </label>
      <div className="flex items-center bg-onyx border border-[#27373a] text-slate-100 rounded-lg h-12 px-4 focus-within:border-cyan transition-all">
        <input
          type="number"
          min="0"
          max="100"
          placeholder="70"
          className="flex-1 bg-transparent outline-none placeholder:text-slate-600 appearance-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="text-slate-500 font-bold text-sm">%</span>
      </div>
      <p className="text-xs text-slate-500 ml-1">e.g. 70 means agent keeps 70%, broker keeps 30%</p>
    </div>
  );
}
