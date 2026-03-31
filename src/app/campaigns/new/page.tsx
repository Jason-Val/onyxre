"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from '@/supabase/client';
import { useRouter } from 'next/navigation';

// Note: mockProperties has been removed to switch to dynamic fetching

export default function LaunchCampaignPage() {
  const [campaignType, setCampaignType] = useState<string | null>(null);
  const [targetAudience, setTargetAudience] = useState("All Hot Leads");
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['email']);
  const [a2pStatus, setA2pStatus] = useState<string | null>(null);

  // Modal States
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isNurtureModalOpen, setIsNurtureModalOpen] = useState(false);
  
  // Selection States
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [propertyCampaignSubtype, setPropertyCampaignSubtype] = useState<string | null>(null);
  const [nurtureSubtype, setNurtureSubtype] = useState<string | null>(null);

  const [priceReductionAmount, setPriceReductionAmount] = useState("");
  const [buyerMatchMessage, setBuyerMatchMessage] = useState("");

  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);

  const [properties, setProperties] = useState<any[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [contactsResponse, propertiesResponse, profileRes] = await Promise.all([
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('properties').select('*').eq('agent_id', user.id).order('created_at', { ascending: false }),
        supabase.from('profiles').select('organization_id').eq('id', user.id).single()
      ]);

      if (contactsResponse.data) setContacts(contactsResponse.data);
      if (propertiesResponse.data) setProperties(propertiesResponse.data);
      if (profileRes.data?.organization_id) {
        const orgRes = await supabase.from('organizations').select('a2p_status').eq('id', profileRes.data.organization_id).single();
        if (orgRes.data?.a2p_status) {
          setA2pStatus(orgRes.data.a2p_status);
        }
      }
      
      setIsLoadingContacts(false);
      setIsLoadingProperties(false);
    }
    loadData();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    let contactIds: string[] = [];
    
    if (targetAudience === "All Hot Leads") {
      contactIds = contacts.filter(l => l.heat_index === "HOT").map(l => l.id);
    } else if (targetAudience.startsWith("Role:")) {
      const roleMatch = targetAudience.split("Role: ")[1]?.toUpperCase();
      contactIds = contacts.filter(l => l.role?.toUpperCase() === roleMatch || l.type?.toUpperCase() === roleMatch).map(l => l.id);
    } else {
      contactIds = selectedLeads;
    }

    if (contactIds.length === 0) {
      alert("No contacts found matching your criteria.");
      setIsGenerating(false);
      return;
    }

    try {
      // Pass the extra properties for our new templates
      const res = await fetch('/api/ai/generate-campaign', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          campaignType, 
          targetAudience, 
          leadIds: contactIds,
          priceReductionAmount,
          buyerMatchMessage,
          propertyId: selectedProperty,
          propertyCampaignSubtype,
          channels: selectedChannels
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Campaign queued! We scheduled ${data.touchpointsCount || "your"} emails.`);
        router.push('/crm');
      } else {
        alert(data.error || "Failed to launch campaign");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to launch campaign");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleChannel = (channel: string) => {
    setSelectedChannels(prev => {
      if (prev.includes(channel)) {
        if (prev.length === 1) return prev; // Prevent unselecting all
        return prev.filter(c => c !== channel);
      }
      return [...prev, channel];
    });
  };

  const filteredContacts = contacts.filter(l => 
    (l.first_name + " " + (l.last_name || "")).toLowerCase().includes(searchQuery.toLowerCase()) || 
    (l.role || l.type || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 md:px-10 py-10 space-y-10 pb-20 text-slate-100 bg-[#0B0E14] min-h-screen relative font-sans">
      <header className="flex flex-col gap-2 border-b border-[#27373a] pb-6">
        <Link href="/crm" className="text-cyan text-sm flex items-center gap-1 hover:underline w-fit mb-4">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to CRM
        </Link>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white flex items-center gap-3 font-display">
          <span className="material-symbols-outlined text-cyan text-4xl">campaign</span> Launch Campaign
        </h1>
        <p className="text-slate-400 text-sm font-medium">Deploy an AI-powered campaign to your CRM contacts.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Campaign Type */}
          <section className="bg-[#11151c] border border-[#27373a] rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-6 text-white tracking-widest uppercase text-sm border-b border-[#27373a] pb-3">1. Select Campaign Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => setIsPropertyModalOpen(true)}
                className={`p-5 rounded-xl border text-left flex flex-col gap-2 transition-all ${campaignType?.startsWith("Property") ? "bg-cyan/10 border-cyan text-white shadow-[0_0_15px_rgba(0,209,255,0.15)]" : "bg-[#161B22] border-[#27373a] text-slate-400 hover:border-cyan/50"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="material-symbols-outlined text-2xl">real_estate_agent</span>
                  {campaignType?.startsWith("Property") && <span className="material-symbols-outlined text-cyan">check_circle</span>}
                </div>
                <span className="font-bold text-lg">Property Marketing</span>
                <span className="text-xs">Promote a new listing, open house, or price reduction.</span>
              </button>
              
              <button 
                onClick={() => setIsNurtureModalOpen(true)}
                className={`p-5 rounded-xl border text-left flex flex-col gap-2 transition-all ${campaignType?.startsWith("Nurture") ? "bg-indigo-500/10 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)]" : "bg-[#161B22] border-[#27373a] text-slate-400 hover:border-indigo-500/50"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="material-symbols-outlined text-2xl">psychology</span>
                  {campaignType?.startsWith("Nurture") && <span className="material-symbols-outlined text-indigo-400">check_circle</span>}
                </div>
                <span className="font-bold text-lg">AI Nurture Sequence</span>
                <span className="text-xs">Automated long-term follow-up based on Heat Index.</span>
              </button>
            </div>
          </section>

          {/* Target Audience */}
          <section className="bg-[#11151c] border border-[#27373a] rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-6 text-white tracking-widest uppercase text-sm border-b border-[#27373a] pb-3">2. Target Audience</h2>
            <div className="space-y-4">
              
              {/* All Hot Leads */}
              <label 
                onClick={() => setTargetAudience("All Hot Leads")}
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${targetAudience === "All Hot Leads" ? "bg-cyan/5 border-cyan shadow-[0_0_10px_rgba(0,209,255,0.1)]" : "bg-[#161B22] border-[#27373a] hover:border-slate-600"}`}
              >
                <div className={`size-5 shrink-0 rounded-full border-2 flex items-center justify-center ${targetAudience === "All Hot Leads" ? "border-cyan" : "border-slate-500"}`}>
                  {targetAudience === "All Hot Leads" && <div className="size-2.5 bg-cyan rounded-full"></div>}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-200">All Hot Leads</p>
                  <p className="text-xs text-slate-500">Target all contacts with a HOT heat index</p>
                </div>
              </label>

              {/* Specific Role */}
              <label 
                onClick={() => setIsRoleModalOpen(true)}
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${targetAudience.startsWith("Role:") ? "bg-cyan/5 border-cyan shadow-[0_0_10px_rgba(0,209,255,0.1)]" : "bg-[#161B22] border-[#27373a] hover:border-cyan/30"}`}
              >
                <div className={`size-5 shrink-0 rounded-full border-2 flex items-center justify-center ${targetAudience.startsWith("Role:") ? "border-cyan" : "border-slate-500"}`}>
                  {targetAudience.startsWith("Role:") && <div className="size-2.5 bg-cyan rounded-full"></div>}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-200">Specific Role {selectedRole && <span className="text-cyan font-black ml-2 uppercase tracking-widest text-[10px] bg-cyan/10 px-2 py-0.5 rounded border border-cyan/20">{selectedRole}</span>}</p>
                  <p className="text-xs text-slate-500">e.g., Buyers, Sellers, Agents</p>
                </div>
                <span className="material-symbols-outlined text-slate-500 group-hover:text-white">chevron_right</span>
              </label>

              {/* Specific Leads */}
              <label 
                onClick={() => setIsLeadModalOpen(true)}
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${targetAudience.includes("Specific Leads") ? "bg-cyan/5 border-cyan shadow-[0_0_10px_rgba(0,209,255,0.1)]" : "bg-[#161B22] border-[#27373a] hover:border-cyan/30"}`}
              >
                <div className={`size-5 shrink-0 rounded-full border-2 flex items-center justify-center ${targetAudience.includes("Specific Leads") ? "border-cyan" : "border-slate-500"}`}>
                  {targetAudience.includes("Specific Leads") && <div className="size-2.5 bg-cyan rounded-full"></div>}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-200">Specific Leads {selectedLeads.length > 0 && <span className="text-cyan font-black ml-2 uppercase tracking-widest text-[10px] bg-cyan/10 px-2 py-0.5 rounded border border-cyan/20">{selectedLeads.length} Selected</span>}</p>
                  <p className="text-xs text-slate-500">Hand-pick individual contacts</p>
                </div>
                <span className="material-symbols-outlined text-slate-500 group-hover:text-white">chevron_right</span>
              </label>

            </div>
          </section>

          {/* Delivery Channel */}
          <section className="bg-[#11151c] border border-[#27373a] rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-6 text-white tracking-widest uppercase text-sm border-b border-[#27373a] pb-3">3. Delivery Channel</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Email Toggle */}
              <button 
                onClick={() => toggleChannel('email')}
                className={`p-5 rounded-xl border text-left flex flex-col gap-2 transition-all ${selectedChannels.includes('email') ? "bg-cyan/10 border-cyan text-white shadow-[0_0_15px_rgba(0,209,255,0.15)]" : "bg-[#161B22] border-[#27373a] text-slate-400 hover:border-cyan/50"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="material-symbols-outlined text-2xl text-cyan">mail</span>
                  {selectedChannels.includes("email") && <span className="material-symbols-outlined text-cyan">check_circle</span>}
                </div>
                <span className="font-bold text-lg">Email </span>
                <span className="text-xs">Deliver via HTML template</span>
              </button>

              {/* SMS Toggle */}
              <div className="relative group flex flex-col">
                <button 
                  disabled={a2pStatus !== 'APPROVED'}
                  onClick={() => toggleChannel('sms')}
                  className={`flex-1 p-5 rounded-xl border text-left flex flex-col gap-2 transition-all ${a2pStatus !== 'APPROVED' ? "opacity-30 cursor-not-allowed bg-[#161B22] border-[#27373a]" : selectedChannels.includes('sms') ? "bg-indigo-500/10 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)]" : "bg-[#161B22] border-[#27373a] text-slate-400 hover:border-indigo-500/50"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="material-symbols-outlined text-2xl text-indigo-400">sms</span>
                    {selectedChannels.includes("sms") && <span className="material-symbols-outlined text-indigo-400">check_circle</span>}
                  </div>
                  <span className="font-bold text-lg">Text Message</span>
                  <span className="text-xs">Deliver via SMS</span>
                </button>
                {a2pStatus !== 'APPROVED' && (
                  <div className="absolute -top-[52px] left-1/2 -translate-x-1/2 bg-slate-800 text-slate-200 text-xs p-2.5 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap pointer-events-none z-10 font-bold border border-slate-700 shadow-xl">
                    To send text messages, complete your A2P registration in Settings.
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45 border-b border-r border-slate-700"></div>
                  </div>
                )}
              </div>

            </div>
          </section>

        </div>

        {/* Summary Sidebar */}
        <div className="bg-[#11151c] border border-[#27373a] rounded-2xl p-6 shadow-2xl h-fit sticky top-10 flex flex-col gap-6">
          <h3 className="font-bold text-lg text-white tracking-widest uppercase border-b border-[#27373a] pb-3">Campaign Summary</h3>
          
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center border-b border-[#27373a]/50 pb-2">
              <span className="text-slate-500">Type</span>
              <span className="font-bold text-cyan text-right max-w-[150px] truncate" title={campaignType || "Not Selected"}>{campaignType || "Not Selected"}</span>
            </div>
            <div className="flex justify-between items-center border-b border-[#27373a]/50 pb-2">
              <span className="text-slate-500">Audience</span>
              <span className="font-bold text-white text-right max-w-[150px] truncate" title={targetAudience}>{targetAudience}</span>
            </div>
            <div className="flex justify-between items-center border-b border-[#27373a]/50 pb-2">
              <span className="text-slate-500">Channel</span>
              <span className="font-bold text-white flex items-center gap-2">
                {selectedChannels.includes('email') && <span className="material-symbols-outlined text-[16px] text-cyan" title="Email">mail</span>}
                {selectedChannels.includes('sms') && <span className="material-symbols-outlined text-[16px] text-indigo-500" title="Text Message">sms</span>}
              </span>
            </div>
          </div>

          <button 
            disabled={!campaignType || isGenerating}
            onClick={handleGenerate}
            className="w-full py-4 bg-cyan text-[#0B0E14] font-black uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,209,255,0.3)] hover:-translate-y-1 flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:-translate-y-0 disabled:hover:brightness-100"
          >
            {isGenerating ? (
              <span className="material-symbols-outlined animate-spin">sync</span>
            ) : (
              <span className="material-symbols-outlined">
                {campaignType?.startsWith("Property") ? "send" : "rocket_launch"}
              </span>
            )}
            {isGenerating ? (campaignType?.startsWith("Property") ? "Sending..." : "Generating...") : (campaignType?.startsWith("Property") ? "Send Email Blast" : "Generate Campaign")}
          </button>
          <p className="text-center text-[10px] text-slate-500 mt-2 flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[12px]">auto_awesome</span> Powered by Gemini Pro
          </p>
        </div>

      </div>

      {/* Property Modal */}
      <AnimatePresence>
        {isPropertyModalOpen && (
          <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
               className="bg-[#0B0E14] border border-[#27373a] p-6 rounded-2xl w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[85vh]">
              <button onClick={() => setIsPropertyModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors z-20"><span className="material-symbols-outlined">close</span></button>
              
              <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-widest border-b border-[#27373a] pb-3 shrink-0 flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan">real_estate_agent</span> Property Campaign
              </h3>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">1. Select Property</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {isLoadingProperties ? (
                        <div className="text-slate-500 text-sm p-4 col-span-2 text-center">Loading properties...</div>
                      ) : properties.length === 0 ? (
                        <div className="text-slate-500 text-sm p-4 col-span-2 text-center">No active properties found.</div>
                      ) : properties.map(p => {
                        const addressString = [p.address_line1, p.city, p.state].filter(Boolean).join(", ");
                        const displayPrice = p.price ? `$${p.price.toLocaleString()}` : "Price on Request";
                        return (
                        <div 
                          key={p.id} 
                          onClick={() => setSelectedProperty(p.id)}
                          className={`flex items-start gap-4 p-3 rounded-xl border cursor-pointer transition-all ${selectedProperty === p.id ? "bg-cyan/10 border-cyan shadow-[0_0_10px_rgba(0,209,255,0.15)]" : "bg-[#161B22] border-[#27373a] hover:border-cyan/50"}`}
                        >
                          {p.thumbnail_url ? (
                            <img src={p.thumbnail_url} alt={addressString} className="w-20 h-16 object-cover rounded-lg border border-[#27373a] shrink-0" />
                          ) : (
                            <div className="w-20 h-16 bg-[#1a2530] rounded-lg border border-[#27373a] shrink-0 flex items-center justify-center">
                              <span className="material-symbols-outlined text-slate-500">real_estate_agent</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-200 text-sm truncate">{p.address_line1 || "No Address"}</p>
                            <p className="text-slate-500 text-xs truncate">{[p.city, p.state].filter(Boolean).join(", ") || "-" }</p>
                            <p className="text-cyan text-xs font-bold mt-1">{displayPrice}</p>
                          </div>
                        </div>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">2. Campaign Type</h4>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {["New Listing", "Price Reduction", "Back On Market", "Buyer Match"].map(type => (
                        <button
                          key={type}
                          onClick={() => setPropertyCampaignSubtype(type)}
                          className={`p-3 rounded-xl border text-sm font-bold text-center transition-all ${propertyCampaignSubtype === type ? "bg-cyan/10 border-cyan text-cyan shadow-[0_0_10px_rgba(0,209,255,0.15)]" : "bg-[#161B22] border-[#27373a] text-slate-300 hover:border-cyan/50"}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    <AnimatePresence>
                      {propertyCampaignSubtype === "Price Reduction" && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Price Reduction Amount</label>
                          <input 
                            type="text" 
                            placeholder="e.g. $50,000" 
                            value={priceReductionAmount}
                            onChange={(e) => setPriceReductionAmount(e.target.value)}
                            className="w-full bg-[#161B22] border border-[#27373a] rounded-lg p-3 text-sm focus:border-cyan outline-none text-slate-100 placeholder:text-slate-600 transition-colors"
                          />
                        </motion.div>
                      )}
                      
                      {propertyCampaignSubtype === "Buyer Match" && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Personal Message</label>
                          <textarea 
                            placeholder="Type a thoughtful personal message here..." 
                            value={buyerMatchMessage}
                            onChange={(e) => setBuyerMatchMessage(e.target.value)}
                            rows={3}
                            className="w-full bg-[#161B22] border border-[#27373a] rounded-lg p-3 text-sm focus:border-cyan outline-none text-slate-100 placeholder:text-slate-600 transition-colors resize-none"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-[#27373a] shrink-0">
                <button onClick={() => setIsPropertyModalOpen(false)} className="px-6 py-2.5 bg-transparent border border-[#27373a] text-slate-300 font-bold rounded-xl hover:bg-[#161B22] transition-all">Cancel</button>
                <button 
                  onClick={() => {
                    const prop = properties.find(p => p.id === selectedProperty);
                    if (prop && propertyCampaignSubtype) {
                      setCampaignType(`Property: ${propertyCampaignSubtype} - ${prop.address_line1 || "Listing"}`);
                      setIsPropertyModalOpen(false);
                    }
                  }}
                  disabled={!selectedProperty || !propertyCampaignSubtype}
                  className="px-6 py-2.5 bg-cyan text-[#0B0E14] font-black uppercase tracking-widest text-[13px] rounded-xl hover:brightness-110 shadow-[0_0_15px_rgba(0,209,255,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Configuration
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nurture Modal */}
      <AnimatePresence>
        {isNurtureModalOpen && (
          <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
               className="bg-[#0B0E14] border border-[#27373a] p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
              <button onClick={() => setIsNurtureModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"><span className="material-symbols-outlined">close</span></button>
              <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-widest border-b border-[#27373a] pb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-400">psychology</span> Nurture Type
              </h3>
              <div className="flex flex-col gap-3">
                {["Future Buyer", "Future Seller", "Potential Investor"].map(type => (
                  <button 
                    key={type} 
                    onClick={() => { 
                      setNurtureSubtype(type); 
                      setCampaignType(`Nurture: ${type}`); 
                      setIsNurtureModalOpen(false); 
                    }} 
                    className={`p-4 rounded-xl border text-left font-bold transition-all ${nurtureSubtype === type ? "bg-indigo-500/10 border-indigo-500 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.15)]" : "bg-[#161B22] border-[#27373a] text-slate-300 hover:border-indigo-500/50"}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Role Modal */}
      <AnimatePresence>
        {isRoleModalOpen && (
          <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
               className="bg-[#0B0E14] border border-[#27373a] p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
              <button onClick={() => setIsRoleModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"><span className="material-symbols-outlined">close</span></button>
              <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-widest border-b border-[#27373a] pb-3">Select Target Role</h3>
              <div className="flex flex-col gap-3">
                {["Buyer", "Seller", "Agent", "Investor"].map(role => (
                  <button 
                    key={role} 
                    onClick={() => { 
                      setSelectedRole(role); 
                      setTargetAudience(`Role: ${role}`); 
                      setIsRoleModalOpen(false); 
                    }} 
                    className={`p-4 rounded-xl border text-left font-bold transition-all ${selectedRole === role ? "bg-cyan/10 border-cyan text-cyan shadow-[0_0_10px_rgba(0,209,255,0.15)]" : "bg-[#161B22] border-[#27373a] text-slate-300 hover:border-cyan/50"}`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leads Modal */}
      <AnimatePresence>
        {isLeadModalOpen && (
          <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
               className="bg-[#0B0E14] border border-[#27373a] p-6 rounded-2xl w-full max-w-3xl shadow-2xl relative flex flex-col max-h-[85vh]">
              <button 
                onClick={() => setIsLeadModalOpen(false)} 
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors z-20"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-widest border-b border-[#27373a] pb-3 shrink-0">Select Specific Leads</h3>
              
              <div className="relative mb-4 shrink-0 mt-2">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">search</span>
                <input 
                  type="text" 
                  placeholder="Search by name or role..." 
                  className="w-full bg-[#161B22] border border-[#27373a] rounded-lg h-12 pl-10 pr-4 text-sm focus:border-cyan outline-none text-slate-100 placeholder:text-slate-500 transition-all focus:shadow-[0_0_10px_rgba(0,209,255,0.1)]" 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                />
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[300px] border border-[#27373a] rounded-xl bg-[#11151c] mb-4">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#161B22] border-b border-[#27373a] sticky top-0 z-10">
                    <tr>
                      <th className="p-4 w-12 text-center">
                        <input 
                          type="checkbox" 
                          className="accent-cyan cursor-pointer size-4" 
                          checked={selectedLeads.length === filteredContacts.length && filteredContacts.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedLeads(filteredContacts.map(l => l.id));
                            else setSelectedLeads([]);
                          }}
                        />
                      </th>
                      <th className="p-4 font-black uppercase tracking-widest text-[#64748b] text-[10px]">Name</th>
                      <th className="p-4 font-black uppercase tracking-widest text-[#64748b] text-[10px]">Role</th>
                      <th className="p-4 font-black uppercase tracking-widest text-[#64748b] text-[10px]">Heat Index</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27373a]/50">
                    {filteredContacts.length > 0 ? filteredContacts.map(lead => (
                      <tr 
                        key={lead.id} 
                        className={`hover:bg-[#1C232B] cursor-pointer transition-colors ${selectedLeads.includes(lead.id) ? 'bg-[#1C232B]' : ''}`} 
                        onClick={() => {
                          setSelectedLeads(prev => prev.includes(lead.id) ? prev.filter(id => id !== lead.id) : [...prev, lead.id])
                        }}
                      >
                        <td className="p-4 text-center">
                          <input type="checkbox" className="accent-cyan cursor-pointer size-4" checked={selectedLeads.includes(lead.id)} readOnly />
                        </td>
                        <td className="p-4 font-bold text-slate-200">{lead.first_name} {lead.last_name}</td>
                        <td className="p-4 text-slate-400 text-sm">{lead.role || lead.type || 'N/A'}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${lead.heat_index === 'HOT' ? 'text-orange-500 border-orange-500/30' : lead.heat_index === 'WARM' ? 'text-amber-500 border-amber-500/30' : 'text-blue-500 border-blue-500/30'}`}>
                            {lead.heat_index || 'UNKNOWN'}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-500">No leads found matching your search.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-[#27373a] shrink-0">
                <span className="text-sm font-bold text-slate-400"><span className="text-white">{selectedLeads.length}</span> leads selected</span>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsLeadModalOpen(false)}
                    className="px-6 py-2.5 bg-transparent border border-[#27373a] text-slate-300 font-bold rounded-xl hover:bg-[#161B22] transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      setTargetAudience(selectedLeads.length > 0 ? `${selectedLeads.length} Specific Leads` : "Specific Leads (None Selected)");
                      setIsLeadModalOpen(false);
                    }} 
                    className="px-6 py-2.5 bg-cyan text-[#0B0E14] font-black uppercase tracking-widest text-[13px] rounded-xl hover:brightness-110 shadow-[0_0_15px_rgba(0,209,255,0.3)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
                  >
                     <span className="material-symbols-outlined text-[18px]">add_task</span> Add to Campaign
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
