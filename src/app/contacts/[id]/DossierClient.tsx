"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { EditEmailModal } from "@/components/crm/EditEmailModal";
import { formatDistanceToNow, parseISO } from "date-fns";

const commStats = [
  { name: "Week 1", sent: 4, opened: 3 },
  { name: "Week 2", sent: 12, opened: 8 },
  { name: "Week 3", sent: 8, opened: 7 },
  { name: "Week 4", sent: 15, opened: 12 },
];

export default function DossierClient({ initialLead, initialTouchpoints }: { initialLead: any, initialTouchpoints: any[] }) {
  const [touchpoints, setTouchpoints] = useState(initialTouchpoints);
  const [editingTouchpoint, setEditingTouchpoint] = useState<any>(null);

  const name = [initialLead.first_name, initialLead.last_name].filter(Boolean).join(" ") || "Unknown";
  const initials = initialLead.first_name ? initialLead.first_name.charAt(0) : "?";

  const handleSaveTouchpoint = async (id: string, updates: { subject: string, raw_content: string, scheduled_for: string }) => {
    try {
      if (id === 'new') {
         const res = await fetch("/api/crm/touchpoints/create", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ 
             lead_id: initialLead.id,
             campaign_id: editingTouchpoint?.campaign_id || touchpoints[0]?.campaign_id || initialLead.assigned_campaign,
             ...updates 
           })
         });
         const { success, newTouchpoint } = await res.json();
         if (success && newTouchpoint) {
            setTouchpoints(prev => [...prev, newTouchpoint].sort((a,b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime()));
            setEditingTouchpoint(null);
         }
      } else {
        const res = await fetch("/api/crm/touchpoints/edit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...updates })
        });
        const { success, compiledHtml, newStatus } = await res.json();
        
        if (success) {
          setTouchpoints(prev => prev.map(tp => tp.id === id ? { 
            ...tp, 
            subject: updates.subject, 
            raw_content: updates.raw_content,
            scheduled_for: updates.scheduled_for,
            content: compiledHtml,
            status: newStatus || tp.status
          } : tp).sort((a,b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime()));
          setEditingTouchpoint(null);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save changes.");
    }
  };

  const handleDeleteTouchpoint = async (id: string) => {
    // Rely on component for modal confirm if passed directly, or native confirm as fallback
    // The inner modal runs its own confirm, so we don't strictly need one here if we trigger via modal. 
    // Wait, the TimelineEvent calls this directly, so we need a confirm:
    if (!window.confirm("Are you sure you want to delete this email? This action cannot be undone.")) return;

    try {
      const res = await fetch("/api/crm/touchpoints/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      
      const { success } = await res.json();
      
      if (success) {
        setTouchpoints(prev => prev.filter(tp => tp.id !== id));
        if (editingTouchpoint?.id === id) setEditingTouchpoint(null);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete touchpoint.");
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 md:px-10 py-10 flex flex-col gap-8 bg-[#0B0E14] text-slate-100 min-h-screen">
      <header className="flex items-center justify-between border-b border-[#27373a] pb-8">
        <div className="flex items-center gap-6">
          <div className="size-20 bg-cyan/10 border-2 border-cyan/30 text-cyan rounded-full flex items-center justify-center text-3xl font-black shadow-[0_0_30px_rgba(0,209,255,0.2)]">
            {initials}
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">{name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-cyan text-xs font-black uppercase tracking-widest bg-cyan/10 px-3 py-1 rounded-full border border-cyan/20">
                {initialLead.heat_index || "NEW"}
              </span>
              <span className="text-slate-500 text-xs font-bold flex items-center gap-1">
                {initialLead.email || "No email"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-[#161B22] border border-[#27373a] text-slate-300 font-bold rounded-xl hover:bg-[#1C232B] transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">edit</span> Edit
          </button>
          <button 
            className="px-8 py-3 bg-cyan text-onyx font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(0,209,255,0.3)] hover:brightness-110 transition-all flex items-center gap-2"
            onClick={() => setEditingTouchpoint({
              id: 'new',
              campaign_id: touchpoints[0]?.campaign_id || initialLead.assigned_campaign,
              channel: 'Email',
              subject: '',
              raw_content: '',
              scheduled_for: new Date(Date.now() + 86400000).toISOString()
            })}
          >
            <span className="material-symbols-outlined font-bold">send</span> Message
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Dossier Stats */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#11151c] border border-[#27373a] rounded-2xl p-6 shadow-2xl">
            <h3 className="font-black uppercase tracking-tighter text-lg mb-6 flex items-center gap-2 text-cyan">
              <span className="material-symbols-outlined uppercase">badge</span> Dossier Summary
            </h3>
            <div className="space-y-4">
              <DossierItem label="Emails Queued" value={touchpoints.filter(t => t.status === 'pending' || t.status === 'draft').length.toString()} icon="mail" />
              <DossierItem label="Emails Sent" value={touchpoints.filter(t => t.status === 'sent').length.toString()} icon="mark_email_read" />
              {initialLead.internal_notes && (
                <div className="mt-4 pt-4 border-t border-[#27373a]">
                  <h4 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2">Internal Notes</h4>
                  <p className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-cyan/50 pl-3">
                    {initialLead.internal_notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#11151c] border border-[#27373a] rounded-2xl p-6 shadow-2xl">
            <h3 className="font-black uppercase tracking-tighter text-lg mb-4 flex items-center gap-2 text-white">
              <span className="material-symbols-outlined">trending_up</span> Engagement Trend
            </h3>
            <div className="h-[200px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={commStats}>
                  <XAxis dataKey="name" hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#11151c', border: '1px solid #27373a', borderRadius: '12px' }}
                  />
                  <Line type="monotone" dataKey="opened" stroke="#00D1FF" strokeWidth={3} dot={{ r: 4, fill: '#00D1FF' }} />
                  <Line type="monotone" dataKey="sent" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Messaging Timeline */}
        <div className="lg:col-span-2 bg-[#11151c] border border-[#27373a] rounded-2xl p-8 shadow-2xl flex flex-col gap-8 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-black uppercase tracking-tighter text-xl text-white">Communication Timeline</h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-cyan/10 text-cyan rounded-full text-[10px] font-black uppercase tracking-widest border border-cyan/20">AI Active</span>
            </div>
          </div>

          <div className="flex flex-col gap-10 relative">
            <div className="absolute left-6 top-2 bottom-2 w-px bg-[#27373a]"></div>

            {touchpoints.length > 0 ? touchpoints.map(tp => {
              const dateStr = formatDistanceToNow(parseISO(tp.scheduled_for), { addSuffix: true });
              const isPending = tp.status === 'pending';
              const isSent = tp.status === 'sent';

              const isDraft = tp.status === 'draft';
              const isEditable = isPending || isDraft;

              return (
                <TimelineEvent 
                  key={tp.id}
                  type={tp.channel}
                  title={tp.subject}
                  content={tp.raw_content ? tp.raw_content.slice(0, 80) + '...' : 'Open editor to view content'}
                  time={dateStr + (isPending ? " (Scheduled)" : isDraft ? " (Action Required)" : "")}
                  status={tp.status}
                  statusColor={isPending ? "bg-amber-500" : isSent ? "bg-emerald-500" : isDraft ? "bg-rose-500" : "bg-cyan"}
                  onClick={() => isEditable && setEditingTouchpoint(tp)}
                  clickable={isEditable}
                  onDelete={isEditable ? () => handleDeleteTouchpoint(tp.id) : undefined}
                />
              )
            }) : (
              <p className="text-slate-500 text-center py-10 italic">No touchpoints active for this contact yet.</p>
            )}
          </div>
        </div>
      </div>

      <EditEmailModal 
        touchpoint={editingTouchpoint} 
        onClose={() => setEditingTouchpoint(null)}
        onSave={handleSaveTouchpoint}
        // Since EditEmailModal uses its own native window.confirm, we bypass DossierClient's confirm by direct extraction
        // Wait, if we pass handleDeleteTouchpoint it'll confirm twice! Let's pass a wrapper that skips the double confirm if needed.
        // Actually, we must use `window.confirm` carefully, we can just remove the confirm inside Dossier if the inner modal confirms, OR we can remove the one inside the EditModal and let Dossier handle it globally. But wait, `window.confirm` is cheap. Let's just create an unconfirmed deletion routine.
        onDelete={async (id) => {
           try {
            const res = await fetch("/api/crm/touchpoints/delete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id })
            });
            const { success } = await res.json();
            if (success) {
              setTouchpoints(prev => prev.filter(tp => tp.id !== id));
              setEditingTouchpoint(null);
            }
          } catch (err) {
            alert("Failed to delete touchpoint.");
          }
        }}
      />
    </div>
  );
}

function DossierItem({ label, value, icon }: { label: string, value: string, icon: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-onyx rounded-xl border border-[#27373a]">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-slate-500 text-xl">{icon}</span>
        <span className="text-slate-400 text-sm font-bold">{label}</span>
      </div>
      <span className="text-white font-black text-lg">{value}</span>
    </div>
  );
}

function TimelineEvent({ 
  type, title, content, time, status, statusColor, onClick, clickable, onDelete
}: { 
  type: string, title: string, content: string, time: string, status: string, statusColor: string, onClick?: () => void, clickable?: boolean, onDelete?: () => void
}) {
  return (
    <div 
      className={`flex items-start gap-8 relative z-10 group ${clickable ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className={`mt-1 size-12 rounded-full border-2 border-[#27373a] bg-onyx flex items-center justify-center shrink-0 ${clickable ? 'group-hover:border-cyan' : ''} transition-all`}>
        <span className={`material-symbols-outlined text-slate-400 ${clickable ? 'group-hover:text-cyan' : ''}`}>
          {type.toLowerCase() === 'email' ? 'mail' : 'sms'}
        </span>
      </div>
      <div className={`flex-1 bg-onyx-surface p-4 rounded-xl border border-[#27373a] ${clickable ? 'group-hover:border-cyan/50' : ''} transition-colors`}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-black text-white uppercase tracking-tight truncate max-w-[70%]">{title}</h4>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{time}</span>
            {onDelete && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="text-slate-500 hover:text-rose-500 transition-colors flex items-center justify-center p-1 rounded hover:bg-rose-500/10"
                title="Delete Touchpoint"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed mb-4 border-l-2 border-[#27373a] pl-4 py-1 italic">
          "{content.replace(/<[^>]+>/g, '')}"
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`size-2 rounded-full ${statusColor} shadow-[0_0_8px_rgba(0,0,0,0.5)]`}></div>
            <span className={`text-[9px] font-black uppercase tracking-widest ${statusColor.replace('bg-', 'text-')}`}>
              {status}
            </span>
          </div>
          {clickable && (
            <span className="text-[10px] font-bold text-cyan uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              Click to Edit
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
