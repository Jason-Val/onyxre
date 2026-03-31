"use client";

import { useState } from "react";
import { createClient } from "@/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type Mode = "sign-in" | "sign-up";

export default function SignupPage() {
  const [mode, setMode] = useState<Mode>("sign-up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "sign-up") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setSuccess(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = "/dashboard";
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  }

  if (success) {
    return <VerifyEmailInline email={email} />;
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        {/* Logo + wordmark */}
        <div className="text-center mb-10">
          <img src="/SpecOS_LOGO.png" alt="Specular OS" className="h-[4.5rem] w-auto mx-auto mb-4 drop-shadow-[0_0_15px_rgba(0,209,255,0.3)]" />
          <h1 className="text-3xl font-bold font-display text-white tracking-tight">
            {mode === "sign-up" ? "Join Specular OS" : "Welcome Back"}
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            {mode === "sign-up"
              ? "Elite intelligence for the modern realtor."
              : "Sign in to access your Command Center."}
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#161B26] border border-[#30363D] rounded-2xl p-8 shadow-2xl">
          {/* Mode toggle */}
          <div className="flex bg-[#0A0D14] rounded-xl p-1 mb-8">
            {(["sign-up", "sign-in"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); }}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === m ? "bg-cyan text-onyx shadow-md" : "text-slate-400 hover:text-white"}`}
              >
                {m === "sign-up" ? "Create Account" : "Sign In"}
              </button>
            ))}
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            className="w-full py-3 bg-white/5 border border-[#30363D] rounded-xl font-bold text-white flex items-center justify-center gap-3 hover:bg-white/10 transition-all mb-6"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="relative flex items-center mb-6">
            <div className="flex-grow border-t border-white/10" />
            <span className="mx-4 text-slate-500 text-xs font-bold uppercase tracking-widest">or</span>
            <div className="flex-grow border-t border-white/10" />
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleEmailAuth}
              className="flex flex-col gap-4"
            >
              <Field
                label="Email Address"
                type="email"
                placeholder="agent@specularos.com"
                value={email}
                onChange={setEmail}
                required
              />
              <Field
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={setPassword}
                required
                hint={mode === "sign-in" ? <a href="#" className="text-cyan text-xs hover:underline">Forgot?</a> : undefined}
              />

              {error && (
                <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full py-3.5 bg-cyan text-onyx font-bold rounded-xl hover:brightness-110 transition-all shadow-[0_0_15px_rgba(0,209,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Please wait…" : mode === "sign-up" ? "Create Account →" : "Sign In →"}
              </button>
            </motion.form>
          </AnimatePresence>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          By creating an account you agree to our{" "}
          <Link href="#" className="text-cyan hover:underline">Terms of Service</Link>
          {" "}and{" "}
          <Link href="#" className="text-cyan hover:underline">Privacy Policy</Link>.
        </p>
      </motion.div>
    </div>
  );
}

function VerifyEmailInline({ email }: { email: string }) {
  const [resent, setResent] = useState(false);
  const supabase = createClient();

  async function resend() {
    await supabase.auth.resend({ type: "signup", email });
    setResent(true);
    setTimeout(() => setResent(false), 5000);
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-cyan/10 border border-cyan/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(0,209,255,0.15)]">
          <span className="material-symbols-outlined text-cyan text-4xl">mark_email_read</span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">Check Your Inbox</h2>
        <p className="text-slate-400 mb-2">
          We&apos;ve sent a confirmation link to:
        </p>
        <p className="text-cyan font-bold text-lg mb-8">{email}</p>
        <p className="text-slate-500 text-sm mb-6">
          Click the link in your email to verify your account and choose your plan.
        </p>
        <button
          onClick={resend}
          className="text-sm text-slate-400 hover:text-cyan transition-colors underline underline-offset-4"
        >
          {resent ? "✓ Email resent!" : "Resend confirmation email"}
        </button>
      </motion.div>
    </div>
  );
}

function Field({
  label, type, placeholder, value, onChange, required, hint,
}: {
  label: string; type: string; placeholder: string; value: string;
  onChange: (v: string) => void; required?: boolean; hint?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-widest">{label}</label>
        {hint}
      </div>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0A0D14] border border-[#30363D] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan/50 transition-all placeholder:text-slate-600"
      />
    </div>
  );
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
