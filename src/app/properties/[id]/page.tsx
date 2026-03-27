"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/supabase/client";
import { EditPostModal } from "@/components/marketing/EditPostModal";

type Property = {
  id: string;
  address_line1: string;
  city: string;
  state: string;
  zip_code: string;
  price: number | null;
  status: string;
  bedrooms: number | null;
  bathrooms: number | null;
  sq_ft: number | null;
  year_built: number | null;
  lot_size: string | null;
  description: string | null;
  thumbnail_url: string | null;
  agent_id: string;
  features: string[];
  page_views?: number;
};

type PropertyImage = {
  id: string;
  url: string;
  storage_path: string | null;
  sort_order: number;
};

type Lead = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  status: string;
  created_at: string;
};

type MediaAsset = {
  id: string;
  asset_type: string;
  storage_path: string;
  created_at: string;
};

type Post = {
  id: string;
  image_url: string;
  caption: string;
  scheduled_at: string;
  platforms: string[];
  property_id: string | null;
  created_at?: string;
  status: string;
  motion_assets?: { total: number; completed: number; urls: string[] };
};

const STATUSES = ["ACTIVE", "PENDING", "SOLD", "WITHDRAWN"];
const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  SOLD: "bg-slate-500/10 text-slate-400 border-slate-500/30",
  WITHDRAWN: "bg-red-500/10 text-red-400 border-red-500/30",
};

