"use client";

import { useOnboarding } from "./OnboardingContext";
import { useState } from "react";

export function BufferSetupStep() {
  const { data, updateData } = useOnboarding();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<"none" | "success" | "error">("none");

  const verifyToken = async (token: string) => {
    if (!token) return;
    setIsVerifying(true);
    setVerifyStatus("none");
    
    // Call Buffer User endpoint to verify
    try {
      const res = await fetch('https://api.bufferapp.com/1/user.json', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setVerifyStatus("success");
      } else {
        setVerifyStatus("error");
      }
    } catch {
      setVerifyStatus("error");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const token = e.target.value;
    updateData({ bufferAccessToken: token });
    setVerifyStatus("none");
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 relative">
        <h2 className="text-3xl font-black font-display tracking-tight text-white border-l-4 border-cyan pl-4">Connect Social Media</h2>
        <p className="text-slate-400 pl-4">
          Specular OS uses Buffer to automatically publish and schedule the content you generate with our marketing studios to Instagram, Facebook, and LinkedIn.
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-[#0A0D14] border border-[#27373a] p-5 rounded-2xl flex flex-col gap-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-cyan">bolt</span>
          How to get your API Token
        </h3>
        <ul className="text-slate-400 text-sm flex flex-col gap-2 list-decimal pl-5 marker:text-cyan marker:font-bold">
          <li>Go to <a href="https://buffer.com" target="_blank" rel="noopener noreferrer" className="text-cyan hover:underline">Buffer.com</a> and sign up for a free account.</li>
          <li>Navigate to your Account Settings &gt; Apps &amp; Extras &gt; Personal Access Token.</li>
          <li>Click &quot;Create Token&quot; and paste the long string below.</li>
        </ul>
      </div>

      {/* Input */}
      <div className="flex flex-col gap-3">
        <label className="text-slate-300 text-sm font-semibold ml-1">Buffer Personal Access Token</label>
        <div className="relative">
          <input
            type="password"
            placeholder="1/abcdef1234567890..."
            value={data.bufferAccessToken}
            onChange={handleChange}
            className="w-full bg-[#0A0D14] border border-[#30363D] text-slate-100 rounded-xl h-12 px-4 pr-24 focus:border-cyan outline-none transition-all placeholder:text-slate-600 font-mono text-sm"
          />
          {data.bufferAccessToken && (
            <button
               onClick={() => verifyToken(data.bufferAccessToken)}
               disabled={isVerifying}
               className="absolute right-2 top-2 bottom-2 bg-cyan/10 hover:bg-cyan/20 border border-cyan/30 text-cyan px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50"
            >
              {isVerifying ? <span className="material-symbols-outlined text-[14px] animate-spin">autorenew</span> : "Verify"}
            </button>
          )}
        </div>
        
        {/* Verification Status Feedback */}
        {verifyStatus === "success" && (
           <p className="text-green-500 text-xs font-semibold flex items-center gap-1 ml-1">
             <span className="material-symbols-outlined text-[14px]">check_circle</span> Token Verified!
           </p>
        )}
        {verifyStatus === "error" && (
           <p className="text-red-500 text-xs font-semibold flex items-center gap-1 ml-1">
             <span className="material-symbols-outlined text-[14px]">error</span> Invalid or expired token. Please verify on Buffer.
           </p>
        )}
      </div>

      <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl text-blue-400 text-sm mt-4">
        <span className="material-symbols-outlined text-[18px]">info</span>
        You can always skip this and set it up later in your Account Settings.
      </div>
    </div>
  );
}
