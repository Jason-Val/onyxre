"use client";

import { motion } from "framer-motion";

export function AIStatus({ isActive = true }: { isActive?: boolean }) {
  return (
    <div className={`flex items-center gap-4 bg-[#161B22]/50 px-4 py-2 rounded-full border transition-all ${
      isActive ? 'border-cyan/30 shadow-[0_0_15px_rgba(0,209,255,0.1)]' : 'border-white/5 opacity-50'
    }`} data-purpose="ai-status">
      <span className={`text-[10px] font-black uppercase tracking-wider ${isActive ? 'text-cyan' : 'text-slate-500'}`}>
        {isActive ? 'Specular AI Active' : 'Specular AI Inactive'}
      </span>
      <div className="flex items-end h-4 gap-[2px]">
        {[0.2, 0.4, 0.1, 0.3, 0.2].map((delay, i) => (
          <motion.span
            key={i}
            className={`w-[3px] rounded-full ${isActive ? 'bg-cyan' : 'bg-slate-700'}`}
            initial={{ height: 4 }}
            animate={isActive ? { height: [4, 16, 4] } : { height: 4 }}
            transition={isActive ? {
              duration: 1.2,
              repeat: Infinity,
              delay: delay,
              ease: "easeInOut",
            } : {}}
          />
        ))}
      </div>
    </div>
  );
}
