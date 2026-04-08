"use client";

import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function OpenHouseKiosk({ property, baseUrl }: { property: any, baseUrl: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Construct the target URL for the guest to scan with their phone.
  const targetUrl = `${baseUrl}/property/${property.id}?mode=openhouse`;

  const handleManualSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    await fetch("/api/crm/open-house/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        property,
        first_name: formData.get("first_name"),
        last_name: formData.get("last_name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        working_with_realtor: formData.get("working_with_realtor") === "on",
        keep_me_informed: formData.get("keep_me_informed") === "on",
        immediate_email: true
      })
    });

    setIsSubmitting(false);
    setShowToast(true);
    e.currentTarget.reset();
    
    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  };

  return (
    <div className="w-full min-h-screen bg-[#0B0E14] text-slate-100 font-sans flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-cyan/10 to-transparent pointer-events-none" />
      <div className="absolute -top-[300px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-cyan/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="p-8 flex items-center justify-between relative z-10 shrink-0">
         <div className="flex items-center gap-4">
           <Link href="/crm" className="text-slate-500 hover:text-cyan transition-colors flex items-center justify-center size-12 rounded-full bg-onyx border border-[#27373a] hover:border-cyan/50">
              <span className="material-symbols-outlined">close</span>
           </Link>
           <div>
              <p className="text-xs font-black uppercase tracking-widest text-cyan">OnyxRE</p>
              <h1 className="text-xl font-bold text-white">Open House Kiosk</h1>
           </div>
         </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-[#11151c] border border-cyan/30 rounded-3xl p-8 md:p-12 max-w-5xl w-full shadow-[0_0_80px_rgba(0,209,255,0.15)] flex flex-col gap-8"
         >
            {/* Top Row: Thumbnail + Text */}
            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-8">
               <div className="size-32 md:size-40 rounded-2xl bg-black overflow-hidden border-4 border-onyx shadow-xl shrink-0">
                  {property.thumbnail_url ? (
                    <img src={property.thumbnail_url} alt="Property" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 bg-onyx-surface">
                       <span className="material-symbols-outlined text-5xl">house</span>
                    </div>
                  )}
               </div>
               <div className="flex flex-col justify-center pt-2">
                 <h2 className="text-3xl md:text-4xl font-black font-display uppercase tracking-tighter text-white mb-2 leading-tight">
                    Welcome to <span className="text-cyan block">{property.address_line1}</span>
                 </h2>
                 <p className="text-lg text-slate-400 font-medium">
                    {property.city}, {property.state}
                 </p>
               </div>
            </div>

            {/* Instruction Bar */}
            <p className="text-slate-200 bg-cyan/10 border border-cyan/20 px-6 py-4 rounded-xl text-lg font-semibold italic text-center w-full">
               Please scan the QR code to sign in on your phone, or fill out the form below to view full listing details, photos, and virtual tours.
            </p>

            {/* Bottom Row: Form & QR Code */}
            <div className="flex flex-col md:flex-row gap-12 lg:gap-20 items-stretch justify-center">
               
               {/* Left: Form */}
               <div className="flex-1 max-w-md w-full mx-auto md:mx-0 flex flex-col">
                  <form onSubmit={handleManualSubmit} className="w-full flex-1 flex flex-col gap-4 bg-onyx-surface p-6 rounded-2xl border border-[#27373a] shadow-inner justify-between">
                     <h3 className="font-bold text-white text-base uppercase tracking-widest border-b border-[#27373a] pb-3 mb-1">Manual Sign In</h3>
                     
                     <div className="flex flex-col gap-3">
                       <div className="grid grid-cols-2 gap-3">
                         <input required type="text" name="first_name" placeholder="First Name" className="w-full bg-[#0B0E14] border border-[#27373a] rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan transition-all" />
                         <input required type="text" name="last_name" placeholder="Last Name" className="w-full bg-[#0B0E14] border border-[#27373a] rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan transition-all" />
                       </div>
                       <input required type="email" name="email" placeholder="Email Address" className="w-full bg-[#0B0E14] border border-[#27373a] rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan transition-all" />
                       <input type="tel" name="phone" placeholder="Phone Number (Optional)" className="w-full bg-[#0B0E14] border border-[#27373a] rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan transition-all" />
                     </div>
                     
                     <div className="flex flex-col gap-2 mt-2">
                       <label className="flex items-start gap-3 cursor-pointer group">
                         <input type="checkbox" name="working_with_realtor" className="mt-0.5 w-4 h-4 accent-cyan border-[#27373a] bg-[#0B0E14] rounded cursor-pointer shrink-0" />
                         <span className="text-slate-400 text-xs font-medium group-hover:text-white transition-colors leading-snug">I'm currently working with a realtor</span>
                       </label>
                       
                       <label className="flex items-start gap-3 cursor-pointer group">
                         <input type="checkbox" name="keep_me_informed" className="mt-0.5 w-4 h-4 accent-cyan border-[#27373a] bg-[#0B0E14] rounded cursor-pointer shrink-0" />
                         <span className="text-slate-400 text-xs font-medium group-hover:text-white transition-colors leading-snug">Keep me informed about this property and others</span>
                       </label>
                     </div>

                     <button disabled={isSubmitting} type="submit" className="w-full py-3.5 mt-2 rounded-lg font-black uppercase tracking-widest text-[11px] text-[#0B0E14] bg-cyan transition-all hover:brightness-110 disabled:opacity-50">
                       {isSubmitting ? "Submitting..." : "Check In & Email Details"}
                     </button>
                  </form>
               </div>

               {/* Right: QR Code */}
               <div className="shrink-0 flex flex-col items-center justify-center gap-6 pb-2">
                  <div className="bg-white p-6 rounded-3xl shadow-[0_0_40px_rgba(255,255,255,0.1)] border-8 border-onyx-surface flex flex-col items-center gap-4">
                     <div className="bg-cyan/10 text-cyan text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-cyan/30">
                       Scan to Unlock
                     </div>
                     <QRCodeSVG 
                       value={targetUrl} 
                       size={240} 
                       level="H"
                       includeMargin={false}
                       fgColor="#0B0E14"
                     />
                     <div className="flex items-center gap-2 mt-1 text-[#0B0E14] font-bold text-sm">
                       <span className="material-symbols-outlined">photo_camera</span>
                       Point Camera Here
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-bold uppercase tracking-widest mt-auto shrink-0">
                     <span className="material-symbols-outlined text-base">verified_user</span>
                     Secure Registration
                  </div>
               </div>

            </div>
         </motion.div>
      </main>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: "-50%" }} 
            animate={{ opacity: 1, y: 0, x: "-50%" }} 
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className="fixed bottom-10 left-1/2 bg-emerald-500 text-white px-8 py-4 rounded-full font-bold flex items-center gap-3 shadow-[0_10px_40px_rgba(16,185,129,0.3)] z-50 text-sm tracking-wide"
          >
            <span className="material-symbols-outlined">check_circle</span>
            Thank you for your interest! Please check your email for the listing details.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
