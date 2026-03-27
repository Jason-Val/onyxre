"use client";

import { useState } from "react";
import { createClient } from "@/supabase/client";

type Post = {
  id: string;
  image_url: string;
  caption: string;
  scheduled_at: string;
  platforms: string[];
  property_id: string | null;
  status: string;
  motion_assets?: any;
};

export function EditPostModal({ 
  post, 
  onClose,
  onUpdated
}: { 
  post: Post;
  onClose: () => void;
  onUpdated: (updatedPost: Post) => void;
}) {
  const [caption, setCaption] = useState(post.caption || "");
  const [scheduleDate, setScheduleDate] = useState(() => {
    if (!post.scheduled_at) return "";
    return new Date(post.scheduled_at).toISOString().split('T')[0];
  });
  const [scheduleTime, setScheduleTime] = useState(() => {
    if (!post.scheduled_at) return "";
    return new Date(post.scheduled_at).toTimeString().slice(0, 5);
  });
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(post.platforms || []);
  
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  const togglePlatform = (p: string) => {
    setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const generateCaption = async () => {
    setIsGeneratingCaption(true);
    try {
      // For polishing, we ideally want propertyData but for now we can just polish what exists
      let propertyData = null;
      if (post.property_id) {
         const { data } = await supabase.from('properties').select('address_line1,features').eq('id', post.property_id).single();
         propertyData = data;
      }

      const res = await fetch('/api/ai/caption', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: caption ? 'polish' : 'generate',
            existingCaption: caption,
            templateType: "Post",
            propertyData
          })
      });
      const data = await res.json();
      if (data.caption) setCaption(data.caption);
    } catch {
       // Silent error for now
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const scheduledAtStr = `${scheduleDate}T${scheduleTime}`;
      const res = await fetch('/api/marketing/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          propertyId: post.property_id,
          imageUrl: post.image_url,
          caption,
          scheduledAt: scheduledAtStr,
          platforms: selectedPlatforms
        })
      });
      const data = await res.json();
      if (data.success) {
         onUpdated(data.data);
         onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-onyx/80 backdrop-blur-sm p-4">
      <div className="bg-onyx-surface border border-[#27373a] rounded-xl w-full max-w-4xl shadow-2xl flex flex-col relative overflow-hidden animate-in zoom-in-95">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-onyx rounded-full border border-[#27373a] text-slate-400 hover:text-white hover:border-slate-500 transition-colors z-10"
        >
           <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        <div className="p-8 border-b border-[#27373a]">
          <h2 className="text-2xl font-bold border-l-4 border-emerald-500 pl-4 tracking-tight text-white">Edit & Reschedule Post</h2>
          <p className="text-slate-400 pl-4 mt-1">Refine your social copy or adjust your Buffer schedule.</p>
        </div>

        <div className="p-8 flex flex-col lg:flex-row gap-8 overflow-y-auto max-h-[70vh]">
          {/* Preview */}
          <div className="w-[320px] shrink-0 self-start bg-onyx rounded-xl border border-[#27373a] flex flex-col overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            {post.image_url?.toLowerCase().endsWith('.mp4') || post.image_url?.includes("creatomate") ? (
               <video src={post.image_url} autoPlay loop muted playsInline className="w-full h-auto object-cover" />
            ) : (
               <img src={post.image_url} alt="Preview" className="w-full h-auto object-cover" />
            )}
          </div>
          
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-300">Social Caption</h3>
              <button onClick={generateCaption} className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded border border-emerald-500/20 shadow-sm transition-colors cursor-pointer disabled:opacity-50" disabled={isGeneratingCaption}>
                <span className="material-symbols-outlined text-[12px]">auto_awesome</span> {caption ? "Polish via Gemini" : "Generate via Gemini"}
              </button>
            </div>
            <textarea 
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Click 'Generate via Gemini' or enter your caption here..."
              className="w-full h-32 bg-onyx border border-[#27373a] text-slate-200 rounded-lg p-4 focus:border-cyan outline-none resize-none transition-colors leading-relaxed text-sm" 
            />
            
            <h3 className="font-bold text-sm text-slate-300 mt-2">Schedule Post (Buffer Integration)</h3>
            <div className="flex gap-4">
              <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="flex-1 bg-onyx border border-[#27373a] text-slate-100 rounded-lg h-10 px-4 outline-none focus:border-cyan appearance-none" />
              <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="flex-1 bg-onyx border border-[#27373a] text-slate-100 rounded-lg h-10 px-4 outline-none focus:border-cyan appearance-none" />
            </div>

            <div className="flex gap-4 mt-2">
              <PlatformToggle name="Instagram" active={selectedPlatforms.includes('Instagram')} onToggle={() => togglePlatform('Instagram')} />
              <PlatformToggle name="Facebook" active={selectedPlatforms.includes('Facebook')} onToggle={() => togglePlatform('Facebook')} />
              <PlatformToggle name="LinkedIn" active={selectedPlatforms.includes('LinkedIn')} onToggle={() => togglePlatform('LinkedIn')} />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[#27373a] bg-onyx flex items-center justify-between mt-auto">
          <a
            href={post.image_url}
            download
            target="_blank" 
            rel="noopener noreferrer"
            className="px-6 py-3 font-bold text-slate-300 hover:text-white transition-colors flex items-center gap-2 border border-[#27373a] rounded-xl hover:border-slate-500 bg-onyx-surface shadow-inner"
            title="Download this generated asset"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Download Media
          </a>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 font-bold text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!caption || !scheduleDate || !scheduleTime || selectedPlatforms.length === 0 || isSaving}
              className="bg-cyan text-onyx font-bold rounded-xl px-8 py-3 flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,209,255,0.3)]"
            >
              <span className="material-symbols-outlined">{isSaving ? 'hourglass_empty' : 'save'}</span>
              {isSaving ? 'Saving...' : 'Save & Reschedule'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlatformToggle({ name, active, onToggle }: { name: string, active: boolean, onToggle: () => void }) {
  return (
    <div onClick={onToggle} className={`flex-1 py-2 px-3 border rounded-lg text-center cursor-pointer font-bold text-sm transition-all ${active ? 'border-cyan bg-cyan/10 text-cyan' : 'border-[#27373a] bg-onyx text-slate-400 hover:border-slate-500'}`}>
      {name}
    </div>
  )
}
