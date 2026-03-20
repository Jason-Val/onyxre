"use client";

export interface Milestone {
  title: string;
  date: string;
  status: 'pending' | 'completed' | 'active';
}

interface MilestoneStepProps {
  milestones: Milestone[];
  onChange: (milestones: Milestone[]) => void;
}

const DEFAULT_MILESTONES: Milestone[] = [
  { title: "EMD Deposit", date: "", status: 'pending' },
  { title: "Home Inspection", date: "", status: 'pending' },
  { title: "Appraisal Contingency", date: "", status: 'pending' },
  { title: "Loan Commitment", date: "", status: 'pending' },
  { title: "Final Walkthrough", date: "", status: 'pending' },
  { title: "Closing Date", date: "", status: 'pending' },
];

export function MilestoneStep({ milestones, onChange }: MilestoneStepProps) {
  // Initialize with defaults if empty
  if (milestones.length === 0) {
    onChange(DEFAULT_MILESTONES);
  }

  function updateDate(index: number, date: string) {
    const next = [...milestones];
    next[index].date = date;
    onChange(next);
  }

  function addMilestone() {
    onChange([...milestones, { title: "New Milestone", date: "", status: 'pending' }]);
  }

  return (
    <div className="flex flex-col gap-8 h-full pr-2 pb-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-white tracking-tight">Escrow Milestones</h2>
        <p className="text-slate-400 text-sm">Configure key dates and deadlines for this transaction.</p>
      </div>

      <div className="flex flex-col gap-4">
        {milestones.map((m, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/10 transition-all">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-onyx border border-white/5 flex items-center justify-center text-cyan shadow-[0_0_10px_rgba(0,209,255,0.1)]">
                <span className="material-symbols-outlined text-lg">event</span>
              </div>
              <input 
                type="text"
                value={m.title}
                onChange={(e) => {
                  const next = [...milestones];
                  next[i].title = e.target.value;
                  onChange(next);
                }}
                className="bg-transparent border-none text-white font-bold text-sm outline-none focus:text-cyan transition-colors"
                placeholder="Milestone Title"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Target Date</span>
              <input 
                type="date"
                value={m.date}
                onChange={(e) => updateDate(i, e.target.value)}
                className="bg-onyx border border-white/10 text-white text-xs font-bold px-4 py-2 rounded-xl focus:border-cyan outline-none transition-all [color-scheme:dark]"
              />
              <button 
                onClick={() => onChange(milestones.filter((_, idx) => idx !== i))}
                className="text-slate-500 hover:text-red-400 transition-colors ml-2"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={addMilestone}
        className="flex items-center gap-2 text-cyan text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all w-fit mt-2"
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
        Add Custom Milestone
      </button>
    </div>
  );
}
