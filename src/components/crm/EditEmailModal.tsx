"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import "react-quill-new/dist/quill.snow.css";
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export function EditEmailModal({ 
  touchpoint, 
  onClose,
  onSave,
  onDelete
}: { 
  touchpoint: any | null, 
  onClose: () => void,
  onSave: (id: string, updates: { subject: string, raw_content: string, scheduled_for: string }) => Promise<void>,
  onDelete?: (id: string) => Promise<void>
}) {
  if (!touchpoint) return null;

  const getLocalDateString = (isoString?: string) => {
    if (!isoString) {
      const d = new Date();
      d.setDate(d.getDate() + 1); // tomorrow default
      return d.toISOString().slice(0, 16);
    }
    try {
      const d = new Date(isoString);
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    } catch {
      return new Date().toISOString().slice(0, 16);
    }
  };

  const [subject, setSubject] = useState(touchpoint.subject || "");
  const [content, setContent] = useState(touchpoint.raw_content || touchpoint.content || "");
  const [scheduledFor, setScheduledFor] = useState(getLocalDateString(touchpoint.scheduled_for));
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(touchpoint.id, { 
      subject, 
      raw_content: content,
      scheduled_for: new Date(scheduledFor).toISOString()
    });
    setIsSaving(false);
  };

  const handlePreview = () => {
    if (touchpoint.id === 'new') return alert("Please save the touchpoint first before previewing.");
    window.open(`/api/crm/touchpoints/preview?id=${touchpoint.id}`, '_blank');
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean'],
    ],
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#11151c] border border-[#27373a] w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col overflow-hidden"
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

          <div className="p-6 flex flex-col gap-6 overflow-y-auto max-h-[70vh]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-slate-300 text-sm font-semibold ml-1">Subject Line</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-onyx border border-[#27373a] text-slate-100 rounded-lg h-12 px-4 focus:border-cyan outline-none transition-all placeholder:text-slate-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-slate-300 text-sm font-semibold ml-1">Scheduled Time</label>
                <input 
                  type="datetime-local" 
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="w-full bg-onyx border border-[#27373a] text-slate-100 rounded-lg h-12 px-4 focus:border-cyan outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 text-sm font-semibold ml-1">Email Body</label>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest bg-onyx px-2 py-1 rounded">Rich Text</span>
              </div>
              <div className="bg-white rounded-lg overflow-hidden border-2 border-transparent focus-within:border-cyan transition-all mt-1">
                <ReactQuill 
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={modules}
                  className="h-[350px] text-black pb-10"
                />
              </div>
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
              {onDelete && touchpoint.id !== 'new' && (
                <button 
                  onClick={async () => {
                    if (window.confirm("Are you sure you want to delete this email? This action cannot be undone.")) {
                      setIsDeleting(true);
                      await onDelete(touchpoint.id);
                      setIsDeleting(false);
                    }
                  }}
                  disabled={isDeleting || isSaving}
                  className="px-6 py-2 border border-rose-500/50 text-rose-500 rounded-lg font-bold hover:bg-rose-500/10 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              )}
              <button 
                onClick={onClose}
                disabled={isDeleting || isSaving}
                className="px-6 py-2 border border-[#27373a] text-slate-400 rounded-lg font-bold hover:bg-[#1C232B] transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isDeleting || isSaving}
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
