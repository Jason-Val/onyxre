"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface AuthSliderProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthSlider({ isOpen, onClose }: AuthSliderProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  }

  async function handleForgot() {
    if (!email) { setError("Enter your email address first."); return; }
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setForgotSent(true);
    setLoading(false);
  }

  if (!isOpen && typeof window !== "undefined") return null;

  const sliderContent = (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`fixed inset-y-0 right-0 z-[101] w-full max-w-md bg-gradient-to-b from-[#161B26] to-[#0A0D14] border-l border-[#30363D] shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <div>
              <h2 className="text-2xl font-bold font-display text-white">Welcome Back</h2>
              <p className="text-slate-400 text-sm mt-1">Sign in to your Command Center</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
            {/* Google */}
            <button
              onClick={handleGoogle}
              className="w-full py-3.5 bg-white/5 border border-[#30363D] rounded-xl font-bold text-white flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
            >
              <GoogleIcon /> Continue with Google
            </button>

            <div className="relative flex items-center">
              <div className="flex-grow border-t border-white/10" />
              <span className="mx-4 text-slate-500 text-xs font-bold uppercase tracking-widest">or</span>
              <div className="flex-grow border-t border-white/10" />
            </div>

            <AnimatePresence mode="wait">
              {forgotSent ? (
                <motion.div key="sent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
                  <span className="material-symbols-outlined text-cyan text-5xl mb-3 block">mark_email_read</span>
                  <p className="text-slate-300 text-sm">Password reset email sent to <span className="text-cyan font-bold">{email}</span>. Check your inbox.</p>
                </motion.div>
              ) : (
                <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSignIn} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-widest">Email Address</label>
                    <input
                      type="email" required
                      className="w-full bg-[#0A0D14] border border-[#30363D] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan/50 transition-all placeholder:text-slate-600"
                      placeholder="agent@onyxre.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-widest">Password</label>
                      <button type="button" onClick={handleForgot} className="text-xs text-cyan hover:underline">Forgot?</button>
                    </div>
                    <input
                      type="password" required
                      className="w-full bg-[#0A0D14] border border-[#30363D] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan/50 transition-all placeholder:text-slate-600"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  {error && (
                    <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{error}</p>
                  )}

                  <button
                    type="submit" disabled={loading}
                    className="w-full mt-1 py-3.5 bg-cyan text-onyx font-bold rounded-xl hover:brightness-110 transition-all shadow-[0_0_15px_rgba(0,209,255,0.2)] disabled:opacity-50"
                  >
                    {loading ? "Signing in…" : "Sign In →"}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/5 bg-[#050608] text-center">
            <p className="text-slate-400 text-sm">
              Don&apos;t have an account?{" "}
              <a href="/signup" className="text-cyan font-bold hover:underline" onClick={onClose}>
                Create one free →
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );

  if (typeof window === "undefined") return null;
  return createPortal(sliderContent, document.body);
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
