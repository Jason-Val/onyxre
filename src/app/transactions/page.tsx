"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { AIStatus } from "@/components/transactions/AIStatus";
import { createClient } from "@/supabase/client";
import { Database } from "@/supabase/database.types";

type TransactionWithDetails = Database["public"]["Tables"]["transactions"]["Row"] & {
  property: Database["public"]["Tables"]["properties"]["Row"];
  milestones: Database["public"]["Tables"]["transaction_milestones"]["Row"][];
};

const TEST_AGENT_ID = "926ff51e-c856-4388-b57f-e5ca586d1cad";

export default function TransactionManagerPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TransactionWithDetails[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: txs, error } = await supabase
          .from("transactions")
          .select(`
            *,
            property:properties(*),
            milestones:transaction_milestones(*)
          `)
          .eq("agent_id", TEST_AGENT_ID)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setData((txs || []) as any);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [supabase]);

  // Calculations
  const stats = useMemo(() => {
    const closed = data.filter(t => t.status === "CLOSED");
    const pending = data.filter(t => t.status === "ESCROW" || t.status === "OPEN");
    
    const lifetimeVolume = closed.reduce((sum, t) => sum + (Number(t.property.price) || 0), 0);
    const ytdVolume = closed
      .filter(t => new Date(t.created_at).getFullYear() === new Date().getFullYear())
      .reduce((sum, t) => sum + (Number(t.property.price) || 0), 0);

    // Find next closing
    let minDays: number | null = null;
    pending.forEach(t => {
      const closing = t.milestones.find(m => m.title.toLowerCase() === "closing date");
      if (closing) {
        const diff = Math.ceil((new Date(closing.due_date + 'T12:00:00').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && (minDays === null || diff < minDays)) {
          minDays = diff;
        }
      }
    });

    return {
      lifetimeVolume,
      ytdVolume,
      pendingCount: pending.length,
      daysToNextClosing: minDays
    };
  }, [data]);

  const criticalDeadlines = useMemo(() => {
    return data
      .flatMap(t => t.milestones.map(m => ({ ...m, property: t.property })))
      .filter(m => m.status !== "completed")
      .sort((a, b) => new Date(a.due_date + 'T12:00:00').getTime() - new Date(b.due_date + 'T12:00:00').getTime())
      .slice(0, 5);
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan/20 border-t-cyan rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-300 font-sans pb-20">
      <main className="w-full max-w-[1200px] mx-auto flex flex-col items-center">
        {/* ── HEADER ── */}
        <header className="w-full flex justify-between items-center px-8 py-10" data-purpose="main-header">
          <div className="flex items-end gap-12">
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-white tracking-tight font-display">Transaction Hub</h1>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-[0.2em]">Real-time portfolio management</p>
            </div>
            
            <Link 
              href="/transactions/new"
              className="flex items-center gap-3 bg-cyan text-onyx px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,209,255,0.3)] mb-0.5"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              New Transaction
            </Link>
          </div>
          <AIStatus />
        </header>

        {/* ── DASHBOARD CONTAINER ── */}
        <div className="w-full px-8 py-4 flex flex-col gap-16">

          {/* CASHFLOW READOUT */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryCard
              title="Closed Volume"
              value={`$${(stats.lifetimeVolume / 1000000).toFixed(1)}M`}
              trend="Lifetime Transactions"
              trendColor="emerald"
            />
            <SummaryCard
              title="Closed YTD"
              value={`$${(stats.ytdVolume / 1000000).toFixed(1)}M`}
              trend="Current Year pacing"
              trendColor="cyan"
            />
            <SummaryCard
              title="Active (Pending)"
              value={`${stats.pendingCount} Properties`}
              trend={stats.daysToNextClosing !== null ? `${stats.daysToNextClosing} days to next closing` : "No upcoming closings"}
              trendColor="slate"
              isProjectCount
            />
          </section>

          {/* ACTIVE TRANSACTIONS GALLERY */}
          <section>
            <div className="flex justify-between items-end mb-8">
              <h2 className="text-xl font-black text-white tracking-tight">Active Transactions</h2>
              <button className="text-cyan text-[10px] font-black uppercase tracking-widest hover:brightness-125 transition-all">View All Portfolio</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {data.filter(t => t.status !== "CLOSED").map((t, idx) => {
                const closing = t.milestones.find(m => m.title.toLowerCase() === "closing date");
                const daysLeft = closing ? Math.ceil((new Date(closing.due_date + 'T12:00:00').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
                
                return (
                  <PropertyCard
                    key={t.id}
                    id={t.id}
                    address={t.property.address_line1 || "Unnamed Property"}
                    city={`${t.property.city}, ${t.property.state}`}
                    price={`$${(Number(t.property.price) / 1000000).toFixed(1)}M`}
                    status={t.status === "ESCROW" ? (daysLeft !== null ? `${daysLeft} Days to Close` : "Escrow") : "Pending"}
                    image={t.property.thumbnail_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop"}
                    isSecondary={idx % 2 !== 0}
                  />
                );
              })}
              {data.filter(t => t.status !== "CLOSED").length === 0 && (
                <div className="col-span-full py-12 text-center bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No active transactions found</p>
                </div>
              )}
            </div>
          </section>

          {/* CRITICAL DEADLINES */}
          <section className="mb-12">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-xl font-black text-white tracking-tight">Critical Deadlines</h2>
              <span className="bg-red-500/10 text-red-500 text-[10px] font-black px-3 py-1 rounded-full border border-red-500/20 uppercase tracking-widest">3 Action Items</span>
            </div>
            <div className="overflow-hidden rounded-3xl border border-white/5 bg-[#161B22]/40 backdrop-blur-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                    <th className="px-8 py-5">Property</th>
                    <th className="px-8 py-5">Deadline Type</th>
                    <th className="px-8 py-5">Date</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {criticalDeadlines.map((m) => {
                    const milestoneDate = new Date(m.due_date + 'T12:00:00');
                    const isOverdue = milestoneDate < new Date();
                    return (
                      <DeadlineRow
                        key={m.id}
                        id={m.transaction_id}
                        property={m.property.address_line1 || "Unnamed"}
                        type={m.title}
                        date={milestoneDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        status={isOverdue ? "Overdue" : m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                        statusColor={isOverdue ? "red" : m.status === 'active' ? 'orange' : 'emerald'}
                        isCritical={isOverdue}
                      />
                    );
                  })}
                  {criticalDeadlines.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-12 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">No pending deadlines</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function SummaryCard({ title, value, trend, trendColor, isProjectCount }: { title: string, value: string, trend: string, trendColor: string, isProjectCount?: boolean }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-[#161B22] p-8 rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all relative overflow-hidden group shadow-2xl"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] blur-[40px] pointer-events-none group-hover:bg-cyan/5 transition-colors" />
      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">{title}</p>
      <h3 className="text-4xl font-black text-white tracking-tighter mb-4">{value}</h3>
      <div className={`flex items-center text-[10px] font-bold tracking-widest uppercase ${trendColor === 'emerald' ? 'text-emerald-400' :
        trendColor === 'cyan' ? 'text-cyan' : 'text-slate-500'
        }`}>
        {!isProjectCount && (
          <span className="material-symbols-outlined text-[16px] mr-1.5">trending_up</span>
        )}
        {isProjectCount && (
          <span className="material-symbols-outlined text-[16px] mr-1.5 text-cyan animate-pulse">schedule</span>
        )}
        {trend}
      </div>
    </motion.div>
  );
}

function PropertyCard({ id, address, city, price, status, image, isSecondary }: { id: string, address: string, city: string, price: string, status: string, image: string, isSecondary?: boolean }) {
  return (
    <Link href={`/transactions/${id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="group cursor-pointer"
      >
        <div className="relative overflow-hidden rounded-[2rem] aspect-[4/3] mb-5 border border-white/5">
          <img
            alt={address}
            className="object-cover w-full h-full grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
            src={image}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
          <span className={`absolute top-4 left-4 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border backdrop-blur-md transition-all group-hover:scale-105 ${isSecondary
            ? 'bg-white/5 border-white/10 text-white'
            : 'bg-cyan/10 border-cyan/30 text-cyan shadow-[0_0_20px_rgba(0,209,255,0.2)]'
            }`}>
            {status}
          </span>
        </div>
        <h4 className="text-white font-black tracking-tight text-lg mb-1 group-hover:text-cyan transition-colors">{address}</h4>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
          {city} <span className="mx-2 opacity-20">•</span> <span className="text-white/60">{price}</span>
        </p>
      </motion.div>
    </Link>
  );
}

function DeadlineRow({ id, property, type, date, status, statusColor, isCritical, isClosed }: { id: string, property: string, type: string, date: string, status: string, statusColor: string, isCritical?: boolean, isClosed?: boolean }) {
  const colorClass =
    statusColor === 'orange' ? 'text-orange-400' :
      statusColor === 'red' ? 'text-red-500' : 'text-emerald-400';

  const bgColorClass =
    statusColor === 'orange' ? 'bg-orange-400' :
      statusColor === 'red' ? 'bg-red-500' : 'bg-emerald-400';

  return (
    <tr className="hover:bg-white/[0.02] transition-colors group">
      <td className="px-8 py-6 font-black text-white text-base tracking-tight">{property}</td>
      <td className="px-8 py-6 text-slate-400 font-medium">{type}</td>
      <td className="px-8 py-6 text-slate-500 font-mono text-xs">{date}</td>
      <td className="px-8 py-6">
        <span className={`flex items-center text-[10px] font-black uppercase tracking-widest ${colorClass} ${isCritical ? 'animate-pulse' : ''}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${bgColorClass} mr-2 shadow-[0_0_10px_rgba(currentcolor,0.5)]`}></span>
          {status}
        </span>
      </td>
      <td className="px-8 py-6 text-right">
        {isClosed ? (
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/10">Archive Closed</span>
        ) : (
          <Link href={`/transactions/${id}`}>
            <button className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isCritical
              ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:brightness-110 active:scale-95'
              : 'text-cyan hover:text-white border border-cyan/20 hover:border-cyan hover:bg-cyan/10'
              }`}>
              {isCritical ? 'Resolve Now' : 'Review Docs'}
            </button>
          </Link>
        )}
      </td>
    </tr>
  );
}
