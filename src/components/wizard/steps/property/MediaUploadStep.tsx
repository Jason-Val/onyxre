"use client";

import { useState, useRef, useCallback } from "react";
import { createClient } from "@/supabase/client";

export interface PropertyImage {
  id: string;
  url: string;
  storage_path: string | null;
  sort_order: number;
}

interface PendingFile {
  name: string;
  done: boolean;
  error: boolean;
}

interface MediaUploadStepProps {
  propertyId: string | null;
  images: PropertyImage[];
  onImagesChange: (images: PropertyImage[]) => void;
}

export function MediaUploadStep({ propertyId, images, onImagesChange }: MediaUploadStepProps) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [dragOverZone, setDragOverZone] = useState(false);
  const [showDropZone, setShowDropZone] = useState(true);
  const dragItem = useRef<number | null>(null);

  // Upload a single file — returns the created PropertyImage or null
  const uploadSingle = useCallback(async (
    file: File,
    sortOrder: number,
    onDone: (img: PropertyImage | null) => void,
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !propertyId) { onDone(null); return; }

    const path = `${user.id}/${propertyId}/${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
    const { error: storageError } = await supabase.storage
      .from("property-images")
      .upload(path, file, { upsert: true });

    if (storageError) {
      console.error("Storage error:", storageError);
      onDone(null);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("property-images").getPublicUrl(path);
    const { data: newImg, error: dbError } = await supabase
      .from("property_images")
      .insert({ property_id: propertyId, url: publicUrl, storage_path: path, sort_order: sortOrder })
      .select()
      .single();

    if (dbError) { console.error("DB error:", dbError); onDone(null); return; }
    onDone(newImg as PropertyImage);
  }, [supabase, propertyId]);

  async function handleFiles(files: FileList | File[]) {
    if (!propertyId) return;
    const fileArray = Array.from(files);
    if (!fileArray.length) return;

    setUploading(true);
    setShowDropZone(false);

    // Set up pending indicators
    setPending(fileArray.map((f) => ({ name: f.name, done: false, error: false })));

    const baseOrder = images.length;
    const results: (PropertyImage | null)[] = new Array(fileArray.length).fill(null);

    // Upload all in parallel
    await Promise.all(
      fileArray.map((file, i) =>
        uploadSingle(file, baseOrder + i, (img) => {
          results[i] = img;
          setPending((prev) =>
            prev.map((p, pi) => pi === i ? { ...p, done: true, error: img === null } : p)
          );
        })
      )
    );

    // Collect valid uploads and append all at once — fixes the stale-closure bug
    const valid = results.filter((img): img is PropertyImage => img !== null);
    if (valid.length > 0) {
      onImagesChange([...images, ...valid]);
    }

    setUploading(false);
    // Clear pending indicators after a short delay
    setTimeout(() => setPending([]), 1500);
  }

  async function handleDelete(img: PropertyImage) {
    if (img.storage_path) {
      await supabase.storage.from("property-images").remove([img.storage_path]);
    }
    await supabase.from("property_images").delete().eq("id", img.id);
    onImagesChange(images.filter((i) => i.id !== img.id));
  }

  const handleDrop = useCallback(async (dropIndex: number) => {
    const dragIndex = dragItem.current;
    if (dragIndex === null || dragIndex === dropIndex) return;
    const reordered = [...images];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    const updated = reordered.map((img, i) => ({ ...img, sort_order: i }));
    onImagesChange(updated);
    setDragOver(null);
    dragItem.current = null;
    await Promise.all(
      updated.map((img) =>
        supabase.from("property_images").update({ sort_order: img.sort_order }).eq("id", img.id)
      )
    );
  }, [images, onImagesChange, supabase]);

  function handleZoneDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOverZone(false);
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  }

  const noPropertyYet = !propertyId;
  const hasImages = images.length > 0;
  const hasPending = pending.length > 0;

  return (
    <div className="flex flex-col gap-8 h-full pr-2 pb-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold font-display tracking-tight border-l-4 border-cyan pl-4">Media Upload</h2>
        <p className="text-slate-400 pl-4">Upload listing photos. Drag to reorder — first image becomes the thumbnail.</p>
      </div>

      <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-8 shadow-2xl flex flex-col gap-6">
        {noPropertyYet ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <span className="material-symbols-outlined text-slate-600 text-5xl">info</span>
            <p className="text-slate-400 text-sm">Complete the Address step first to enable image uploads.</p>
          </div>
        ) : (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />

            {/* Drop zone — hidden once images exist unless user toggles it */}
            {showDropZone && (
              <div
                onClick={() => !uploading && fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOverZone(true); }}
                onDragLeave={() => setDragOverZone(false)}
                onDrop={handleZoneDrop}
                className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  dragOverZone
                    ? "border-cyan bg-cyan/10 scale-[1.01]"
                    : "border-cyan/30 hover:border-cyan hover:bg-cyan/5"
                }`}
              >
                <span className={`material-symbols-outlined text-5xl mb-3 transition-colors ${dragOverZone ? "text-cyan" : "text-cyan/50"}`}>
                  cloud_upload
                </span>
                <h3 className="text-lg font-bold text-slate-100 mb-1">Drag &amp; Drop Photos</h3>
                <p className="text-slate-400 text-sm max-w-xs">Or click to browse. JPG, PNG, HEIC — max 20 MB per file.</p>
              </div>
            )}

            {/* Per-file progress indicators */}
            {hasPending && (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-slate-400 font-semibold">
                  Uploading {pending.filter(p => p.done).length} / {pending.length} photos…
                </p>
                {/* Overall progress bar */}
                <div className="w-full bg-onyx rounded-full h-1.5 overflow-hidden border border-black/20">
                  <div
                    className="h-full bg-cyan rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(0,209,255,0.6)]"
                    style={{ width: `${(pending.filter(p => p.done).length / pending.length) * 100}%` }}
                  />
                </div>
                {/* Per-file rows */}
                <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto mt-1">
                  {pending.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 bg-onyx border border-[#27373a] rounded-lg">
                      <span className={`material-symbols-outlined text-[16px] ${p.error ? "text-red-400" : p.done ? "text-emerald-400" : "text-cyan animate-spin"}`}>
                        {p.error ? "error" : p.done ? "check_circle" : "autorenew"}
                      </span>
                      <span className="text-xs text-slate-300 truncate flex-1">{p.name}</span>
                      <span className={`text-[10px] font-bold ${p.error ? "text-red-400" : p.done ? "text-emerald-400" : "text-slate-500"}`}>
                        {p.error ? "Failed" : p.done ? "Done" : "Uploading"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image grid */}
            {hasImages && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-slate-400 text-xs">
                    {images.length} image{images.length !== 1 ? "s" : ""}
                    {!uploading && " · Drag to reorder"}
                  </p>
                  <button
                    onClick={() => { setShowDropZone((v) => !v); fileRef.current?.click(); }}
                    disabled={uploading}
                    className="text-xs text-cyan font-semibold hover:underline disabled:opacity-50 flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[13px]">add</span>
                    Add more
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((img, index) => (
                    <div
                      key={img.id}
                      draggable={!uploading}
                      onDragStart={() => { dragItem.current = index; }}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(img.id); }}
                      onDragLeave={() => setDragOver(null)}
                      onDrop={() => handleDrop(index)}
                      className={`relative group rounded-xl overflow-hidden cursor-grab active:cursor-grabbing border-2 transition-all ${
                        dragOver === img.id ? "border-cyan scale-105" : "border-transparent"
                      }`}
                    >
                      <img src={img.url} alt={`Upload ${index + 1}`} className="w-full h-32 object-cover" />

                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-cyan text-onyx text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                          Thumbnail
                        </div>
                      )}

                      <button
                        onClick={() => handleDelete(img)}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-500/90 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                      </button>

                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-60 transition-opacity">
                        <span className="material-symbols-outlined text-white text-[16px]">drag_indicator</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
