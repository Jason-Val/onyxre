"use client";

import Link from "next/link";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from "recharts";
import { motion } from "framer-motion";
import { formatDistanceToNow, parseISO, format, subDays } from "date-fns";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CRMClient({ leads, touchpoints, properties }: { leads: any[], touchpoints: any[], properties: any[] }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Compute Stats
  const sentMessages = touchpoints.filter(t => t.status === 'sent' || t.status === 'delivered');
  const openedMessages = touchpoints.filter(t => t.opened_at);
  const openRate = sentMessages.length > 0 ? Math.round((openedMessages.length / sentMessages.length) * 100) : 0;

  // Compute Hot Leads
  const hotLeads = leads.filter(l => l.heat_index === 'HOT').slice(0, 5);

  // Group touchpoints by day for the chart (last 7 days approx)
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = format(d, "MMM dd");
    const dayTouchpoints = sentMessages.filter(t => {
      if (!t.updated_at) return false;
      return format(parseISO(t.updated_at), "MMM dd") === dateStr;
    });

    const emailCount = dayTouchpoints.filter(t => (t.channel || '').toLowerCase() === 'email').length;
    const smsCount = dayTouchpoints.filter(t => (t.channel || '').toLowerCase() === 'sms').length;

    return {
      name: dateStr,
      email: emailCount,
      sms: smsCount
    }
  });

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 md:px-10 py-10 flex flex-col min-h-screen gap-8 bg-[#0B0E14] text-slate-100 font-sans">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-5xl font-black tracking-tighter mb-2 font-display uppercase italic text-white">
            Loomis <span className="text-cyan">CRM</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium tracking-wide">
            Elite Relationship Engine • Gemini Pro & Twilio Powered
          </p>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 xl:pb-0 hide-scrollbar">
          <Link href="/campaigns/new" className="whitespace-nowrap px-6 py-3 bg-[#161B22] border border-cyan/50 text-cyan font-bold rounded-xl flex items-center gap-2 hover:bg-cyan/10 transition-all shadow-[0_0_15px_rgba(0,209,255,0.1)]">
            <span className="material-symbols-outlined text-lg">campaign</span>
            Launch Campaign
          </Link>
          <button onClick={() => setIsModalOpen(true)} className="whitespace-nowrap px-6 py-3 bg-[#161B22] border border-[#27373a] text-slate-300 font-bold rounded-xl flex items-center gap-2 hover:bg-[#1C232B] transition-all">
            <span className="material-symbols-outlined text-lg">door_open</span>
            Open House Mode
          </button>
          <Link href="/contacts" className="whitespace-nowrap px-6 py-3 bg-[#161B22] border border-[#27373a] text-slate-300 font-bold rounded-xl flex items-center gap-2 hover:bg-[#1C232B] transition-all">
            <span className="material-symbols-outlined text-lg">contacts</span>
            Directory
          </Link>
          <Link href="/contacts/new" className="whitespace-nowrap px-8 py-3 bg-cyan text-onyx font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 hover:brightness-110 transition-all shadow-[0_0_30px_rgba(0,209,255,0.4)]">
            <span className="material-symbols-outlined font-bold">person_add</span>
            New Lead
          </Link>
          <button className="whitespace-nowrap px-6 py-3 bg-[#161B22] border border-[#27373a] text-slate-300 font-bold rounded-xl flex items-center gap-2 hover:bg-[#1C232B] transition-all">
            <span className="material-symbols-outlined text-lg">cloud_upload</span>
            Bulk Import
          </button>
        </div>
      </header>

      {/* Stats & Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#11151c] border border-[#27373a] rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan">insights</span>
              Engagement Velocity
            </h3>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
              <div className="flex items-center gap-2 text-cyan">
                <div className="size-2 bg-cyan rounded-full"></div> Email
              </div>
              <div className="flex items-center gap-2 text-indigo-500">
                <div className="size-2 bg-indigo-500 rounded-full"></div> SMS
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorEmail" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D1FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00D1FF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSms" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27373a" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#11151c', border: '1px solid #27373a', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="email" stroke="#00D1FF" strokeWidth={3} fillOpacity={1} fill="url(#colorEmail)" />
                <Area type="monotone" dataKey="sms" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSms)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#11151c] border border-[#27373a] rounded-2xl p-6 flex flex-col gap-6 shadow-2xl">
          <h3 className="font-bold text-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-500">photo_camera</span>
            Lead Snapshot
          </h3>
          <div className="flex-1 flex flex-col gap-4">
            <StatCard label="Total Leads" value={leads.length.toString()} icon="group" color="text-cyan" />
            <StatCard label="Messages Sent" value={sentMessages.length.toString()} icon="send" color="text-indigo-500" />
            <StatCard label="Open Rate" value={`${openRate}%`} icon="visibility" color="text-emerald-500" />
          </div>
          <button className="w-full py-4 bg-onyx border border-[#27373a] rounded-xl text-xs font-black uppercase tracking-widest hover:border-cyan hover:text-cyan transition-all">
            View Analytics Report
          </button>
        </div>
      </div>

      {/* Main Hot Leads Table */}
      <div className="bg-[#11151c] border border-[#27373a] rounded-2xl overflow-hidden shadow-2xl flex-1">
        <div className="p-6 border-b border-[#27373a] flex items-center justify-between bg-onyx-surface">
          <div className="flex items-center gap-6">
            <h3 className="font-bold text-xl text-white uppercase italic tracking-tighter">Current Hot Leads</h3>
            <Link href="/contacts" className="text-[10px] text-cyan hover:underline font-black uppercase tracking-widest bg-cyan/10 px-3 py-1 rounded-full border border-cyan/20">See all contacts</Link>
          </div>
          <div className="relative hidden md:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">search</span>
            <input type="text" className="bg-[#0B0E14] border border-[#27373a] rounded-lg h-10 pl-9 pr-4 text-sm focus:border-cyan outline-none text-slate-100 placeholder:text-slate-600 w-64 transition-all" placeholder="Search hot leads..." />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#27373a] bg-[#161B22]/50">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Contact</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Most Recent Message</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Last Touch</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161B22]">
              {hotLeads.length > 0 ? (
                hotLeads.map(lead => {
                  const name = [lead.first_name, lead.last_name].filter(Boolean).join(" ") || "Unknown";
                  const initials = lead.first_name ? lead.first_name.charAt(0) : "?";
                  
                  // Find most recent sent message
                  const leadTouchpoints = sentMessages.filter(t => t.lead_id === lead.id).sort((a,b) => new Date(b.updated_at || b.scheduled_for).getTime() - new Date(a.updated_at || a.scheduled_for).getTime());
                  const recent = leadTouchpoints[0];
                  
                  const messagePreview = recent?.subject ? `Subj: ${recent.subject}` : lead.internal_notes ? `Note: ${lead.internal_notes.substring(0, 30)}...` : "Waiting for blast...";
                  const timeAgo = recent?.updated_at || recent?.scheduled_for ? formatDistanceToNow(parseISO(recent.updated_at || recent.scheduled_for)) + " ago" : "Just now";

                  return (
                    <LeadRow 
                      key={lead.id}
                      id={lead.id}
                      name={name} 
                      role={lead.email || "No email"} 
                      status={lead.heat_index || "HOT"} 
                      message={messagePreview} 
                      time={timeAgo}
                      initials={initials}
                    />
                  );
                })
              ) : (
                <tr>
                   <td colSpan={5} className="px-6 py-8 text-center text-slate-500 italic">No hot leads tracked yet. Add one in the Directory.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#11151c] border border-[#27373a] w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-6 border-b border-[#27373a] flex items-center justify-between bg-onyx">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan">door_open</span>
                Select Property for Open House Mode
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[60vh]">
              {properties.length > 0 ? properties.map(property => (
                <div 
                  key={property.id}
                  onClick={() => window.open(`/properties/${property.id}/open-house`, "_blank")}
                  className="flex items-center gap-4 bg-onyx-surface p-4 rounded-xl border border-[#27373a] hover:border-cyan cursor-pointer transition-colors group"
                >
                  <div className="size-16 rounded-lg bg-black overflow-hidden shrink-0 border border-[#27373a]">
                    {property.thumbnail_url ? (
                      <img src={property.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <span className="material-symbols-outlined">house</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-cyan transition-colors">{property.address_line1 || "Unnamed Property"}</h3>
                    <p className="text-sm text-slate-400">{property.city}, {property.state}</p>
                  </div>
                  <div className="ml-auto">
                    <span className="material-symbols-outlined text-slate-500 group-hover:text-cyan transition-colors">arrow_forward</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10">
                  <span className="material-symbols-outlined text-4xl text-slate-600 mb-2">house</span>
                  <p className="text-slate-400">No properties found. Add a property to start an Open House.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: string, icon: string, color: string }) {
  return (
    <div className="bg-[#0B0E14] border border-[#27373a] p-5 rounded-2xl flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`size-12 rounded-xl bg-onyx-surface border border-[#27373a] flex items-center justify-center ${color}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{label}</p>
          <p className="text-2xl font-black text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function LeadRow({ id, name, role, status, message, time, initials }: { id: string, name: string, role: string, status: string, message: string, time: string, initials: string }) {
  return (
    <tr className="hover:bg-cyan/[0.02] transition-colors group cursor-pointer">
      <td className="px-6 py-5">
        <Link href={`/contacts/${id}`} className="flex items-center gap-4 group-hover:text-cyan transition-colors">
          <div className="size-10 bg-cyan/10 border border-cyan/30 text-cyan rounded-full flex items-center justify-center font-bold text-sm">
            {initials}
          </div>
          <div>
            <p className="font-bold text-white group-hover:text-cyan transition-colors">{name}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate max-w-[150px]">{role}</p>
          </div>
        </Link>
      </td>
      <td className="px-6 py-5">
        <span className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-500 rounded-full text-[10px] font-black uppercase tracking-widest">
          {status}
        </span>
      </td>
      <td className="px-6 py-5 max-w-[200px]">
        <p className="text-sm text-slate-400 truncate italic">"{message}"</p>
      </td>
      <td className="px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="size-1.5 bg-cyan rounded-full shadow-[0_0_8px_rgba(0,209,255,1)]"></div>
          <span className="text-sm font-bold text-slate-300">{time}</span>
        </div>
      </td>
      <td className="px-6 py-5 text-right">
        <Link href={`/contacts/${id}`} className="inline-flex items-center justify-center size-9 bg-onyx-surface border border-[#27373a] rounded-lg text-slate-500 hover:text-cyan hover:border-cyan/50 transition-all">
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </Link>
      </td>
    </tr>
  );
}