const FEATURE_LIST = [
  { name: "Chef's Kitchen", icon: "restaurant" },
  { name: "Pool & Spa", icon: "pool" },
  { name: "Smart Home Tech", icon: "router" },
  { name: "Hardwood Floors", icon: "floor" },
  { name: "Ocean View", icon: "water" },
  { name: "Wine Cellar", icon: "wine_bar" },
  { name: "Home Theater", icon: "live_tv" },
  { name: "RV Parking", icon: "rv_hookup" },
  { name: "Guest House", icon: "cottage" },
  { name: "Solar Panels", icon: "solar_power" },
  { name: "Mountain View", icon: "landscape" },
  { name: "Gated Entry", icon: "security" },
];

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const supabase = createClient();

  const [property, setProperty] = useState<Property | null>(null);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [customFeature, setCustomFeature] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"gallery" | "leads" | "marketing">("gallery");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pending, setPending] = useState<{ name: string; done: boolean; error: boolean }[]>([]);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [dragOverGallery, setDragOverGallery] = useState(false);
  const [showDropZone, setShowDropZone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragItem = useRef<number | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/signup"); return; }

      const [propRes, imgRes, leadsRes, assetsRes, postsRes] = await Promise.all([
        supabase.from("properties")
          .select("id,address_line1,city,state,zip_code,price,status,bedrooms,bathrooms,sq_ft,year_built,lot_size,description,thumbnail_url,agent_id,features,page_views")
          .eq("id", id).single(),
        supabase.from("property_images")
          .select("id,url,storage_path,sort_order")
          .eq("property_id", id)
          .order("sort_order"),
        supabase.from("leads")
          .select("id,first_name,last_name,email,phone,status,created_at")
          .eq("agent_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase.from("media_assets")
          .select("id,asset_type,storage_path,created_at")
          .eq("property_id", id)
          .order("created_at", { ascending: false }),
        supabase.from("property_marketing_posts")
          .select("id,image_url,caption,scheduled_at,platforms,property_id,created_at,status,motion_assets")
          .eq("property_id", id)
          .order("scheduled_at", { ascending: false }),
      ]);

      if (propRes.data) setProperty({ ...propRes.data as unknown as Property, features: (propRes.data as unknown as Property).features ?? [] });
      if (imgRes.data) setImages(imgRes.data as PropertyImage[]);
      if (leadsRes.data) setLeads(leadsRes.data as Lead[]);
      if (assetsRes.data) setAssets(assetsRes.data as MediaAsset[]);
      if (postsRes.data) setPosts(postsRes.data as Post[]);
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSave() {
    if (!property) return;
    setSaving(true);
    const { error } = await supabase.from("properties").update({
      address_line1: property.address_line1,
      city: property.city,
      state: property.state,
      zip_code: property.zip_code,
      price: property.price,
      status: property.status as "ACTIVE" | "PENDING" | "SOLD" | "WITHDRAWN" | "CANCELLED",
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      sq_ft: property.sq_ft,
      year_built: property.year_built,
      lot_size: property.lot_size,
      description: property.description,
      thumbnail_url: images.find((_, i) => i === 0)?.url ?? property.thumbnail_url,
      features: property.features ?? [],
    }).eq("id", id);
    setSaving(false);
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
  }

  // Upload a single file, return the created PropertyImage or null
  async function uploadOne(file: File, sortOrder: number, onFileDone: (img: PropertyImage | null) => void) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { onFileDone(null); return; }
    const path = `${user.id}/${id}/${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
    const { error: storageError } = await supabase.storage
      .from("property-images")
      .upload(path, file, { upsert: true });
    if (storageError) {
      console.error("Storage upload error:", storageError);
      setUploadError(`Upload failed: ${storageError.message}`);
      onFileDone(null);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("property-images").getPublicUrl(path);
    const { data: newImg, error: dbError } = await supabase.from("property_images")
      .insert({ property_id: id, url: publicUrl, storage_path: path, sort_order: sortOrder })
      .select().single();
    if (dbError) {
      console.error("DB insert error:", dbError);
      setUploadError(`DB error: ${dbError.message}`);
      onFileDone(null);
      return;
    }
    onFileDone(newImg as PropertyImage);
  }

  async function handleImageUpload(files: File[]) {
    if (!files.length) return;
    setUploading(true);
    setUploadError(null);
    setShowDropZone(false);
    const baseOrder = images.length;
    const results: (PropertyImage | null)[] = new Array(files.length).fill(null);
    setPending(files.map((f) => ({ name: f.name, done: false, error: false })));
    await Promise.all(
      files.map((file, i) =>
        uploadOne(file, baseOrder + i, (img) => {
          results[i] = img;
          setPending((prev) =>
            prev.map((p, pi) => pi === i ? { ...p, done: true, error: img === null } : p)
          );
        })
      )
    );
    const valid = results.filter((img): img is PropertyImage => img !== null);
    if (valid.length > 0) setImages((prev) => [...prev, ...valid]);
    setUploading(false);
    setTimeout(() => setPending([]), 1500);
  }

  async function handleDeleteImage(img: PropertyImage) {
    if (img.storage_path) {
      await supabase.storage.from("property-images").remove([img.storage_path]);
    }
    await supabase.from("property_images").delete().eq("id", img.id);
    setImages((prev) => prev.filter((i) => i.id !== img.id));
  }

  const handleDrop = useCallback(async (dropIndex: number) => {
    const dragIndex = dragItem.current;
    if (dragIndex === null || dragIndex === dropIndex) return;
    const reordered = [...images];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    const updated = reordered.map((img, i) => ({ ...img, sort_order: i }));
    setImages(updated);
    setDragOver(null);
    dragItem.current = null;
    // Persist new sort order
    await Promise.all(
      updated.map((img) => supabase.from("property_images").update({ sort_order: img.sort_order }).eq("id", img.id))
    );
  }, [images, supabase]);

  function update(field: keyof Property, value: string | number | null) {
    setProperty((prev) => prev ? { ...prev, [field]: value } : prev);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="material-symbols-outlined text-cyan text-4xl animate-spin">autorenew</span>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-slate-400">Property not found.</p>
        <Link href="/properties" className="text-cyan text-sm">← Back to Properties</Link>
      </div>
    );
  }

  const address = [property.address_line1, property.city, property.state].filter(Boolean).join(", ");

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 md:px-10 py-10 pb-20">
      {/* ── Top Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Link href="/properties" className="text-slate-500 text-xs hover:text-cyan transition-colors flex items-center gap-1 mb-2">
            <span className="material-symbols-outlined text-[14px]">arrow_back</span> Property Manager
          </Link>
          <h1 className="text-3xl font-bold font-display tracking-tight text-white truncate max-w-xl">
            {address || "New Listing"}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {property.price ? `$${property.price.toLocaleString()}` : "Price TBD"}
          </p>
        </div>

        {/* Action buttons — studios removed to Marketing tab */}
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={`/property/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 border border-white/10 text-slate-300 rounded-xl text-sm font-semibold hover:border-white/30 hover:text-white transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            View Listing Page
          </a>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan text-onyx font-bold rounded-xl text-sm hover:brightness-110 transition-all disabled:opacity-50"
          >
            {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8">
        {/* ── LEFT: Edit form ── */}
        <div className="flex flex-col gap-5">
          {/* Marketing Health Widget */}
          <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-5 relative overflow-hidden group shadow-xl">
             <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] pointer-events-none transition-all duration-1000 ${
               Math.min(posts.length * 20, 80) + Math.min(property.page_views || 0, 20) >= 80 ? 'bg-emerald-500/10' : 
               Math.min(posts.length * 20, 80) + Math.min(property.page_views || 0, 20) >= 40 ? 'bg-amber-500/10' : 'bg-red-500/10'
             }`} />
             
             <div className="flex items-center justify-between mb-4 relative z-10">
               <div>
                 <h2 className="text-white font-bold flex items-center gap-2 tracking-tight">
                    <span className="material-symbols-outlined text-cyan text-xl">monitor_heart</span>
                    Marketing Health
                 </h2>
                 <p className="text-slate-400 text-xs mt-1">Get 80 points from posts, 20 from views.</p>
               </div>
               <div className={`text-3xl font-black font-display tracking-tighter ${
                 Math.min(posts.length * 20, 80) + Math.min(property.page_views || 0, 20) >= 80 ? 'text-emerald-400' : 
                 Math.min(posts.length * 20, 80) + Math.min(property.page_views || 0, 20) >= 40 ? 'text-amber-400' : 'text-red-400'
               }`}>
                 {Math.min(posts.length * 20, 80) + Math.min(property.page_views || 0, 20)}<span className="text-lg text-slate-500">/100</span>
               </div>
             </div>
             
             <div className="h-2.5 w-full bg-onyx rounded-full overflow-hidden border border-[#27373a] relative z-10">
               <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    Math.min(posts.length * 20, 80) + Math.min(property.page_views || 0, 20) >= 80 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : 
                    Math.min(posts.length * 20, 80) + Math.min(property.page_views || 0, 20) >= 40 ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                  }`}
                  style={{ width: `${Math.min(posts.length * 20, 80) + Math.min(property.page_views || 0, 20)}%` }}
               />
             </div>
             
             <div className="flex items-center justify-between mt-4 relative z-10 border-t border-[#27373a] pt-3">
               <div className="flex flex-col">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Content Effort</span>
                 <span className="text-xs font-bold text-white flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px] text-cyan">campaign</span> {Math.min(posts.length * 20, 80)}/80 pts</span>
               </div>
               <div className="w-px h-6 bg-[#27373a]" />
               <div className="flex flex-col">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Page Traffic</span>
                 <span className="text-xs font-bold text-white flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px] text-purple-400">visibility</span> {Math.min(property.page_views || 0, 20)}/20 pts</span>
               </div>
             </div>
          </div>

          {/* Status */}
          <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Status</label>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => update("status", s)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all capitalize ${property.status === s ? STATUS_STYLES[s] : "border-[#27373a] text-slate-500 hover:border-slate-600"}`}
                >
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-5 flex flex-col gap-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Address</label>
            <Field label="Street" value={property.address_line1 ?? ""} onChange={(v) => update("address_line1", v)} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="City" value={property.city ?? ""} onChange={(v) => update("city", v)} />
              <Field label="State" value={property.state ?? ""} onChange={(v) => update("state", v)} />
            </div>
            <Field label="ZIP Code" value={property.zip_code ?? ""} onChange={(v) => update("zip_code", v)} />
          </div>

          {/* Price & Details */}
          <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-5 flex flex-col gap-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Listing Details</label>
            <NumField label="List Price ($)" value={property.price} onChange={(v) => update("price", v)} />
            <div className="grid grid-cols-2 gap-3">
              <NumField label="Bedrooms" value={property.bedrooms} onChange={(v) => update("bedrooms", v)} />
              <NumField label="Bathrooms" value={property.bathrooms} onChange={(v) => update("bathrooms", v)} step="0.5" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumField label="Sq Ft" value={property.sq_ft} onChange={(v) => update("sq_ft", v)} />
              <NumField label="Year Built" value={property.year_built} onChange={(v) => update("year_built", v)} />
            </div>
            <Field label="Lot Size (optional)" value={property.lot_size ?? ""} onChange={(v) => update("lot_size", v)} placeholder="e.g. 0.25 acres" />
          </div>

          {/* Feature Highlights */}
          <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-5 flex flex-col gap-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Feature Highlights</label>
            <p className="text-slate-500 text-xs -mt-2">Select key selling points to highlight in marketing media.</p>
            <div className="grid grid-cols-2 gap-3">
              {FEATURE_LIST.map((feat) => {
                const active = property.features?.includes(feat.name) ?? false;
                return (
                  <button
                    key={feat.name}
                    type="button"
                    onClick={() => {
                      const next = active
                        ? (property.features ?? []).filter((f) => f !== feat.name)
                        : [...(property.features ?? []), feat.name];
                      update("features" as keyof Property, next as unknown as string);
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left ${
                      active
                        ? "border-cyan/50 bg-cyan/10 text-white"
                        : "border-[#27373a] text-slate-500 hover:border-slate-600 hover:text-slate-300"
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[18px] ${active ? "text-cyan" : "text-slate-600"}`}>{feat.icon}</span>
                    <span className="text-xs font-semibold">{feat.name}</span>
                  </button>
                );
              })}
            </div>
            {/* Custom feature input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const val = customFeature.trim();
                if (!val || (property.features ?? []).includes(val)) return;
                update("features" as keyof Property, [...(property.features ?? []), val] as unknown as string);
                setCustomFeature("");
              }}
              className="flex gap-2"
            >
              <input
                value={customFeature}
                onChange={(e) => setCustomFeature(e.target.value)}
                placeholder="Add a custom feature…"
                className="flex-1 bg-onyx border border-[#27373a] text-slate-100 rounded-lg h-9 px-3 focus:border-cyan outline-none transition-all placeholder:text-slate-600 text-xs"
              />
              <button
                type="submit"
                className="h-9 px-3 bg-cyan/10 border border-cyan/30 text-cyan rounded-lg text-xs font-bold hover:bg-cyan/20 transition-all"
              >
                Add
              </button>
            </form>
            {/* Custom feature chips */}
            {(property.features ?? []).filter((f) => !FEATURE_LIST.find((fl) => fl.name === f)).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(property.features ?? []).filter((f) => !FEATURE_LIST.find((fl) => fl.name === f)).map((f) => (
                  <span key={f} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan/10 border border-cyan/20 text-cyan text-xs rounded-full font-semibold">
                    {f}
                    <button
                      onClick={() => update("features" as keyof Property, (property.features ?? []).filter((x) => x !== f) as unknown as string)}
                      className="hover:text-white transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-5 flex flex-col gap-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Property Description</label>
            <textarea
              rows={6}
              value={property.description ?? ""}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Describe the property's key features, upgrades, neighborhood..."
              className="w-full bg-onyx border border-[#27373a] text-slate-100 rounded-lg px-4 py-3 focus:border-cyan outline-none resize-none transition-all placeholder:text-slate-600 text-sm"
            />
          </div>
        </div>

        {/* ── RIGHT: Tabs ── */}
        <div className="flex flex-col">
          {/* Tab bar */}
          <div className="flex gap-1 border-b border-[#27373a] mb-6">
            {(["gallery", "leads", "marketing"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-semibold capitalize transition-all border-b-2 -mb-px ${
                  activeTab === tab
                    ? "border-cyan text-cyan"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab === "gallery" && <span className="material-symbols-outlined text-[14px] mr-1.5 align-[-2px]">collections</span>}
                {tab === "leads" && <span className="material-symbols-outlined text-[14px] mr-1.5 align-[-2px]">group</span>}
                {tab === "marketing" && <span className="material-symbols-outlined text-[14px] mr-1.5 align-[-2px]">campaign</span>}
                {tab}
              </button>
            ))}
          </div>

          {/* Gallery Tab */}
          {activeTab === "gallery" && (
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={async (e) => {
                  const files = Array.from(e.target.files ?? []);
                  await handleImageUpload(files);
                }}
              />
              {uploadError && (
                <div className="mb-3 px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                  {uploadError}
                </div>
              )}

              {/* Progress indicators */}
              {pending.length > 0 && (
                <div className="mb-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400">Uploading {pending.filter(p => p.done).length} / {pending.length} photos…</p>
                  </div>
                  <div className="w-full bg-onyx rounded-full h-1.5 overflow-hidden border border-black/20">
                    <div
                      className="h-full bg-cyan rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(0,209,255,0.6)]"
                      style={{ width: `${(pending.filter(p => p.done).length / pending.length) * 100}%` }}
                    />
                  </div>
                  <div className="flex flex-col gap-1 max-h-28 overflow-y-auto">
                    {pending.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 px-2 py-1.5 bg-onyx border border-[#27373a] rounded-lg">
                        <span className={`material-symbols-outlined text-[14px] ${p.error ? "text-red-400" : p.done ? "text-emerald-400" : "text-cyan animate-spin"}`}>
                          {p.error ? "error" : p.done ? "check_circle" : "autorenew"}
                        </span>
                        <span className="text-xs text-slate-300 truncate flex-1">{p.name}</span>
                        <span className={`text-[10px] font-bold ${p.error ? "text-red-400" : p.done ? "text-emerald-400" : "text-slate-500"}`}>
                          {p.error ? "Failed" : p.done ? "Done" : "…"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <p className="text-slate-400 text-sm">{images.length} image{images.length !== 1 ? "s" : ""}. Drag to reorder. First image becomes the thumbnail.</p>
                <button
                  onClick={() => setShowDropZone(prev => !prev)}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan/10 border border-cyan/30 text-cyan rounded-xl text-sm font-semibold hover:bg-cyan/20 transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">{uploading ? "autorenew" : showDropZone ? "close" : "add_photo_alternate"}</span>
                  {uploading ? "Uploading…" : showDropZone ? "Hide Uploader" : "Add Images"}
                </button>
              </div>

              {/* Drop zone — only shown when toggled or gallery is empty */}
              {(showDropZone || images.length === 0) && (
                <div
                  className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center py-16 gap-4 cursor-pointer transition-all mb-4 ${
                    dragOverGallery ? "border-cyan bg-cyan/5" : "border-[#27373a] hover:border-cyan/40"
                  }`}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOverGallery(true); }}
                  onDragLeave={() => setDragOverGallery(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverGallery(false);
                    const files = Array.from(e.dataTransfer.files);
                    handleImageUpload(files);
                  }}
                >
                  <span className={`material-symbols-outlined text-5xl ${dragOverGallery ? "text-cyan" : "text-slate-600"}`}>add_photo_alternate</span>
                  <p className="text-slate-500 text-sm">Click or drag images here to upload</p>
                </div>
              )}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((img, index) => (
                    <div
                      key={img.id}
                      draggable
                      onDragStart={() => { dragItem.current = index; }}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(img.id); }}
                      onDragLeave={() => setDragOver(null)}
                      onDrop={() => handleDrop(index)}
                      className={`relative group rounded-xl overflow-hidden cursor-grab active:cursor-grabbing border-2 transition-all ${
                        dragOver === img.id ? "border-cyan scale-105" : "border-transparent"
                      }`}
                    >
                      <img src={img.url} alt={`Property image ${index + 1}`} className="w-full h-36 object-cover" />
                      {/* Thumbnail badge */}
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-cyan text-onyx text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                          Thumbnail
                        </div>
                      )}
                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteImage(img)}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-500/90 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                      </button>
                      {/* Drag handle indicator */}
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-60 transition-opacity">
                        <span className="material-symbols-outlined text-white text-[16px]">drag_indicator</span>
                      </div>
                    </div>
                  ))}
                  {/* Add more tile */}
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-[#27373a] rounded-xl flex flex-col items-center justify-center h-36 cursor-pointer hover:border-cyan/50 hover:bg-cyan/5 transition-all"
                  >
                    <span className="material-symbols-outlined text-slate-600 text-3xl">add</span>
                    <p className="text-slate-600 text-xs mt-1">Add more</p>
                  </div>
                </div>
            </div>
          )}

          {/* Leads Tab */}
          {activeTab === "leads" && (
            <div>
              <p className="text-slate-500 text-xs mb-4">Showing all leads for your account. Property-scoped filtering coming soon.</p>
              {leads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <span className="material-symbols-outlined text-slate-700 text-5xl">group</span>
                  <p className="text-slate-500 text-sm">No leads yet. Share your listing page to start capturing contacts.</p>
                  <a
                    href={`/property/${id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan text-sm hover:underline"
                  >
                    View Listing Page →
                  </a>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-[#27373a]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#27373a] bg-onyx">
                        <th className="text-left text-slate-400 text-xs uppercase tracking-widest font-bold px-4 py-3">Name</th>
                        <th className="text-left text-slate-400 text-xs uppercase tracking-widest font-bold px-4 py-3">Email</th>
                        <th className="text-left text-slate-400 text-xs uppercase tracking-widest font-bold px-4 py-3">Phone</th>
                        <th className="text-left text-slate-400 text-xs uppercase tracking-widest font-bold px-4 py-3">Status</th>
                        <th className="text-left text-slate-400 text-xs uppercase tracking-widest font-bold px-4 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead, i) => (
                        <tr key={lead.id} className={`border-b border-[#1a2024] transition-colors hover:bg-white/5 ${i % 2 === 0 ? "bg-onyx-surface" : "bg-onyx"}`}>
                          <td className="px-4 py-3 font-semibold text-white">{lead.first_name} {lead.last_name}</td>
                          <td className="px-4 py-3 text-slate-400">{lead.email ?? "—"}</td>
                          <td className="px-4 py-3 text-slate-400">{lead.phone ?? "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                              lead.status === "NEW" ? "bg-cyan/10 text-cyan border-cyan/20" : "bg-slate-700/30 text-slate-400 border-slate-600/20"
                            }`}>
                              {lead.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs">{new Date(lead.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Marketing Tab */}
          {activeTab === "marketing" && (
            <div className="flex flex-col gap-10">
              <div className="flex gap-3 items-center justify-between pb-4 border-b border-[#27373a]">
                <div>
                   <h3 className="text-white font-bold text-lg mb-1">Marketing Studios</h3>
                   <p className="text-slate-500 text-sm">Generate new social posts and flyers</p>
                </div>
                <div className="flex gap-3">
                  <Link href={`/marketing/static?propertyId=${id}`} className="flex items-center gap-2 px-5 py-2.5 bg-cyan/10 border border-cyan/30 text-cyan rounded-xl text-sm font-bold hover:bg-cyan/20 transition-all">
                    <span className="material-symbols-outlined text-[16px]">image</span>
                    Static Studio
                  </Link>
                  <Link href={`/marketing/motion?propertyId=${id}`} className="flex items-center gap-2 px-5 py-2.5 bg-purple-400/10 border border-purple-400/30 text-purple-400 rounded-xl text-sm font-bold hover:bg-purple-400/20 transition-all">
                    <span className="material-symbols-outlined text-[16px]">movie</span>
                    Motion Studio
                  </Link>
                </div>
              </div>

              <div>
                <h3 className="text-white font-bold text-lg mb-4">Scheduled & Published Posts</h3>
                {posts.length === 0 ? (
                  <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3">
                     <span className="material-symbols-outlined text-slate-600 text-4xl">schedule</span>
                     <p className="text-slate-400 text-sm">No scheduled posts yet. Create some in the Static Studio.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {posts.map(post => (
                       <div key={post.id} onClick={() => { if (post.status !== 'generating') setEditingPost(post) }} className={`bg-onyx rounded-xl border flex flex-col overflow-hidden transition-all ${post.status === 'generating' ? 'border-cyan border-dashed opacity-80 cursor-wait' : 'border-[#27373a] hover:border-cyan/50 cursor-pointer group'}`}>
                         <div className="h-40 bg-black relative flex items-center justify-center">
                            {post.status === 'generating' ? (
                               <div className="flex flex-col items-center text-cyan gap-2">
                                  <span className="material-symbols-outlined text-4xl animate-spin">autorenew</span>
                                  <span className="text-xs font-bold uppercase tracking-widest">Generating Video...</span>
                               </div>
                            ) : (
                               <>
                                 {post.image_url?.toLowerCase().endsWith('.mp4') || post.image_url?.includes("creatomate") ? (
                                    <video src={post.image_url} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                 ) : (
                                    <img src={post.image_url} alt="Post" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                 )}
                                 {/* Optional Video Play Icon */}
                                 {(post.image_url?.toLowerCase().endsWith('.mp4') || post.image_url?.includes("creatomate")) && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                      <div className="w-12 h-12 bg-black/60 backdrop-blur rounded-full flex items-center justify-center border border-white/20">
                                         <span className="material-symbols-outlined text-white text-2xl ml-1">play_arrow</span>
                                      </div>
                                    </div>
                                 )}
                               </>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3 pointer-events-none">
                               <div className="flex gap-1">
                                  {post.platforms.map(p => (
                                     <span key={p} className="bg-black/50 backdrop-blur text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border border-white/10">{p}</span>
                                  ))}
                               </div>
                            </div>
                         </div>
                         <div className="p-4 flex flex-col flex-1 gap-2">
                           <div className="flex items-center justify-between text-xs font-bold">
                             <span className="text-slate-400 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[14px]">calendar_month</span> 
                                {post.scheduled_at ? new Date(post.scheduled_at).toLocaleDateString() : "Unscheduled"}
                             </span>
                             {post.status === 'generating' ? (
                               <span className="text-amber-400 flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-[14px]">schedule</span> Drafting...
                               </span>
                             ) : (post.scheduled_at && new Date(post.scheduled_at) < new Date()) ? (
                               <span className="text-cyan flex items-center gap-1.5 px-2 py-0.5 bg-cyan/10 rounded-md border border-cyan/20">
                                  <span className="material-symbols-outlined text-[12px]">check_circle</span> Posted
                               </span>
                             ) : (
                               <span className={post.scheduled_at ? "text-emerald-400 flex items-center gap-1.5" : "text-amber-400 flex items-center gap-1.5"}>
                                  <span className="material-symbols-outlined text-[14px]">{post.scheduled_at ? "schedule" : "edit_calendar"}</span> 
                                  {post.scheduled_at ? new Date(post.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Click to Schedule"}
                               </span>
                             )}
                           </div>
                           <p className="text-slate-300 text-xs line-clamp-3 leading-relaxed opacity-80">{post.caption || "No caption provided."}</p>
                           {post.status === 'generating' && post.motion_assets && (
                             <div className="mt-2 w-full bg-[#161B26] rounded-full h-1">
                               <div className="bg-cyan h-1 rounded-full transition-all duration-500" style={{ width: `${(post.motion_assets.completed / post.motion_assets.total) * 100}%` }} />
                             </div>
                           )}
                         </div>
                       </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-white font-bold text-lg mb-4">Media Assets & Exports</h3>
                {assets.length === 0 ? (
                  <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3">
                     <span className="material-symbols-outlined text-slate-600 text-4xl">inventory_2</span>
                     <p className="text-slate-400 text-sm">No exported media assets found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {assets.map((asset) => (
                      <div 
                        key={asset.id} 
                        className="bg-onyx-surface border border-[#27373a] rounded-xl overflow-hidden group hover:border-cyan/30 transition-all cursor-pointer"
                        onClick={() => {
                           const post = posts.find(p => p.image_url === asset.storage_path);
                           setEditingPost(post || {
                               id: 'new',
                               image_url: asset.storage_path,
                               caption: '',
                               scheduled_at: '',
                               platforms: [],
                               property_id: id,
                               status: 'draft'
                           });
                        }}
                      >
                        <div className="h-28 bg-black relative flex items-center justify-center border-b border-[#27373a]">
                          {asset.storage_path?.toLowerCase().endsWith('.mp4') || asset.storage_path?.includes("creatomate") ? (
                             <video src={asset.storage_path} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                          ) : (
                             <img src={asset.storage_path} alt="Asset" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                          )}
                          <span className="absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full border bg-black/60 backdrop-blur text-white border-white/20 uppercase tracking-widest z-10">
                            {asset.asset_type}
                          </span>
                          {(asset.storage_path?.toLowerCase().endsWith('.mp4') || asset.storage_path?.includes("creatomate")) && (
                             <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                               <div className="w-8 h-8 bg-black/60 backdrop-blur rounded-full flex items-center justify-center border border-white/20">
                                  <span className="material-symbols-outlined text-white text-lg ml-0.5">play_arrow</span>
                               </div>
                             </div>
                          )}
                        </div>
                        <div className="p-3 flex items-center justify-between">
                          <p className="text-slate-500 text-[10px] font-bold flex items-center gap-1.5"><span className="material-symbols-outlined text-[12px]">calendar_month</span> {new Date(asset.created_at).toLocaleDateString()}</p>
                          <span className="text-cyan text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity underline">Schedule →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {editingPost && (
        <EditPostModal 
          post={editingPost} 
          onClose={() => setEditingPost(null)}
          onUpdated={(updatedPost) => {
            setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
          }}
        />
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder = "" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-slate-400 text-xs font-semibold">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-onyx border border-[#27373a] text-slate-100 rounded-lg h-10 px-3 focus:border-cyan outline-none transition-all placeholder:text-slate-600 text-sm"
      />
    </div>
  );
}

function NumField({ label, value, onChange, step = "1" }: { label: string; value: number | null; onChange: (v: number | null) => void; step?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-slate-400 text-xs font-semibold">{label}</label>
      <input
        type="number"
        step={step}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
        className="w-full bg-onyx border border-[#27373a] text-slate-100 rounded-lg h-10 px-3 focus:border-cyan outline-none transition-all appearance-none text-sm"
      />
    </div>
  );
}
