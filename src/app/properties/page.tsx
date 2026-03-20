"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/supabase/client";

type Property = {
  id: string;
  address_line1: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  price: number | null;
  status: string;
  thumbnail_url: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "text-emerald-400 border-emerald-400/40 bg-emerald-400/10",
  PENDING: "text-amber-400 border-amber-400/40 bg-amber-400/10",
  SOLD: "text-slate-400 border-slate-400/40 bg-slate-400/10",
  WITHDRAWN: "text-red-400 border-red-400/40 bg-red-400/10",
  CANCELLED: "text-red-400 border-red-400/40 bg-red-400/10",
  DRAFT: "text-violet-400 border-violet-400/40 bg-violet-400/10",
};

export default function PropertyManagerPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("properties")
        .select("id, address_line1, city, state, zip_code, price, status, thumbnail_url")
        .eq("agent_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) setProperties(data);
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 md:px-10 py-10 space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 font-display">Property Manager</h1>
          <p className="text-slate-400 text-sm">Manage your inventory and monitor AI marketing health scores.</p>
        </div>
        <Link
          href="/properties/new"
          className="px-6 py-3 bg-cyan text-onyx font-bold rounded-xl flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-[0_0_15px_rgba(0,209,255,0.3)] hover:-translate-y-0.5 whitespace-nowrap"
        >
          <span className="material-symbols-outlined">add_business</span>
          New Listing
        </Link>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-onyx-surface border border-[#27373a] rounded-xl overflow-hidden animate-pulse">
              <div className="h-48 bg-[#1a2530]" />
              <div className="p-6 space-y-3">
                <div className="h-4 bg-[#1a2530] rounded w-3/4" />
                <div className="h-6 bg-[#1a2530] rounded w-1/2" />
                <div className="h-2 bg-[#1a2530] rounded w-full mt-6" />
              </div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
          <span className="material-symbols-outlined text-[64px] text-slate-700">home_work</span>
          <h3 className="text-xl font-bold text-slate-400">No listings yet</h3>
          <p className="text-slate-500 text-sm max-w-xs">Add your first property to start building your portfolio and generating marketing assets.</p>
          <Link href="/properties/new" className="mt-2 px-5 py-2.5 bg-cyan text-onyx font-bold rounded-xl text-sm hover:brightness-110 transition-all">
            Add First Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((prop) => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      )}
    </div>
  );
}

function PropertyCard({ property }: { property: Property }) {
  const address = [property.address_line1, property.city, property.state]
    .filter(Boolean)
    .join(", ");
  const price = property.price
    ? `$${property.price.toLocaleString()}`
    : "Price on Request";
  const status = property.status ?? "ACTIVE";
  const statusLabel = status === "DRAFT" ? "Draft" : status.charAt(0) + status.slice(1).toLowerCase();
  const statusStyle = STATUS_COLORS[status] ?? STATUS_COLORS.ACTIVE;
  const isDraft = status === "DRAFT";

  // Draft → resume in wizard; published → open detail page
  const href = isDraft
    ? `/properties/new?propertyId=${property.id}`
    : `/properties/${property.id}`;

  // Marketing health is static for now
  const health = status === "ACTIVE" ? 72 : status === "PENDING" ? 91 : 55;

  return (
    <Link
      href={href}
      className="bg-onyx-surface border border-[#27373a] rounded-xl overflow-hidden hover:border-cyan/50 transition-all shadow-xl group cursor-pointer flex flex-col hover:-translate-y-1"
    >
      {/* Thumbnail */}
      <div className="h-48 bg-onyx relative overflow-hidden flex items-center justify-center border-b border-[#27373a]">
        {property.thumbnail_url ? (
          <img
            src={property.thumbnail_url}
            alt={address}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="material-symbols-outlined text-[64px] text-slate-800 transition-transform group-hover:scale-110 duration-500">
            {isDraft ? "edit_note" : "real_estate_agent"}
          </span>
        )}
        {/* Status badge */}
        <div className={`absolute top-4 right-4 backdrop-blur border text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-xl ${statusStyle}`}>
          {statusLabel}
        </div>
        {isDraft && (
          <div className="absolute inset-0 bg-violet-500/5 border-b border-violet-400/10 flex items-end">
            <div className="w-full px-4 py-2 bg-violet-500/10 backdrop-blur-sm">
              <p className="text-violet-300 text-[10px] font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[12px]">edit</span>
                Click to continue setup
              </p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-onyx-surface to-transparent opacity-70 pointer-events-none" />
      </div>

      {/* Info */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-bold text-lg text-white mb-1 truncate">{address || "Address TBD"}</h3>
        <p className="text-cyan font-black font-display tracking-tight text-xl mb-6">{price}</p>

        {/* Marketing Health Bar */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">monitor_heart</span>
              Marketing Health
            </span>
            <span className={`text-sm font-bold ${health >= 80 ? "text-emerald-500" : "text-amber-500"}`}>
              {health}/100
            </span>
          </div>
          <div className="h-1.5 w-full bg-onyx rounded-full overflow-hidden border border-[#27373a]">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${health >= 80 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"}`}
              style={{ width: `${health}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
