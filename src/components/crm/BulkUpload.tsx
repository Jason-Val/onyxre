"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Mapping {
  [key: string]: string;
}

const REQUIRED_FIELDS = [
  { id: "first_name", label: "First Name" },
  { id: "last_name", label: "Last Name" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "role", label: "Role" },
  { id: "heat_index", label: "Heat Index" },
];

export function BulkUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Mapping>({});
  const [step, setStep] = useState<"upload" | "mapping" | "preview">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const rows = text.split("\n");
        if (rows.length > 0) {
          const csvHeaders = rows[0].split(",").map(h => h.trim().replace(/^"|"$/g, ''));
          setHeaders(csvHeaders);
          
          // Auto-map based on string similarity
          const initialMapping: Mapping = {};
          csvHeaders.forEach(header => {
            const h = header.toLowerCase().replace(/[\s_]/g, '');
            const match = REQUIRED_FIELDS.find(f => h.includes(f.id.replace('_', '')));
            if (match) initialMapping[match.id] = header;
          });
          setMapping(initialMapping);
          setStep("mapping");
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  return (
    <div className="bg-onyx-surface border border-[#27373a] rounded-2xl overflow-hidden shadow-2xl max-w-2xl mx-auto w-full">
      <div className="p-8">
        <AnimatePresence mode="wait">
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-6 py-12"
            >
              <div className="size-20 bg-cyan/10 rounded-full flex items-center justify-center border-2 border-dashed border-cyan/30 text-cyan">
                <span className="material-symbols-outlined text-4xl">cloud_upload</span>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Bulk Upload Leads</h3>
                <p className="text-slate-400 text-sm max-w-xs">Upload your CSV or Excel file to import contacts in bulk.</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".csv"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-8 py-3 bg-cyan text-onyx font-bold rounded-xl shadow-[0_0_20px_rgba(0,209,255,0.3)] hover:brightness-110 transition-all"
              >
                Select File
              </button>
            </motion.div>
          )}

          {step === "mapping" && (
            <motion.div
              key="mapping"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-6"
            >
              <div className="flex items-center justify-between border-b border-[#27373a] pb-4">
                <h3 className="text-xl font-bold">Map CSV Columns</h3>
                <span className="text-xs text-slate-500 font-mono">{file?.name}</span>
              </div>
              
              <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {REQUIRED_FIELDS.map((field) => (
                  <div key={field.id} className="flex items-center gap-4 bg-onyx border border-[#27373a] p-4 rounded-xl">
                    <div className="flex-1">
                      <p className="text-slate-300 font-bold text-sm">{field.label}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">CRM Field</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-600">arrow_forward</span>
                    <select 
                      value={mapping[field.id] || ""}
                      onChange={(e) => setMapping({ ...mapping, [field.id]: e.target.value })}
                      className="flex-1 bg-onyx-surface border border-[#27373a] text-slate-200 text-sm rounded-lg h-10 px-3 outline-none focus:border-cyan transition-all"
                    >
                      <option value="">Do not import</option>
                      {headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-4">
                <button 
                  onClick={() => setStep("upload")}
                  className="px-6 py-3 border border-[#27373a] text-slate-400 rounded-xl hover:bg-[#161B22] transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setStep("preview")}
                  className="flex-1 px-6 py-3 bg-cyan text-onyx font-bold rounded-xl shadow-[0_0_20px_rgba(0,209,255,0.2)] hover:brightness-110 transition-all"
                >
                  Confirm Mapping
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
