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

const engagementData = [
  { name: "Day 1", email: 400, sms: 240 },
  { name: "Day 5", email: 300, sms: 139 },
  { name: "Day 10", email: 200, sms: 980 },
  { name: "Day 15", email: 278, sms: 390 },
  { name: "Day 20", email: 189, sms: 480 },
  { name: "Day 25", email: 239, sms: 380 },
  { name: "Day 30", email: 349, sms: 430 },
];

export default function CRMPage() {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 md:px-10 py-10 flex flex-col min-h-screen gap-8 bg-[#0B0E14] text-slate-100 font-sans">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-5xl font-black tracking-tighter mb-2 font-display uppercase italic text-white">
            Loomis <span className="text-cyan">CRM</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium tracking-wide">
            Elite Relationship Engine • Gemini Pro & Twilio Powered
          </p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-[#161B22] border border-[#27373a] text-slate-300 font-bold rounded-xl flex items-center gap-2 hover:bg-[#1C232B] transition-all">
            <span className="material-symbols-outlined text-lg">cloud_upload</span>
            Bulk Import
          </button>
          <Link href="/campaigns/new" className="px-6 py-3 bg-[#161B22] border border-cyan/50 text-cyan font-bold rounded-xl flex items-center gap-2 hover:bg-cyan/10 transition-all shadow-[0_0_15px_rgba(0,209,255,0.1)]">
            <span className="material-symbols-outlined text-lg">campaign</span>
            Launch Campaign
          </Link>
          <Link href="/contacts/new" className="px-8 py-4 bg-cyan text-onyx font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 hover:brightness-110 transition-all shadow-[0_0_30px_rgba(0,209,255,0.4)] hover:-translate-y-1">
            <span className="material-symbols-outlined font-bold">person_add</span>
            New Lead
          </Link>
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
              <AreaChart data={engagementData}>
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
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
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
            <span className="material-symbols-outlined text-orange-500">whatshot</span>
            Hot Lead Index
          </h3>
          <div className="flex-1 flex flex-col gap-4">
            <StatCard label="Total Hot Leads" value="24" icon="group" color="text-cyan" />
            <StatCard label="Response Quality" value="92%" icon="verified" color="text-emerald-500" />
            <StatCard label="Avg. Conversion" value="12d" icon="schedule" color="text-indigo-500" />
          </div>
          <button className="w-full py-4 bg-onyx border border-[#27373a] rounded-xl text-xs font-black uppercase tracking-widest hover:border-cyan hover:text-cyan transition-all">
            View Analytics Report
          </button>
        </div>
      </div>

      {/* Main Hot Leads Table */}
      <div className="bg-[#11151c] border border-[#27373a] rounded-2xl overflow-hidden shadow-2xl flex-1">
        <div className="p-6 border-b border-[#27373a] flex items-center justify-between bg-onyx-surface">
          <h3 className="font-bold text-xl text-white uppercase italic tracking-tighter">Current Hot Leads</h3>
          <div className="relative">
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
              <LeadRow 
                name="Sarah Kendrick" 
                role="Buyer" 
                status="Qualified" 
                message="Is the open house still on?" 
                time="10m ago"
                initials="SK"
              />
              <LeadRow 
                name="Robert Miller" 
                role="Seller" 
                status="Negotiating" 
                message="Thanks for the CMA report." 
                time="1h ago"
                initials="RM"
              />
              <LeadRow 
                name="Julia Huang" 
                role="Investor" 
                status="New" 
                message="We'd like to schedule a call." 
                time="2d ago"
                initials="JH"
              />
            </tbody>
          </table>
        </div>
      </div>
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

function LeadRow({ name, role, status, message, time, initials }: { name: string, role: string, status: string, message: string, time: string, initials: string }) {
  return (
    <tr className="hover:bg-cyan/[0.02] transition-colors group cursor-pointer">
      <td className="px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="size-10 bg-cyan/10 border border-cyan/30 text-cyan rounded-full flex items-center justify-center font-bold text-sm">
            {initials}
          </div>
          <div>
            <p className="font-bold text-white group-hover:text-cyan transition-colors">{name}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{role}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-5">
        <span className="px-3 py-1 bg-onyx-surface border border-[#27373a] rounded-full text-[10px] font-black uppercase tracking-widest text-slate-300">
          {status}
        </span>
      </td>
      <td className="px-6 py-5 max-w-xs">
        <p className="text-sm text-slate-400 truncate italic">"{message}"</p>
      </td>
      <td className="px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="size-1.5 bg-cyan rounded-full animate-pulse shadow-[0_0_8px_rgba(0,209,255,1)]"></div>
          <span className="text-sm font-bold text-slate-300">{time}</span>
        </div>
      </td>
      <td className="px-6 py-5 text-right">
        <button className="size-9 bg-onyx-surface border border-[#27373a] rounded-lg text-slate-500 hover:text-cyan hover:border-cyan/50 transition-all">
          <span className="material-symbols-outlined text-lg">chat</span>
        </button>
      </td>
    </tr>
  );
}
