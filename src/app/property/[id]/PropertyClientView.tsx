"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { LeadForm } from "@/app/agent/[id]/LeadForm";
import { Lightbox } from "@/components/property/Lightbox";
import { createClient } from "@/supabase/client";

interface PropertyPublic {
  id: string;
  address_line1: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  price: number | null;
  status: string;
  bedrooms: number | null;
  bathrooms: number | null;
  sq_ft: number | null;
  year_built: number | null;
  description: string | null;
  thumbnail_url: string | null;
  features: string[] | null;
  images: Array<{ url: string; sort_order: number }>;
  media_assets: Array<{ asset_type: string; storage_path: string; url?: string | null }>;
  agent_first_name: string | null;
  agent_last_name: string | null;
  agent_avatar_url: string | null;
  agent_license: string | null;
  agent_id: string;
  org_id: string;
  brokerage_name: string;
  brand_primary: string;
  brand_secondary: string;
}

const statusLabel: Record<string, string> = {
  ACTIVE: "For Sale",
  PENDING: "Under Contract",
  SOLD: "Sold",
  WITHDRAWN: "Off Market",
};

export function PropertyClientView({ property, googleMapsApiKey, mode }: { property: PropertyPublic, googleMapsApiKey: string, mode?: string }) {
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isOpenHouseLocked, setIsOpenHouseLocked] = useState(mode === 'openhouse');
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleOpenHouseSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const first_name = formData.get("first_name") as string;
    const last_name = formData.get("last_name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const working_with_realtor = formData.get("working_with_realtor") === "on";
    const keep_me_informed = formData.get("keep_me_informed") === "on";
    
    await fetch("/api/crm/open-house/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        property,
        first_name,
        last_name,
        email,
        phone,
        working_with_realtor,
        keep_me_informed
      })
    });

    setIsOpenHouseLocked(false);
  };

  useEffect(() => {
    // Record page view on initial load
    const recordView = async () => {
      const supabase = createClient();
      await (supabase.rpc as any)('increment_page_view', { prop_id: property.id });
    };
    recordView();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth * 0.6;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const address = [property.address_line1, property.city, property.state, property.zip_code].filter(Boolean).join(", ");
  const agentName = [property.agent_first_name, property.agent_last_name].filter(Boolean).join(" ") || "Your Agent";
  const primary = property.brand_primary ?? "#00D1FF";
  const secondary = property.brand_secondary ?? "#1DA1F2";

  const videoAsset = property.media_assets?.find(a => a.asset_type === "VIDEO");
  const heroImage = property.images?.[0]?.url ?? property.thumbnail_url;

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <div className="min-h-screen text-white bg-[#050709] selection:bg-cyan/30">
      <style>{`
        :root { 
          --brand-primary: ${primary};
          --brand-secondary: ${secondary};
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      {isOpenHouseLocked && (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#050709]/80 backdrop-blur-2xl p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#0A0D14] border border-white/10 rounded-[2.5rem] p-8 shadow-[0_0_80px_rgba(0,0,0,0.8)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-cyan/10 blur-[80px] pointer-events-none" style={{ backgroundColor: `${primary}10` }} />
            
            <div className="text-center mb-8">
              <div className="size-20 rounded-full mx-auto mb-4 border-2 p-1 overflow-hidden" style={{ borderColor: primary }}>
                 {property.thumbnail_url ? (
                   <img src={property.thumbnail_url} className="w-full h-full object-cover rounded-full" alt="Property" />
                 ) : (
                   <div className="w-full h-full bg-onyx flex items-center justify-center rounded-full"><span className="material-symbols-outlined text-white">house</span></div>
                 )}
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white mb-2">Welcome to the Open House</h2>
              <p className="text-white/50 text-sm font-medium">Please sign in to unlock full property details, photos, and agent contact info.</p>
            </div>

            <form onSubmit={handleOpenHouseSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <input required type="text" name="first_name" placeholder="First Name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30 transition-all font-medium" />
                <input required type="text" name="last_name" placeholder="Last Name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30 transition-all font-medium" />
              </div>
              <input required type="email" name="email" placeholder="Email Address" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30 transition-all font-medium" />
              <input type="tel" name="phone" placeholder="Phone Number (Optional)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30 transition-all font-medium" />
              
              <div className="flex flex-col gap-3 mt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" name="working_with_realtor" className="peer appearance-none w-5 h-5 border border-white/20 rounded bg-white/5 checked:bg-cyan checked:border-cyan transition-all" style={{ '--tw-checked-bg': primary } as any} />
                    <span className="material-symbols-outlined text-white text-[14px] absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">check</span>
                  </div>
                  <span className="text-white/70 text-sm font-medium group-hover:text-white transition-colors">I'm currently working with a realtor</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" name="keep_me_informed" className="peer appearance-none w-5 h-5 border border-white/20 rounded bg-white/5 checked:bg-cyan checked:border-cyan transition-all" style={{ '--tw-checked-bg': primary } as any} />
                    <span className="material-symbols-outlined text-white text-[14px] absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">check</span>
                  </div>
                  <span className="text-white/70 text-sm font-medium group-hover:text-white transition-colors">Keep me informed about this property and others</span>
                </label>
              </div>

              <button type="submit" className="w-full py-4 mt-4 rounded-xl font-black uppercase tracking-widest text-[11px] text-[#050709] transition-all hover:brightness-110 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]" style={{ backgroundColor: primary }}>
                Unlock Listing
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="relative w-full h-[65vh] min-h-[450px] overflow-hidden group">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="w-full h-full"
        >
          {videoAsset ? (
            <video 
              src={videoAsset.url || `https://agaltnnnnaxjmjwuybhq.supabase.co/storage/v1/object/public/media-assets/${videoAsset.storage_path}`}
              autoPlay 
              muted 
              loop 
              playsInline
              className="w-full h-full object-cover"
            />
          ) : heroImage ? (
            <img src={heroImage} alt={address} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-onyx to-[#0A0D14]">
              <span className="material-symbols-outlined text-9xl opacity-10">home_work</span>
            </div>
          )}
        </motion.div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#050709] via-transparent to-transparent" />

        {/* Hero Overlay Info */}
        <div className="absolute bottom-16 left-0 right-0">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span
                className="inline-block mb-4 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border"
                style={{ backgroundColor: `${primary}20`, borderColor: `${primary}40`, color: primary, backdropFilter: "blur(8px)" }}
              >
                {statusLabel[property.status] ?? property.status}
              </span>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 leading-none">
                {property.price ? `$${property.price.toLocaleString()}` : "Contact for Price"}
              </h1>
              <p className="text-white/60 text-xl max-w-2xl font-medium tracking-tight">{address}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FULL WIDTH GALLERY CAROUSEL ── */}
      {property.images?.length > 0 && (
        <section className="relative w-full py-6 bg-black/40 border-y border-white/5 overflow-hidden group/carousel">
          <div className="absolute top-6 left-12 z-10 pointer-events-none">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">Estate Gallery</h2>
            <div className="w-8 h-0.5" style={{ backgroundColor: primary }} />
          </div>
          
          {/* Glass Arrows */}
          <div className="absolute inset-y-0 inset-x-0 flex items-center justify-between px-6 z-20 pointer-events-none">
            <button 
              onClick={() => scroll("left")}
              className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all pointer-events-auto opacity-0 group-hover/carousel:opacity-100 -translate-x-4 group-hover/carousel:translate-x-0"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button 
              onClick={() => scroll("right")}
              className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all pointer-events-auto opacity-0 group-hover/carousel:opacity-100 translate-x-4 group-hover/carousel:translate-x-0"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

          <div 
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto px-12 py-10 no-scrollbar snap-x snap-mandatory"
          >
            {property.images.map((img, i) => (
              <motion.div
                key={i}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: `0 0 30px ${primary}20`
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openLightbox(i)}
                className="relative min-w-[150px] md:min-w-[220px] aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer border border-white/5 group snap-center"
              >
                <img src={img.url} alt="" className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" />
                
                {/* Visual indicator for gallery */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-white text-xs">zoom_in</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-white">Expand</span>
                  </div>
                </div>
                
                {/* Electric pulse glow on hover */}
                <motion.div
                  className="absolute inset-0 border border-transparent group-hover:border-white/20 rounded-2xl pointer-events-none"
                  animate={{ opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            ))}
          </div>

          {/* Navigation Hint */}
          <div className="absolute bottom-6 right-12 flex items-center gap-4 pointer-events-none">
             <span className="text-[8px] font-bold text-white/10 uppercase tracking-[0.4em]">Gallery Navigation</span>
             <div className="w-8 h-px bg-white/5" />
          </div>
        </section>
      )}

      {/* ── MAIN CONTENT GRID ── */}
      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
          
          {/* LEFT COLUMN: Property Details */}
          <div className="lg:col-span-2 flex flex-col gap-12">
            
            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6">
              <Stat icon="bed" value={property.bedrooms} label="Bedrooms" color={primary} />
              <Stat icon="bathtub" value={property.bathrooms} label="Bathrooms" color={primary} />
              <Stat icon="straighten" value={property.sq_ft?.toLocaleString()} label="Sq Ft" color={primary} />
              <Stat icon="calendar_today" value={property.year_built} label="Year Built" color={primary} />
            </div>


            {/* Feature Highlights */}
            {property.features && property.features.length > 0 && (
              <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-8 text-center">Premium Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-8 gap-x-4">
                  {property.features.map((feature, i) => (
                    <div key={i} className="flex flex-col items-center text-center gap-3 group">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 shadow-lg"
                        style={{ backgroundColor: `${primary}10`, borderColor: `${primary}20` }}
                      >
                        <span className="material-symbols-outlined text-2xl" style={{ color: primary }}>
                          {getFeatureIcon(feature)}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-white/80 group-hover:text-white transition-colors capitalize">{feature}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {property.description && (
              <section className="max-w-3xl">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-6">Property Overview</h2>
                <div className="text-white/60 leading-relax text-lg whitespace-pre-line space-y-4">
                  {property.description}
                </div>
              </section>
            )}

            {/* Google Maps Embed */}
            {address && (
              <section className="max-w-3xl">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-6">Location</h2>
                <div className="w-full aspect-video rounded-3xl overflow-hidden border border-white/5 relative bg-white/[0.02]">
                  {googleMapsApiKey ? (
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(1.2)' }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${encodeURIComponent(address)}`}
                      className="opacity-80 hover:opacity-100 transition-opacity duration-700"
                    ></iframe>
                  ) : (
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                      loading="lazy"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                      className="opacity-60 hover:opacity-100 transition-opacity duration-700"
                    ></iframe>
                  )}
                </div>
              </section>
            )}

          </div>

          {/* RIGHT COLUMN: Lead Capture (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-12 flex flex-col gap-8">
              {/* Agent Card */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center gap-6 p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${primary}05, transparent)` }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan/5 blur-[60px] pointer-events-none" />
                
                <div className="relative">
                  <div 
                    className="w-20 h-20 rounded-full overflow-hidden border-2 relative z-10"
                    style={{ borderColor: primary }}
                  >
                    {property.agent_avatar_url ? (
                      <img src={property.agent_avatar_url} alt={agentName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-black bg-onyx text-white">
                        {agentName[0]}
                      </div>
                    )}
                  </div>
                  <div 
                    className="absolute inset-0 rounded-full blur-xl opacity-30 animate-pulse"
                    style={{ backgroundColor: primary }}
                  />
                </div>

                <div className="text-center">
                  <h3 className="text-xl font-black tracking-tight">{agentName}</h3>
                  <p className="text-white/40 text-xs mt-1">{property.brokerage_name}</p>
                  <div className="mt-6">
                    <a 
                      href={`/agent/${property.agent_id}`}
                      className="inline-block px-6 py-2.5 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all hover:bg-white/5 active:scale-95"
                      style={{ borderColor: `${primary}40`, color: primary }}
                    >
                      View Profile
                    </a>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: primary }}></span>
                    <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: primary }}></span>
                  </span>
                </div>
                
                <h2 className="text-2xl font-black tracking-tight mb-2">Request Exclusive Access</h2>
                <p className="text-white/40 text-sm mb-8">
                  Get in touch with {agentName} to schedule a private viewing or the property info package.
                </p>

                <LeadForm
                  agentId={property.agent_id}
                  orgId={property.org_id}
                  agentName={agentName}
                  primaryColor={primary}
                />
              </motion.div>
              
              <div className="mt-8 text-center">
                <p className="text-[11px] text-white/10 font-bold uppercase tracking-[0.3em]">Licensed Broker: {property.brokerage_name}</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Lightbox 
        images={property.images} 
        initialIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
      />

      {/* Modern Footer */}
      <footer className="border-t border-white/5 py-12 px-6 bg-black/50">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center gap-6">
          <div className="text-onyx-muted text-[10px] font-black uppercase tracking-[0.4em]">Specular OS Luxury Real Estate Platform</div>
          <p className="text-white/10 text-[10px] tracking-widest">
            © {new Date().getFullYear()} {property.brokerage_name}. All rights reserved. 
            Information deemed reliable but not guaranteed.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Stat({ icon, value, label, color }: { icon: string; value: any; label: string; color: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all">
      <span className="material-symbols-outlined text-lg" style={{ color }}>{icon}</span>
      <div className="flex flex-col">
        <span className="text-sm font-black text-white leading-none">{value}</span>
        <span className="text-[10px] font-medium text-white/30 uppercase tracking-widest mt-0.5">{label}</span>
      </div>
    </div>
  );
}

function getFeatureIcon(feature: string): string {
  const f = feature.toLowerCase();
  if (f.includes("pool")) return "pool";
  if (f.includes("gym") || f.includes("fitness")) return "fitness_center";
  if (f.includes("park")) return "local_parking";
  if (f.includes("security") || f.includes("gate")) return "security";
  if (f.includes("view")) return "visibility";
  if (f.includes("garden") || f.includes("yard")) return "yard";
  if (f.includes("kitchen") || f.includes("chef")) return "countertops";
  if (f.includes("bath") || f.includes("spa")) return "spa";
  if (f.includes("smart") || f.includes("tech")) return "smart_home";
  if (f.includes("garage") || f.includes("car")) return "garage";
  if (f.includes("wine")) return "wine_bar";
  if (f.includes("theater") || f.includes("cinema")) return "theaters";
  return "star";
}
