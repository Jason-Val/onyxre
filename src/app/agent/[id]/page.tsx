import { createClient } from "@/supabase/server";
import { notFound } from "next/navigation";
import { LeadForm } from "./LeadForm";

interface AgentProfile {
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  bio: string | null;
  license_number: string | null;
  organization_id: string;
  brokerage_name: string;
  logo_url: string | null;
  brand_primary_color: string;
  brand_secondary_color: string;
  brand_typography: string;
  properties: Array<{
    id: string;
    address_line1: string | null;
    city: string | null;
    state: string | null;
    price: number | null;
    status: string;
    thumbnail_url: string | null;
  }>;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_agent_public_profile", { p_agent_id: id });
  if (!data) return { title: "Agent | OnyxRE" };
  const agent = data as unknown as AgentProfile;
  const name = `${agent.first_name ?? ""} ${agent.last_name ?? ""}`.trim();
  return {
    title: `${name} | OnyxRE Real Estate`,
    description: agent.bio ?? `Connect with ${name}, a licensed real estate agent at ${agent.brokerage_name}.`,
    openGraph: {
      title: `${name} | OnyxRE Real Estate`,
      description: agent.bio ?? "",
      images: agent.avatar_url ? [{ url: agent.avatar_url }] : [],
    },
  };
}

export default async function AgentLandingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_agent_public_profile", { p_agent_id: id });

  if (!data) notFound();
  const agent = data as unknown as AgentProfile;

  const name = `${agent.first_name ?? ""} ${agent.last_name ?? ""}`.trim() || "Your Agent";
  const primary = agent.brand_primary_color ?? "#00D1FF";
  const secondary = agent.brand_secondary_color ?? "#0A0D14";

  return (
    <>
      {/* Inject brand colors as CSS vars */}
      <style>{`
        :root {
          --brand-primary: ${primary};
          --brand-secondary: ${secondary};
        }
      `}</style>

      <div
        className="min-h-screen text-white"
        style={{ background: `radial-gradient(ellipse at top, ${primary}18 0%, #050709 60%)`, backgroundColor: "#050709" }}
      >
        {/* ── HEADER ── */}
        <header className="max-w-2xl mx-auto px-6 pt-16 pb-10 flex flex-col items-center text-center gap-5">
          {/* Headshot */}
          <div
            className="w-28 h-28 rounded-full overflow-hidden border-4 shadow-2xl"
            style={{ borderColor: `${primary}60`, boxShadow: `0 0 40px ${primary}30` }}
          >
            {agent.avatar_url ? (
              <img src={agent.avatar_url} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl font-black" style={{ backgroundColor: `${primary}20`, color: primary }}>
                {(agent.first_name?.[0] ?? "A").toUpperCase()}
              </div>
            )}
          </div>

          {/* Name + Brokerage */}
          <div>
            <h1 className="text-3xl font-black tracking-tight">{name}</h1>
            {agent.brokerage_name && (
              <p className="text-white/50 text-sm mt-1 font-medium">{agent.brokerage_name}</p>
            )}
            {agent.license_number && (
              <p className="text-white/35 text-xs mt-1">DRE# {agent.license_number}</p>
            )}
          </div>

          {/* Powered-by badge */}
          <div className="flex items-center gap-2 mt-2">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black" style={{ backgroundColor: primary, color: secondary }}>
              O
            </div>
            <span className="text-white/25 text-xs">Powered by OnyxRE</span>
          </div>
        </header>

        {/* ── BIO ── */}
        {agent.bio && (
          <section className="max-w-lg mx-auto px-6 pb-10 text-center">
            <p className="text-white/60 text-sm leading-relaxed">{agent.bio}</p>
          </section>
        )}

        <div className="max-w-2xl mx-auto px-6 flex flex-col gap-8 pb-20">

          {/* ── FEATURED LISTINGS ── */}
          {agent.properties.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: primary }}>
                Featured Listings
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {agent.properties.map((prop) => (
                  <a
                    key={prop.id}
                    href={`/property/${prop.id}`}
                    className="group rounded-2xl overflow-hidden border border-white/8 bg-white/5 hover:border-white/20 transition-all hover:-translate-y-0.5 block"
                    style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
                  >
                    {/* Thumbnail */}
                    <div className="h-40 overflow-hidden relative">
                      {prop.thumbnail_url ? (
                        <img src={prop.thumbnail_url} alt={prop.address_line1 ?? "Property"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${primary}15, #161B22)` }}>
                          <svg className="w-10 h-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
                          </svg>
                        </div>
                      )}
                      {/* Status badge */}
                      <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest" style={{ backgroundColor: primary, color: secondary }}>
                        {prop.status}
                      </span>
                    </div>
                    {/* Info */}
                    <div className="p-4">
                      {prop.price && (
                        <p className="text-lg font-black">
                          ${prop.price.toLocaleString()}
                        </p>
                      )}
                      <p className="text-white/50 text-xs mt-1 truncate">
                        {[prop.address_line1, prop.city, prop.state].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* ── LEAD FORM ── */}
          <section
            className="rounded-2xl border border-white/10 p-7"
            style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)" }}
          >
            <h2 className="text-lg font-black mb-1">Let&apos;s Connect</h2>
            <p className="text-white/45 text-sm mb-6">
              Ready to buy, sell, or just explore the market? Drop your info and I&apos;ll reach out personally.
            </p>
            <LeadForm
              agentId={id}
              orgId={agent.organization_id}
              agentName={name}
              primaryColor={primary}
            />
          </section>
        </div>

        {/* ── FOOTER ── */}
        <footer className="border-t border-white/8 py-8 px-6">
          <div className="max-w-2xl mx-auto flex flex-col gap-3 items-center text-center">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center" style={{ backgroundColor: primary, color: secondary }}>
                O
              </div>
              <span className="text-white/30 text-xs font-semibold">OnyxRE</span>
            </div>
            <p className="text-white/25 text-[11px] leading-relaxed max-w-md">
              By submitting this form, you agree to receive text messages from {name} regarding real estate listings,
              market updates, and appointment scheduling. Message and data rates may apply. Message frequency varies.
              Reply <strong>STOP</strong> to cancel. Reply <strong>HELP</strong> for help.
              View our <a href="/privacy" className="underline underline-offset-2">Privacy Policy</a>.
            </p>
            <p className="text-white/20 text-[10px]">
              © {new Date().getFullYear()} {name} · {agent.brokerage_name} · Powered by OnyxRE
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
