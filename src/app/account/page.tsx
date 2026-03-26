"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/supabase/client";
import { motion } from "framer-motion";

type Section = "profile" | "brand" | "subscription" | "a2p" | "integrations";

const PLANS = ["Free Agent", "Junior Agent", "Senior Agent", "Broker"];
const VISUAL_DNA = ["Modern", "Luxury", "Bold", "Minimalist"];
const FONTS = ["Inter (Sans-Serif)", "Playfair Display (Serif)", "Montserrat (Modern)"];

export default function AccountPage() {
  const supabase = createClient();
  const [activeSection, setActiveSection] = useState<Section>("profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [commissionSplit, setCommissionSplit] = useState("");
  const [bufferAccessToken, setBufferAccessToken] = useState("");

  // Brand state
  const [brokerageName, setBrokerageName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [visualDna, setVisualDna] = useState("Modern");
  const [primaryColor, setPrimaryColor] = useState("#00D1FF");
  const [secondaryColor, setSecondaryColor] = useState("#475569");
  const [typography, setTypography] = useState("Inter (Sans-Serif)");

  // Subscription
  const [subscriptionTier, setSubscriptionTier] = useState("");

  // A2P
  const [a2pStatus, setA2pStatus] = useState("pending");
  const [orgId, setOrgId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, license_number, bio, avatar_url, organization_id, buffer_access_token")
        .eq("id", user.id)
        .single();
      if (profile) {
        setFirstName(profile.first_name ?? "");
        setLastName(profile.last_name ?? "");
        setLicenseNumber(profile.license_number ?? "");
        setBio(profile.bio ?? "");
        setAvatarUrl(profile.avatar_url ?? "");
        setBufferAccessToken(profile.buffer_access_token ?? "");
        setOrgId(profile.organization_id ?? null);
      }
      if (profile?.organization_id) {
        const { data: org } = await supabase
          .from("organizations")
          .select("name, logo_url, brand_visual_dna, brand_primary_color, brand_secondary_color, brand_typography, subscription_tier, a2p_status, commission_split")
          .eq("id", profile.organization_id)
          .single();
        if (org) {
          setBrokerageName(org.name ?? "");
          setLogoUrl(org.logo_url ?? "");
          setVisualDna(org.brand_visual_dna ?? "Modern");
          setPrimaryColor(org.brand_primary_color ?? "#00D1FF");
          setSecondaryColor(org.brand_secondary_color ?? "#475569");
          setTypography(org.brand_typography ?? "Inter (Sans-Serif)");
          setSubscriptionTier(org.subscription_tier ?? "");
          setA2pStatus(org.a2p_status ?? "pending");
          setCommissionSplit(org.commission_split != null ? String(org.commission_split) : "");
        }
      }
    }
    load();
  }, []);

  async function handleUpload(file: File, bucket: "avatars" | "logos") {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    if (bucket === "avatars") setAvatarUrl(publicUrl);
    else setLogoUrl(publicUrl);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await supabase.from("profiles").update({
        first_name: firstName,
        last_name: lastName,
        license_number: licenseNumber,
        bio,
        avatar_url: avatarUrl || null,
        buffer_access_token: bufferAccessToken || null,
      }).eq("id", user.id);

      if (orgId) {
        await supabase.from("organizations").update({
          name: brokerageName,
          logo_url: logoUrl || null,
          brand_visual_dna: visualDna,
          brand_primary_color: primaryColor,
          brand_secondary_color: secondaryColor,
          brand_typography: typography,
          commission_split: commissionSplit ? parseFloat(commissionSplit) : null,
        }).eq("id", orgId);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const navItems: { key: Section; label: string; icon: string }[] = [
    { key: "profile", label: "Profile", icon: "person" },
    { key: "brand", label: "Brand & Brokerage", icon: "palette" },
    { key: "subscription", label: "Subscription", icon: "star" },
    { key: "a2p", label: "A2P Registration", icon: "verified_user" },
    { key: "integrations", label: "Integrations", icon: "hub" },
  ];

  return (
    <div className="min-h-screen bg-onyx text-slate-100 flex flex-col">
      {/* Header */}
      <div className="border-b border-[#161B22] px-8 py-6">
        <h1 className="text-2xl font-bold font-display tracking-tight">Account Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your profile, brand, and subscription.</p>
      </div>

      <div className="flex flex-1 gap-0">
        {/* Sidebar nav */}
        <nav className="w-56 shrink-0 border-r border-[#161B22] p-4 flex flex-col gap-1 sticky top-0 h-screen">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
                activeSection === item.key
                  ? "bg-cyan/10 text-cyan border border-cyan/20"
                  : "text-slate-400 hover:text-white hover:bg-[#161B22] border border-transparent"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <main className="flex-1 p-8 max-w-3xl">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-8"
          >
            {/* ── Profile ── */}
            {activeSection === "profile" && (
              <>
                <SectionHeader title="Profile" subtitle="Your agent identity across OnyxRE." />
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-2 border-cyan/30 overflow-hidden bg-[#161B22] flex items-center justify-center">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-slate-500 text-4xl">person</span>
                      )}
                    </div>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-cyan text-onyx flex items-center justify-center shadow-lg hover:brightness-110 transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="font-semibold text-white">{firstName || "Your Name"}</p>
                    <p className="text-slate-400 text-sm">{subscriptionTier || "Agent"}</p>
                    {userId && (
                      <a
                        href={`/agent/${userId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-cyan border border-cyan/30 rounded-lg px-3 py-1.5 hover:bg-cyan/10 transition-all w-fit font-semibold"
                      >
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        View My Landing Page
                      </a>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], "avatars")} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <Field label="First Name" value={firstName} onChange={setFirstName} />
                  <Field label="Last Name" value={lastName} onChange={setLastName} />
                  <Field label="License Number" value={licenseNumber} onChange={setLicenseNumber} />
                  <div className="flex flex-col gap-2">
                    <label className="text-slate-300 text-sm font-semibold ml-1">
                      Broker Commission Split
                      <span className="text-slate-500 font-normal ml-2 text-xs">(Agent receives X%)</span>
                    </label>
                    <div className="flex items-center bg-[#0A0D14] border border-[#30363D] text-slate-100 rounded-xl h-11 px-4 focus-within:border-cyan transition-all">
                      <input
                        type="number" min="0" max="100" placeholder="70"
                        className="flex-1 bg-transparent outline-none placeholder:text-slate-600 appearance-none text-sm"
                        value={commissionSplit}
                        onChange={(e) => setCommissionSplit(e.target.value)}
                      />
                      <span className="text-slate-500 font-bold text-sm">%</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-slate-300 text-sm font-semibold ml-1">Professional Bio</label>
                  <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-[#0A0D14] border border-[#30363D] text-slate-100 rounded-xl px-4 py-3 focus:border-cyan outline-none transition-all resize-none text-sm" />
                </div>
              </>
            )}

            {/* ── Brand ── */}
            {activeSection === "brand" && (
              <>
                <SectionHeader title="Brand & Brokerage" subtitle="Your visual identity and brokerage details." />
                {/* Logo */}
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-xl border border-[#30363D] bg-[#161B22] overflow-hidden flex items-center justify-center">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="material-symbols-outlined text-slate-600">image</span>
                    )}
                  </div>
                  <button onClick={() => logoRef.current?.click()}
                    className="text-sm text-cyan border border-cyan/30 rounded-lg px-4 py-2 hover:bg-cyan/10 transition-all">
                    Upload Logo
                  </button>
                  <input ref={logoRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], "logos")} />
                </div>
                <Field label="Brokerage Name" value={brokerageName} onChange={setBrokerageName} />
                {/* Visual DNA */}
                <div className="flex flex-col gap-3">
                  <label className="text-slate-300 text-sm font-semibold ml-1">Visual DNA</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {VISUAL_DNA.map((v) => (
                      <button key={v} onClick={() => setVisualDna(v)}
                        className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${visualDna === v ? "border-cyan bg-cyan/10 text-cyan" : "border-[#30363D] text-slate-400 hover:border-cyan/40"}`}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Colors */}
                <div className="grid grid-cols-2 gap-5">
                  <ColorField label="Primary Color" value={primaryColor} onChange={setPrimaryColor} />
                  <ColorField label="Secondary Color" value={secondaryColor} onChange={setSecondaryColor} />
                </div>
                {/* Typography */}
                <div className="flex flex-col gap-3">
                  <label className="text-slate-300 text-sm font-semibold ml-1">Typography</label>
                  <div className="flex flex-col gap-2">
                    {FONTS.map((f) => (
                      <button key={f} onClick={() => setTypography(f)}
                        className={`text-left px-4 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${typography === f ? "border-cyan bg-cyan/10 text-cyan" : "border-[#30363D] text-slate-400 hover:border-cyan/40"}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── Subscription ── */}
            {activeSection === "subscription" && (
              <>
                <SectionHeader title="Subscription" subtitle="Your current plan and billing." />
                <div className="bg-[#161B26] border border-cyan/20 rounded-2xl p-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-cyan font-bold uppercase tracking-widest mb-1">Current Plan</p>
                    <p className="text-2xl font-black text-white">{subscriptionTier || "—"}</p>
                  </div>
                  <span className="material-symbols-outlined text-cyan text-4xl">verified</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {PLANS.filter((p) => p !== subscriptionTier).map((plan) => (
                    <div key={plan} className="bg-[#161B26] border border-[#30363D] rounded-xl p-5 flex flex-col gap-3 hover:border-cyan/30 transition-all">
                      <p className="font-bold text-white">{plan}</p>
                      <button className="text-xs text-cyan border border-cyan/30 rounded-lg py-2 hover:bg-cyan/10 transition-all font-bold">
                        Switch to {plan}
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-slate-500 text-xs">Plan changes take effect at the next billing cycle. Contact support to downgrade.</p>
              </>
            )}

            {/* ── A2P ── */}
            {activeSection === "a2p" && (
              <>
                <SectionHeader title="A2P 10DLC Registration" subtitle="SMS carrier compliance status." />
                <div className={`flex items-center gap-4 p-5 rounded-xl border-2 ${
                  a2pStatus === "completed" ? "border-green-500/30 bg-green-500/5" :
                  a2pStatus === "skipped" ? "border-yellow-500/30 bg-yellow-500/5" :
                  "border-[#30363D] bg-[#161B26]"
                }`}>
                  <span className={`material-symbols-outlined text-3xl ${
                    a2pStatus === "completed" ? "text-green-400" :
                    a2pStatus === "skipped" ? "text-yellow-400" : "text-slate-500"
                  }`}>
                    {a2pStatus === "completed" ? "check_circle" : a2pStatus === "skipped" ? "warning" : "pending"}
                  </span>
                  <div>
                    <p className="font-bold text-white capitalize">{a2pStatus === "pending" ? "Not Started" : a2pStatus}</p>
                    {a2pStatus === "skipped" && (
                      <p className="text-yellow-400 text-sm mt-0.5">⚠ Your Loomis CRM cannot send SMS until registration is complete.</p>
                    )}
                    {a2pStatus === "completed" && (
                      <p className="text-green-400 text-sm mt-0.5">SMS messaging is enabled for your account.</p>
                    )}
                  </div>
                </div>
                {a2pStatus !== "completed" && (
                  <a href="/onboarding" className="inline-flex items-center gap-2 px-6 py-3 bg-cyan text-onyx font-bold rounded-xl hover:brightness-110 transition-all w-fit text-sm">
                    <span className="material-symbols-outlined text-sm">edit</span>
                    {a2pStatus === "skipped" ? "Complete A2P Registration" : "Start A2P Registration"}
                  </a>
                )}
              </>
            )}

            {/* ── Integrations ── */}
            {activeSection === "integrations" && (
              <>
                <SectionHeader title="Integrations & APIs" subtitle="Connect external services to OnyxRE." />
                
                <div className="bg-[#161B26] border border-[#30363D] rounded-2xl p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-inner">
                       {/* Buffer icon placeholder */}
                       <span className="material-symbols-outlined text-black text-2xl">layers</span>
                    </div>
                    <div>
                      <h3 className="text-white font-bold">Buffer Social Scheduling</h3>
                      <p className="text-slate-400 text-xs">Automatically publish AI-generated posts to your connected social accounts.</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-2">
                    <label className="text-slate-300 text-sm font-semibold ml-1">Personal Access Token</label>
                    <input 
                      type="password" 
                      value={bufferAccessToken} 
                      onChange={(e) => setBufferAccessToken(e.target.value)}
                      placeholder="Enter your Buffer API Token"
                      className="w-full bg-[#0A0D14] border border-[#30363D] text-slate-100 rounded-xl h-11 px-4 focus:border-cyan outline-none transition-all placeholder:text-slate-600 font-mono text-sm" 
                    />
                    <p className="text-slate-500 text-xs ml-1">
                      You can get this token from your <a href="https://buffer.com" target="_blank" rel="noopener noreferrer" className="text-cyan hover:underline">Buffer Account Settings</a> under Apps & Extras.
                    </p>
                  </div>
                </div>
              </>
            )}
          </motion.div>

          {/* Save / Error */}
          {(activeSection === "profile" || activeSection === "brand" || activeSection === "integrations") && (
            <div className="mt-8 flex items-center gap-4">
              <button onClick={handleSave} disabled={saving}
                className="px-8 py-3 bg-cyan text-onyx font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-50 text-sm">
                {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Changes"}
              </button>
              {error && <p className="text-red-400 text-sm">{error}</p>}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="border-b border-[#161B22] pb-4">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <p className="text-slate-400 text-sm mt-1">{subtitle}</p>
    </div>
  );
}

function Field({ label, value, onChange, className = "" }: {
  label: string; value: string; onChange: (v: string) => void; className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-slate-300 text-sm font-semibold ml-1">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0A0D14] border border-[#30363D] text-slate-100 rounded-xl h-11 px-4 focus:border-cyan outline-none transition-all text-sm" />
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-slate-300 text-sm font-semibold ml-1">{label}</label>
      <div className="flex items-center gap-3 bg-[#0A0D14] border border-[#30363D] rounded-xl h-11 px-3 focus-within:border-cyan transition-all">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 rounded cursor-pointer bg-transparent border-none" />
        <span className="text-slate-300 text-sm font-mono">{value}</span>
      </div>
    </div>
  );
}
