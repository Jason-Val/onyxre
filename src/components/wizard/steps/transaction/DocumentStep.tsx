"use client";

export interface DocumentChecklistItem {
  title: string;
}

interface DocumentStepProps {
  documents: DocumentChecklistItem[];
  onChange: (documents: DocumentChecklistItem[]) => void;
}

const DEFAULT_DOCS: DocumentChecklistItem[] = [
  { title: "Purchase Agreement" },
  { title: "TDS" },
  { title: "SPQ" },
  { title: "MCA" },
  { title: "Sq Ft Advisory" },
  { title: "WCMD" },
  { title: "SPT" },
  { title: "AVID - SA" },
  { title: "AVID - LA" },
  { title: "FIRPTA" },
  { title: "NHD Sig Pages" }
];

export function DocumentStep({ documents, onChange }: DocumentStepProps) {
  // Initialize with defaults if empty
  if (documents.length === 0) {
    onChange(DEFAULT_DOCS);
  }

  function addDoc() {
    onChange([...documents, { title: "New Document" }]);
  }

  function updateTitle(index: number, title: string) {
    const next = [...documents];
    next[index].title = title;
    onChange(next);
  }

  function removeDoc(index: number) {
    onChange(documents.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-8 h-full pr-2 pb-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-white tracking-tight">Compliance Checklist</h2>
        <p className="text-slate-400 text-sm">Select and add the required documents for this transaction.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-white/10 transition-all">
            <div className="flex items-center gap-3 flex-1">
              <div className="size-8 rounded-lg bg-onyx border border-white/5 flex items-center justify-center text-cyan shadow-[0_0_10px_rgba(0,209,255,0.1)]">
                <span className="material-symbols-outlined text-sm">description</span>
              </div>
              <input 
                type="text"
                value={doc.title}
                onChange={(e) => updateTitle(i, e.target.value)}
                className="bg-transparent border-none text-white font-bold text-xs outline-none focus:text-cyan transition-colors w-full"
                placeholder="Document Title"
              />
            </div>
            
            <button 
              onClick={() => removeDoc(i)}
              className="text-slate-500 hover:text-red-400 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
            </button>
          </div>
        ))}
      </div>

      <button 
        onClick={addDoc}
        className="flex items-center gap-2 text-cyan text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all w-fit mt-2"
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
        Add Custom Document
      </button>
    </div>
  );
}
