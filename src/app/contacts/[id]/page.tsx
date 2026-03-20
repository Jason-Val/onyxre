"use client";

import { motion } from "framer-motion";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

const commStats = [
  { name: "Week 1", sent: 4, opened: 3 },
  { name: "Week 2", sent: 12, opened: 8 },
  { name: "Week 3", sent: 8, opened: 7 },
  { name: "Week 4", sent: 15, opened: 12 },
];

export default function ContactDossierPage() {
  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 md:px-10 py-10 flex flex-col gap-8 bg-[#0B0E14] text-slate-100 min-h-screen">
      <header className="flex items-center justify-between border-b border-[#27373a] pb-8">
        <div className="flex items-center gap-6">
          <div className="size-20 bg-cyan/10 border-2 border-cyan/30 text-cyan rounded-full flex items-center justify-center text-3xl font-black shadow-[0_0_30px_rgba(0,209,255,0.2)]">
            SK
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Sarah Kendrick</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-cyan text-xs font-black uppercase tracking-widest bg-cyan/10 px-3 py-1 rounded-full border border-cyan/20">Hot Buyer</span>
              <span className="text-slate-500 text-xs font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">location_on</span> San Francisco, CA
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-[#161B22] border border-[#27373a] text-slate-300 font-bold rounded-xl hover:bg-[#1C232B] transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">edit</span> Edit
          </button>
          <button className="px-8 py-3 bg-cyan text-onyx font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(0,209,255,0.3)] hover:brightness-110 transition-all flex items-center gap-2">
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
              <DossierItem label="Emails Sent" value="42" icon="mail" />
              <DossierItem label="Texts Delivered" value="18" icon="sms" />
              <DossierItem label="Avg. Open Rate" value="84%" icon="visibility" />
              <DossierItem label="Calls Logged" value="5" icon="call" />
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

            <TimelineEvent 
              type="Email"
              title="Welcome Package Sent"
              content="Hi Sarah! Here's the list of exclusive properties I mentioned..."
              time="2h ago"
              status="Opened"
              statusColor="bg-cyan"
            />
            <TimelineEvent 
              type="SMS"
              title="CMA Follow-up"
              content="Just sent your property evaluation to your inbox!"
              time="1d ago"
              status="Read"
              statusColor="bg-emerald-500"
            />
            <TimelineEvent 
              type="Email"
              title="Greeting & Intro"
              content="Great meeting you at the open house today..."
              time="3d ago"
              status="Delivered"
              statusColor="bg-indigo-500"
            />
          </div>
        </div>
      </div>
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

function TimelineEvent({ type, title, content, time, status, statusColor }: { type: string, title: string, content: string, time: string, status: string, statusColor: string }) {
  return (
    <div className="flex items-start gap-8 relative z-10 group">
      <div className={`mt-1 size-12 rounded-full border-2 border-[#27373a] bg-onyx flex items-center justify-center shrink-0 group-hover:border-cyan transition-all`}>
        <span className="material-symbols-outlined text-slate-400 group-hover:text-cyan">
          {type === 'Email' ? 'mail' : 'sms'}
        </span>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-black text-white uppercase tracking-tight">{title}</h4>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{time}</span>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed mb-4 border-l-2 border-[#27373a] pl-4 py-1 italic">
          "{content}"
        </p>
        <div className="flex items-center gap-2">
          <div className={`size-2 rounded-full ${statusColor} shadow-[0_0_8px_rgba(0,0,0,0.5)]`}></div>
          <span className={`text-[9px] font-black uppercase tracking-widest ${statusColor.replace('bg-', 'text-')}`}>
            {status}
          </span>
        </div>
      </div>
    </div>
  );
}
