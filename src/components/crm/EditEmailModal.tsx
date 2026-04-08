"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function EditEmailModal({ 
  touchpoint, 
  onClose,
  onSave
}: { 
  touchpoint: any | null, 
  onClose: () => void,
  onSave: (id: string, updates: { subject: string, raw_content: string }) => Promise<void>
}) {
  if (!touchpoint) return null;

  const [subject, setSubject] = useState(touchpoint.subject || "");
  const [content, setContent] = useState(touchpoint.raw_content || touchpoint.content || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(touchpoint.id, { subject, raw_content: content });
    setIsSaving(false);
  };

  const handlePreview = () => {
    // Open a new tab passing the touchpoint ID or the raw content (if safe) to a preview route.
    // For simplicity, we can pass the touchpoint ID, and the preview route fetches it.
    // Alternatively, we can use a generic preview page if it existed.
    window.open(`/api/crm/touchpoints/preview?id=${touchpoint.id}`, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#11151c] border border-[#27373a] w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="p-6 border-b border-[#27373a] flex items-center justify-between bg-onyx">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan">edit_document</span>
              Edit Email Touchpoint
            </h2>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="p-6 flex flex-col gap-6 overflow-y-auto max-h-[60vh]">
            <div className="flex flex-col gap-2">
              <label className="text-slate-300 text-sm font-semibold ml-1">Subject Line</label>
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-onyx border border-[#27373a] text-slate-100 rounded-lg h-12 px-4 focus:border-cyan outline-none transition-all placeholder:text-slate-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 text-sm font-semibold ml-1">Email Body (HTML/Text)</label>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest bg-onyx px-2 py-1 rounded">Raw Source</span>
              </div>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-onyx border border-[#27373a] text-slate-100 rounded-lg p-4 focus:border-cyan outline-none resize-y h-[300px] font-mono text-sm transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                placeholder="<p>Write your email...</p>"
              />
            </div>
          </div>

          <div className="p-6 border-t border-[#27373a] bg-onyx flex items-center justify-between">
            <button 
              onClick={handlePreview}
              className="px-4 py-2 bg-onyx-surface border border-[#27373a] text-slate-300 rounded-lg hover:border-cyan hover:text-cyan transition-all text-sm font-bold flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">visibility</span>
              Live Preview
            </button>
            
            <div className="flex gap-4">
              <button 
                onClick={onClose}
                className="px-6 py-2 border border-[#27373a] text-slate-400 rounded-lg font-bold hover:bg-[#1C232B] transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-cyan text-onyx font-black uppercase tracking-widest rounded-lg flex items-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
