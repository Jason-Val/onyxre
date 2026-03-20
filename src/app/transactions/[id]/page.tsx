"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useRef } from "react";
import { createClient } from "@/supabase/client";
import { Database } from "@/supabase/database.types";
import { AIStatus } from "@/components/transactions/AIStatus";

type TransactionWithDetails = Database["public"]["Tables"]["transactions"]["Row"] & {
  property: Database["public"]["Tables"]["properties"]["Row"];
  milestones: Database["public"]["Tables"]["transaction_milestones"]["Row"][];
};

export default function TransactionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [tx, setTx] = useState<TransactionWithDetails | null>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Database["public"]["Tables"]["transaction_milestones"]["Row"] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const [activeTab, setActiveTab] = useState<"milestones" | "documents">("milestones");
  const [showDeductionModal, setShowDeductionModal] = useState(false);
  const [newDeduction, setNewDeduction] = useState("");
  const [isUpdatingDeduction, setIsUpdatingDeduction] = useState(false);
  const [isAIActive, setIsAIActive] = useState(false);
  const [isUpdatingAI, setIsUpdatingAI] = useState(false);

  // Requirement: Documents Checklist
  const REQUIRED_DOCS = [
    "Purchase Agreement", "TDS", "SPQ", "MCA",
    "Sq Ft Advisory", "WCMD", "SPT", "AVID - SA",
    "AVID - LA", "FIRPTA", "NHD Sig Pages"
  ];
  const [docs, setDocs] = useState<any[]>([]);
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [isAddingDoc, setIsAddingDoc] = useState(false);

  const handleCancelTransaction = async () => {
    setIsCancelling(true);
    try {
      const { error } = await supabase
        .from("transactions")
        .update({ status: "CANCELLED" as any })
        .eq("id", id as string);

      if (error) throw error;
      router.push("/transactions");
    } catch (err) {
      console.error("Error cancelling transaction:", err);
      alert("Failed to cancel transaction. Please try again.");
    } finally {
      setIsCancelling(false);
      setShowCancelConfirm(false);
    }
  };

  useEffect(() => {
    async function fetchTransaction() {
      try {
        const { data, error } = await supabase
          .from("transactions")
          .select(`
            *,
            property:properties(*),
            milestones:transaction_milestones(*)
          `)
          .eq("id", id as string)
          .single();

        if (error) throw error;
        console.log("Fetched Transaction Data:", data);
        setTx(data as any);
        setNewDeduction(data.agent_deduction?.toString() || "0");
        setIsAIActive(!!data.is_ai_active);

        // Fetch or Initialize Documents
        const { data: existingDocs, error: docsError } = await supabase
          .from("transaction_documents")
          .select("*")
          .eq("transaction_id", id as string)
          .order("sort_order", { ascending: true });

        if (docsError) throw docsError;

        const currentTitles = (existingDocs || []).map(d => d.title);
        const missingDocs = REQUIRED_DOCS.filter(title => !currentTitles.includes(title));

        if (missingDocs.length > 0) {
          const newDocs = missingDocs.map((title, i) => ({
            transaction_id: id as string,
            title,
            status: 'pending' as const,
            sort_order: (existingDocs?.length || 0) + i
          }));

          const { data: seededDocs, error: seedError } = await supabase
            .from("transaction_documents")
            .insert(newDocs)
            .select();

          if (!seedError && seededDocs) {
            setDocs([...(existingDocs || []), ...seededDocs]);
          } else {
            setDocs(existingDocs || []);
          }
        } else {
          setDocs(existingDocs || []);
        }
      } catch (err) {
        console.error("Error fetching transaction:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchTransaction();
  }, [id, supabase]);

  const milestones = useMemo(() => {
    if (!tx) return [];
    return [...tx.milestones].sort((a, b) => a.sort_order - b.sort_order);
  }, [tx]);

  const handleToggleAI = async () => {
    if (!tx || isUpdatingAI) return;
    
    const newState = !isAIActive;
    setIsAIActive(newState);
    setIsUpdatingAI(true);

    try {
      const { error } = await supabase
        .from("transactions")
        .update({ is_ai_active: newState })
        .eq("id", id as string);

      if (error) throw error;
    } catch (err) {
      console.error("Error updating AI status:", err);
      // Revert state on error
      setIsAIActive(!newState);
      alert("Failed to update AI status. Please try again.");
    } finally {
      setIsUpdatingAI(false);
    }
  };

  const completedCount = useMemo(() => {
    return milestones.filter(m => m.status === "completed").length;
  }, [milestones]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan/20 border-t-cyan rounded-full animate-spin" />
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex flex-col items-center justify-center text-slate-400">
        <p className="mb-4">Transaction not found</p>
        <Link href="/transactions" className="text-cyan hover:underline">Back to Hub</Link>
      </div>
    );
  }

  // Financial calculations
  const price = Number(tx.purchase_price) || Number(tx.property.price) || 0;
  const commissionRate = (Number(tx.commission_percentage) || 2.5) / 100;
  const agentDeduction = Number(tx.agent_deduction) || 0;
  const agentSplit = 0.8; // Still a placeholder (80%) - could be fetched from profile/org

  const totalGross = price * commissionRate;
  const toBrokerSplit = totalGross - agentDeduction;
  const pendingCommission = toBrokerSplit * agentSplit;

  const handleUpdateDeduction = async () => {
    setIsUpdatingDeduction(true);
    try {
      const value = parseFloat(newDeduction) || 0;
      const { error } = await supabase
        .from("transactions")
        .update({ agent_deduction: value })
        .eq("id", id as string);

      if (error) throw error;
      if (tx) setTx({ ...tx, agent_deduction: value } as any);
      setShowDeductionModal(false);
    } catch (err) {
      console.error("Error updating deduction:", err);
    } finally {
      setIsUpdatingDeduction(false);
    }
  };

  const handleAddCustomDoc = async () => {
    if (!newDocTitle.trim()) return;
    setIsAddingDoc(true);
    try {
      const { data, error } = await supabase
        .from("transaction_documents")
        .insert({
          transaction_id: id as string,
          title: newDocTitle.trim(),
          status: 'pending',
          sort_order: docs.length
        })
        .select()
        .single();

      if (error) throw error;
      if (data) setDocs(prev => [...prev, data]);
      setNewDocTitle("");
      setShowAddDocModal(false);
    } catch (err) {
      console.error("Error adding document:", err);
      alert("Failed to add document. Please try again.");
    } finally {
      setIsAddingDoc(false);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!confirm("Are you sure you want to remove this document from the checklist?")) return;
    try {
      const { error } = await supabase
        .from("transaction_documents")
        .delete()
        .eq("id", docId);

      if (error) throw error;
      setDocs(prev => prev.filter(d => d.id !== docId));
    } catch (err) {
      console.error("Error deleting document:", err);
      alert("Failed to delete document. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-300 font-sans pb-20">
      <main className="w-full max-w-6xl mx-auto px-8">
        {/* ── HEADER ── */}
        <header className="flex items-center justify-between py-8 border-b border-white/5 sticky top-0 bg-[#0B0E14]/80 backdrop-blur-md z-10 -mx-8 px-8">
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push("/transactions")}
              className="group size-10 flex items-center justify-center bg-white/5 rounded-xl border border-white/10 hover:border-cyan/50 hover:bg-cyan/5 transition-all"
            >
              <span className="material-symbols-outlined text-slate-400 group-hover:text-cyan transition-colors">arrow_back</span>
            </button>
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-white leading-none">Transaction Detail</h2>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">ID: {tx.id.slice(0, 8)}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-cyan/10 rounded-full border border-cyan/20 shadow-[0_0_15px_rgba(0,209,255,0.1)]">
              <span className="material-symbols-outlined text-cyan text-sm animate-pulse">bolt</span>
              <span className="text-[10px] font-black text-cyan uppercase tracking-widest">LIVE SYNC</span>
            </div>

            <div className="h-8 w-px bg-white/5 mx-2" />

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/transactions/new?id=${tx.id}`)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-cyan/50 hover:bg-cyan/5 transition-all text-slate-400 hover:text-cyan"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                Edit
              </button>
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-red-500/50 hover:bg-red-500/5 transition-all text-slate-400 hover:text-red-400"
              >
                <span className="material-symbols-outlined text-sm">cancel</span>
                Cancel
              </button>
            </div>

            <div className="h-8 w-px bg-white/5 mx-2" />

            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end gap-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none">OnyxAI Transaction Coordinator</p>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleToggleAI}
                    disabled={isUpdatingAI}
                    className={`relative w-10 h-5 bg-white/5 rounded-full border border-white/10 p-1 transition-all hover:border-cyan/30 ${isUpdatingAI ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <motion.div 
                      animate={{ x: isAIActive ? 20 : 0 }}
                      className={`size-3 rounded-full shadow-[0_0_10px_rgba(0,209,255,0.4)] ${isAIActive ? 'bg-cyan' : 'bg-slate-600 shadow-none'}`}
                    />
                  </button>
                  <AIStatus isActive={isAIActive} />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="py-10 space-y-10">
          {/* ── FINANCIAL OVERVIEW & SIDE CARD ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 flex flex-col justify-center bg-slate-card rounded-[2.5rem] p-10 border border-white/5 relative overflow-hidden group shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan/5 blur-[80px] pointer-events-none opacity-50" />
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Pending Commission</p>
              <h1 className="text-7xl font-black text-cyan tracking-tighter mb-10">${pendingCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h1>

              <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="size-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
                    <span className="material-symbols-outlined text-red-400">trending_down</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Agent Deductions</p>
                      <button
                        onClick={() => setShowDeductionModal(true)}
                        className="flex items-center gap-1 text-slate-400 bg-white/5 px-2 py-0.5 rounded-lg text-[10px] hover:bg-white/10 transition-colors border border-white/5"
                      >
                        <span className="material-symbols-outlined text-[12px]">edit</span>
                        <span>Adjust</span>
                      </button>
                    </div>
                    <p className="text-xl font-bold text-red-400 mt-1">-${agentDeduction.toLocaleString()}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Commission</p>
                  <p className="text-xl font-bold text-white mt-1">${toBrokerSplit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>

              {/* Transaction Context Badge */}
              <div className="flex items-center gap-4 mt-8 pt-8 border-t border-white/5">
                <div className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest ${tx.representation === 'SELLER'
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                  }`}>
                  {tx.representation || 'Agency'} Representation
                </div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Accepted: {tx.contract_acceptance_date ? new Date(tx.contract_acceptance_date + 'T12:00:00').toLocaleDateString() : 'N/A'}
                </div>
              </div>

              {/* Escrow & Contacts - Moved from side card */}
              <div className="mt-10 pt-10 border-t border-white/5 grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">business</span>
                    Escrow Info
                  </p>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">{tx.escrow_company_name || 'No Company Set'}</p>
                    <p className="text-[10px] text-cyan font-mono uppercase tracking-widest">#{tx.escrow_number || 'N/A'}</p>
                  </div>
                  <div className="space-y-2 pt-2">
                    <p className="text-xs text-slate-400 font-medium">{tx.escrow_officer_name}</p>
                    <p className="text-[10px] text-slate-500">{tx.escrow_officer_email}</p>
                    <p className="text-[10px] text-slate-500">{tx.escrow_officer_phone}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">group</span>
                    Co-Op Agent
                  </p>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">{tx.other_agent_name || 'No Agent Info'}</p>
                    <p className="text-xs text-slate-400 font-medium">{tx.other_agent_email}</p>
                    <p className="text-xs text-slate-400 font-medium">{tx.other_agent_phone}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── SIDE CARD ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-card rounded-[2.5rem] overflow-hidden border border-white/5 flex flex-col shadow-2xl group"
            >
              <div className="h-48 relative overflow-hidden">
                <img
                  src={tx.property.thumbnail_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop"}
                  alt="Property"
                  className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                <span className="absolute top-5 right-5 bg-cyan text-onyx text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(0,209,255,0.4)]">
                  {tx.status}
                </span>
              </div>
              <div className="p-8 flex-1">
                <h3 className="text-2xl font-black text-white tracking-tight mb-2 group-hover:text-cyan transition-colors">{tx.property.address_line1}</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-8">{tx.property.city}, {tx.property.state} {tx.property.zip_code}</p>

                <div className="space-y-6">
                  <div className="flex justify-between items-center group/item">
                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Purchase Price</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white">${price.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center group/item">
                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Commission Rate</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white">{(commissionRate * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── TABS NAVIGATION ── */}
          <div className="flex items-center gap-8 border-b border-white/5 pb-px relative">
            <button
              onClick={() => setActiveTab("milestones")}
              className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === "milestones" ? "text-cyan" : "text-slate-500 hover:text-slate-300"
                }`}
            >
              Escrow Milestones
              {activeTab === "milestones" && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan shadow-[0_0_15px_rgba(0,209,255,1)]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("documents")}
              className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === "documents" ? "text-cyan" : "text-slate-500 hover:text-slate-300"
                }`}
            >
              Documents Checklist
              {activeTab === "documents" && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan shadow-[0_0_15px_rgba(0,209,255,1)]" />
              )}
            </button>
          </div>

          {activeTab === "milestones" ? (
            <motion.div
              key="milestones"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-slate-card rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl"
            >
              <div className="px-10 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                <h3 className="font-black text-lg text-white tracking-tight">Contingency Deadlines</h3>
                <div className="text-xs font-bold uppercase tracking-widest">
                  <span className="text-cyan">{completedCount} of {milestones.length}</span> <span className="text-slate-500 ml-1">Completed</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#1C222B] text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">
                    <tr>
                      <th className="px-10 py-5">Milestone Name</th>
                      <th className="px-10 py-5">Due Date</th>
                      <th className="px-10 py-5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {milestones.map((m) => {
                      const isCompleted = m.status === "completed";
                      const milestoneDate = new Date(m.due_date + 'T12:00:00');
                      const isOverdue = !isCompleted && milestoneDate < new Date();
                      const ObjectTime = new Date().getTime();
                      const daysUntilDue = !isCompleted && !isOverdue
                        ? Math.ceil((milestoneDate.getTime() - ObjectTime) / (1000 * 60 * 60 * 24))
                        : null;
                      const isUpcoming = daysUntilDue !== null && daysUntilDue <= 3;

                      return (
                        <tr key={m.id} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                              <div className={`size-10 rounded-2xl flex items-center justify-center border transition-all ${isCompleted ? 'bg-cyan/10 border-cyan/20 text-cyan' : 'bg-white/5 border-white/10 text-slate-500 group-hover:border-cyan/30 group-hover:text-cyan/70'
                                }`}>
                                <span className="material-symbols-outlined text-xl">
                                  {m.title.toLowerCase().includes('inspection') ? 'fact_check' :
                                    m.title.toLowerCase().includes('emd') ? 'payments' :
                                      m.title.toLowerCase().includes('loan') ? 'account_balance' :
                                        m.title.toLowerCase().includes('closing') ? 'key' : 'description'}
                                </span>
                              </div>
                              <span className={`font-black tracking-tight text-white ${isCompleted ? 'opacity-50 line-through' : ''}`}>
                                {m.title}
                              </span>
                            </div>
                          </td>
                          <td className={`px-10 py-6 text-sm font-mono ${isOverdue ? 'text-red-400 font-bold animate-pulse' : isUpcoming ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                            {milestoneDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-10 py-6 text-right">
                            <button
                              onClick={() => {
                                if (!isCompleted) {
                                  setSelectedMilestone(m);
                                  setIsUploadModalOpen(true);
                                }
                              }}
                              disabled={isCompleted}
                              className={`flex items-center gap-2 ml-auto px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${isCompleted
                                ? 'bg-cyan text-onyx border-transparent shadow-[0_0_15px_rgba(0,209,255,0.3)]'
                                : isOverdue
                                  ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500 hover:text-white'
                                  : isUpcoming
                                    ? 'bg-amber-400/10 text-amber-400 border-amber-400/30 hover:bg-amber-400 hover:text-onyx'
                                    : 'bg-white/5 text-slate-400 border-white/10 hover:border-cyan/50 hover:text-cyan group-hover:bg-cyan/5'
                                }`}
                            >
                              <span className="material-symbols-outlined text-sm">
                                {isCompleted ? 'check_circle' : isOverdue || isUpcoming ? 'priority_high' : 'circle'}
                              </span>
                              {isCompleted ? 'COMPLETED' : isOverdue ? 'CRITICAL' : isUpcoming ? 'DUE SOON' : 'COMPLETE?'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="documents"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-slate-card rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="px-10 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                <div className="flex items-center gap-6">
                  <h3 className="font-black text-lg text-white tracking-tight">Compliance Documents</h3>
                  <button
                    onClick={() => setShowAddDocModal(true)}
                    className="flex items-center gap-2 px-4 py-1.5 bg-cyan/10 border border-cyan/20 rounded-full group hover:bg-cyan/20 transition-all shadow-[0_0_15px_rgba(0,209,255,0.1)]"
                  >
                    <span className="material-symbols-outlined text-cyan text-sm">add</span>
                    <span className="text-[10px] font-black text-cyan uppercase tracking-widest">Add Document</span>
                  </button>
                </div>
                <div className="text-xs font-bold uppercase tracking-widest">
                  <span className="text-cyan">{docs.filter(d => d.status === 'completed').length} of {docs.length}</span> <span className="text-slate-500 ml-1">Uploaded</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#1C222B] text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">
                    <tr>
                      <th className="px-10 py-5">Document Name</th>
                      <th className="px-10 py-5">Updated</th>
                      <th className="px-10 py-5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {docs.map((doc) => {
                      const isCompleted = doc.status === "completed";
                      return (
                        <tr key={doc.id} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                              <div className={`size-10 rounded-2xl flex items-center justify-center border transition-all ${isCompleted ? 'bg-cyan/10 border-cyan/20 text-cyan' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                                <span className="material-symbols-outlined text-xl">description</span>
                              </div>
                              <span className="font-black tracking-tight text-white">{doc.title}</span>
                            </div>
                          </td>
                          <td className="px-10 py-6 text-sm text-slate-400 font-mono">
                            {doc.updated_at ? new Date(doc.updated_at).toLocaleDateString() : 'Pending'}
                          </td>
                          <td className="px-10 py-6 text-right">
                            <div className="flex items-center justify-end gap-3">
                              {isCompleted && (
                                <button
                                  onClick={() => window.open(doc.document_url, '_blank')}
                                  className="size-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-cyan hover:border-cyan/50 transition-all"
                                >
                                  <span className="material-symbols-outlined text-sm">download</span>
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedMilestone({ ...doc, due_date: null } as any);
                                  setIsUploadModalOpen(true);
                                }}
                                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${isCompleted
                                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                                  : 'bg-white/5 text-slate-400 border border-white/10 hover:border-cyan/50 hover:text-cyan'
                                  }`}
                              >
                                <span className="material-symbols-outlined text-sm">
                                  {isCompleted ? 'verified' : 'upload_file'}
                                </span>
                                {isCompleted ? 'UPLOADED' : 'COMPLETE?'}
                              </button>

                              <button
                                onClick={() => handleDeleteDoc(doc.id)}
                                className="size-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-slate-500 hover:text-red-400 hover:border-red-500/50 transition-all"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="p-8 bg-white/[0.01] border-t border-white/5 flex justify-end">
                <button
                  className="flex items-center gap-3 px-8 py-5 bg-white/5 border border-white/10 text-slate-300 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-cyan hover:text-onyx hover:border-transparent hover:shadow-[0_0_20px_rgba(0,209,255,0.3)] transition-all group"
                  onClick={() => alert("Creating Zip archives logic will be added next.")}
                >
                  <span className="material-symbols-outlined text-sm group-hover:animate-bounce">archive</span>
                  Download All (.ZIP)
                </button>
              </div>
            </motion.div>
          )}

          {/* ── FOOTER ACTIONS ── */}
          <div className="flex items-center justify-between p-10 bg-slate-card rounded-[2.5rem] border border-white/5 shadow-2xl">
            <div className="flex items-center gap-5">
              <div className="size-12 bg-amber-400/10 rounded-2xl flex items-center justify-center border border-amber-400/20">
                <span className="material-symbols-outlined text-amber-400">warning</span>
              </div>
              <p className="text-sm text-slate-500 max-w-md font-medium">
                All contingencies must be marked as <span className="text-white font-bold">COMPLETED</span> before the "Close Transaction" protocol can be initialized for final payout.
              </p>
            </div>
            <button
              disabled={completedCount < milestones.length}
              className={`px-12 py-5 rounded-2xl font-black text-sm tracking-[0.2em] uppercase transition-all border ${completedCount === milestones.length
                ? 'bg-cyan text-onyx border-transparent shadow-[0_0_30px_rgba(0,209,255,0.3)] hover:scale-105 active:scale-95'
                : 'bg-white/5 text-slate-500 border-white/5 cursor-not-allowed grayscale'
                }`}
            >
              Initialize Closing
            </button>
          </div>
        </div>

        {/* ── UPLOAD MODAL ── */}
        {isUploadModalOpen && selectedMilestone && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-card w-full max-w-md rounded-[2rem] border border-white/10 p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-white tracking-tight">Complete Milestone</h3>
                <button
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setSelectedMilestone(null);
                  }}
                  className="text-slate-500 hover:text-white transition-colors"
                  disabled={uploading}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <p className="text-sm text-slate-400 mb-6">
                Upload the required document to mark <span className="text-white font-bold">"{selectedMilestone?.title}"</span> as complete.
              </p>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectedFile(file);
                }}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer group mb-6 ${selectedFile
                    ? 'border-cyan bg-cyan/5'
                    : 'border-white/10 hover:border-cyan/50 hover:bg-cyan/5'
                  }`}
              >
                <div className={`size-16 rounded-full flex items-center justify-center mb-4 transition-colors ${selectedFile ? 'bg-cyan text-onyx' : 'bg-white/5 text-slate-500 group-hover:bg-cyan/10 group-hover:text-cyan'
                  }`}>
                  <span className="material-symbols-outlined text-3xl">
                    {selectedFile ? 'check_circle' : 'cloud_upload'}
                  </span>
                </div>
                {selectedFile ? (
                  <>
                    <p className="font-bold text-white mb-1">{selectedFile?.name}</p>
                    <p className="text-xs text-cyan">Ready to upload • {((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB</p>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-white mb-1">Click to browse or drag file here</p>
                    <p className="text-xs text-slate-500">PDF, JPG, or PNG (Max 10MB)</p>
                  </>
                )}
              </div>

              <button
                onClick={async () => {
                  if (!selectedFile || !selectedMilestone) return;
                  setUploading(true);

                  try {
                    const fileExt = selectedFile?.name.split('.').pop();
                    const fileName = `${selectedMilestone?.id}/${Date.now()}.${fileExt}`;
                    const filePath = `${fileName}`;

                    const { error: uploadError, data: uploadData } = await supabase.storage
                      .from('transaction-documents')
                      .upload(filePath, selectedFile);

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                      .from('transaction-documents')
                      .getPublicUrl(filePath);

                    // Discriminate between Milestone and Document
                    const isDocChecklist = !('due_date' in selectedMilestone);
                    const tableName = isDocChecklist ? "transaction_documents" : "transaction_milestones";

                    const { error: updateError } = await supabase
                      .from(tableName as any)
                      .update({
                        status: 'completed',
                        document_url: publicUrl,
                        updated_at: new Date().toISOString()
                      } as any)
                      .eq('id', selectedMilestone.id);

                    if (updateError) throw updateError;

                    if (isDocChecklist) {
                      const selId = (selectedMilestone as any).id;
                      setDocs(prev => prev.map(d => d.id === selId ? { ...d, status: 'completed', document_url: publicUrl, updated_at: new Date().toISOString() } : d));
                    } else if (tx) {
                      const selId = (selectedMilestone as any).id;
                      const updatedMilestones = tx.milestones.map(m =>
                        m.id === selId ? { ...m, status: 'completed' as const, document_url: publicUrl } : m
                      );
                      setTx({ ...tx, milestones: updatedMilestones as any });
                    }

                    setIsUploadModalOpen(false);
                    setSelectedMilestone(null);
                    setSelectedFile(null);
                  } catch (err) {
                    console.error("Upload failed:", err);
                    alert("Upload failed. Please try again.");
                  } finally {
                    setUploading(false);
                  }
                }}
                disabled={uploading || !selectedFile}
                className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${uploading || !selectedFile
                    ? 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                    : 'bg-cyan text-onyx shadow-[0_0_20px_rgba(0,209,255,0.3)] hover:brightness-110 active:scale-95'
                  }`}
              >
                {uploading ? 'Uploading...' : 'Confirm Completion'}
              </button>
            </motion.div>
          </div>
        )}

        {/* ── CANCEL CONFIRMATION MODAL ── */}
        {showCancelConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-card w-full max-w-sm rounded-[2rem] border border-white/10 p-8 shadow-2xl text-center"
            >
              <div className="size-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 mx-auto mb-6">
                <span className="material-symbols-outlined text-red-500 text-4xl">warning</span>
              </div>

              <h3 className="text-xl font-black text-white tracking-tight mb-2">Cancel Transaction?</h3>
              <p className="text-sm text-slate-400 mb-8">
                This will archive the transaction as <span className="text-white font-bold">CANCELLED</span>. This action cannot be undone.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleCancelTransaction}
                  disabled={isCancelling}
                  className="w-full py-4 bg-red-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isCancelling ? 'Cancelling...' : 'Yes, Cancel Transaction'}
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={isCancelling}
                  className="w-full py-4 bg-white/5 text-slate-400 rounded-xl font-black text-xs uppercase tracking-widest border border-white/5 hover:bg-white/10 transition-all"
                >
                  Go Back
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ── DEDUCTION ADJUSTMENT MODAL ── */}
        {showDeductionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-card w-full max-w-sm rounded-[2rem] border border-white/10 p-8 shadow-2xl"
            >
              <h3 className="text-xl font-black text-white tracking-tight mb-2">Adjust Deductions</h3>
              <p className="text-sm text-slate-400 mb-6">Enter the amount to be deducted from the gross commission.</p>

              <div className="space-y-4 mb-8">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                  <input
                    type="number"
                    value={newDeduction}
                    onChange={(e) => setNewDeduction(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-10 pr-4 text-white outline-none focus:border-cyan transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleUpdateDeduction}
                  disabled={isUpdatingDeduction}
                  className="w-full py-4 bg-cyan text-onyx rounded-xl font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isUpdatingDeduction ? 'Updating...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setShowDeductionModal(false)}
                  disabled={isUpdatingDeduction}
                  className="w-full py-4 bg-white/5 text-slate-400 rounded-xl font-black text-xs uppercase tracking-widest border border-white/5 hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ── ADD CUSTOM DOCUMENT MODAL ── */}
        {showAddDocModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-card w-full max-w-sm rounded-[2rem] border border-white/10 p-8 shadow-2xl"
            >
              <h3 className="text-xl font-black text-white tracking-tight mb-2">Add Document</h3>
              <p className="text-sm text-slate-400 mb-6">Enter a name for the new checklist item.</p>

              <div className="space-y-4 mb-8">
                <input
                  type="text"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-white outline-none focus:border-cyan transition-all"
                  placeholder="e.g. Lead Paint Disclosure"
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleAddCustomDoc}
                  disabled={isAddingDoc || !newDocTitle.trim()}
                  className="w-full py-4 bg-cyan text-onyx rounded-xl font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isAddingDoc ? 'Adding...' : 'Add to Checklist'}
                </button>
                <button
                  onClick={() => setShowAddDocModal(false)}
                  disabled={isAddingDoc}
                  className="w-full py-4 bg-white/5 text-slate-400 rounded-xl font-black text-xs uppercase tracking-widest border border-white/5 hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
