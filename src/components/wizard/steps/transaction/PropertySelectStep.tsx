"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/supabase/client";

export interface Property {
  id: string;
  address_line1: string;
  city: string;
  price: number | null;
  thumbnail_url: string | null;
}

interface PropertySelectStepProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function PropertySelectStep({ selectedId, onSelect }: PropertySelectStepProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadProperties() {
      const { data } = await supabase
        .from("properties")
        .select("id, address_line1, city, price, thumbnail_url")
        .order("created_at", { ascending: false });
      
      if (data) setProperties(data as Property[]);
      setLoading(false);
    }
    loadProperties();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined text-cyan text-4xl animate-spin">autorenew</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 h-full pr-2 pb-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-white tracking-tight">Select Property</h2>
        <p className="text-slate-400 text-sm">Link this transaction to an existing listing from your portfolio.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {properties.map((p) => (
          <div
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-center gap-4 group ${
              selectedId === p.id 
                ? 'bg-cyan/10 border-cyan shadow-[0_0_15px_rgba(0,209,255,0.1)]' 
                : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
            }`}
          >
            <div className="size-16 rounded-xl overflow-hidden border border-white/10 shrink-0">
              {p.thumbnail_url ? (
                <img src={p.thumbnail_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-onyx flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-700">home</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-bold text-sm truncate group-hover:text-cyan transition-colors">{p.address_line1}</h4>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{p.city}</p>
              {p.price && <p className="text-cyan text-xs font-black mt-1">${p.price.toLocaleString()}</p>}
            </div>
            {selectedId === p.id && (
              <span className="material-symbols-outlined text-cyan">check_circle</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex items-center justify-between group cursor-pointer hover:border-white/10 transition-all">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-full bg-onyx border border-white/5 flex items-center justify-center text-slate-500 group-hover:text-cyan transition-colors">
            <span className="material-symbols-outlined">add</span>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm">Create New Listing</h4>
            <p className="text-slate-500 text-xs">The property isn't in Onyx yet.</p>
          </div>
        </div>
        <span className="material-symbols-outlined text-white/10 group-hover:text-white/40 transition-colors">chevron_right</span>
      </div>
    </div>
  );
}
