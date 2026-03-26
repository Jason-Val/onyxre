"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import clsx from "clsx";

interface WizardFrameProps {
  title: string;
  subtitle?: string;
  steps: { title: string; subtitle?: string }[];
  currentStep: number;
  children: ReactNode[];
  onNext?: () => void;
  onPrev?: () => void;
  onEscape?: () => void;
  isNextDisabled?: boolean;
  nextLabel?: string;
  hideFooter?: boolean;
}

export function WizardFrame({
  title,
  steps,
  currentStep,
  children,
  onNext,
  onPrev,
  onEscape,
  isNextDisabled,
  nextLabel = "Continue",
  hideFooter = false,
}: WizardFrameProps) {
  // Ensure we don't go out of bounds
  const safeStep = Math.max(0, Math.min(currentStep, steps.length - 1));
  const progressPercent = ((safeStep + 1) / steps.length) * 100;

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto px-4 md:px-10 py-8 relative">
      <header className="flex flex-col gap-3 mb-8">
        <div className="flex justify-between items-start gap-6">
          <div className="flex flex-col">
            <span className="text-cyan text-xs font-bold uppercase tracking-widest">{title}</span>
            <p className="text-2xl font-bold font-display">Step {safeStep + 1} of {steps.length}</p>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-slate-400 text-sm font-medium mt-2">{Math.round(progressPercent)}% Complete</p>
            {onEscape && (
              <button
                onClick={onEscape}
                title="Cancel and Exit Studio"
                className="w-8 h-8 rounded-full bg-onyx-surface border border-[#30363D] flex items-center justify-center text-slate-400 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer shadow-lg"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-onyx-surface rounded-full h-2 overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
          <motion.div 
            className="h-full bg-cyan rounded-full shadow-[0_0_10px_rgba(0,209,255,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
        
        <p className="text-slate-400 text-sm">{steps[safeStep].title}</p>
      </header>

      {/* Main Content Area with Sliding Transitions */}
      <div className="flex-1 relative overflow-x-hidden overflow-y-visible min-h-[400px] px-8 -mx-8 pt-4 -mt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={safeStep}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full h-full pb-20"
          >
            {children[safeStep]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      {!hideFooter && (
        <footer className="flex justify-between items-center py-6 border-t border-[#161B22] mt-auto">
          <button
            onClick={onPrev}
            disabled={safeStep === 0}
            className={clsx(
              "px-8 py-3 rounded-xl border border-slate-700 font-bold flex items-center gap-2 transition-all",
              safeStep === 0 
                ? "opacity-50 cursor-not-allowed text-slate-500" 
                : "text-slate-300 hover:bg-[#161B22] hover:text-white"
            )}
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back
          </button>
          
          <button
            onClick={onNext}
            disabled={isNextDisabled}
            className={clsx(
              "px-10 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg",
              isNextDisabled
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-cyan text-onyx hover:brightness-110 shadow-cyan/20"
            )}
          >
            {nextLabel}
            <span className="material-symbols-outlined text-lg">
              {safeStep === steps.length - 1 ? "check_circle" : "arrow_forward"}
            </span>
          </button>
        </footer>
      )}
    </div>
  );
}
