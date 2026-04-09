import { useEffect, useState } from "react";
import { createClient } from "@/supabase/client";
import { ContactFormData } from "@/app/contacts/new/page";

interface CampaignPilotStepProps {
  data: ContactFormData;
  update: (updates: Partial<ContactFormData>) => void;
}

export function CampaignPilotStep({ data, update }: CampaignPilotStepProps) {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadProperties() {
      if (data.actionType === "PROPERTY_BLAST" && properties.length === 0) {
        setIsLoading(true);
        const { data: props } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
        if (props) setProperties(props);
        setIsLoading(false);
      }
    }
    loadProperties();
  }, [data.actionType]);

  const actions = [
    { 
      id: "JUST_SAVE", 
      title: "Just Save to CRM", 
      description: "No immediate automation. Just add the contact.",
      icon: "person_add"
    },
    { 
      id: "AI_CAMPAIGN", 
      title: "Launch AI Campaign", 
      description: "Generate an 18-touchpoint Gemini nurture sequence.",
      icon: "rocket_launch"
    },
    { 
      id: "PROPERTY_BLAST", 
      title: "Property Marketing Blast", 
      description: "Send a targeted property email immediately.",
      icon: "send"
    }
  ];

  const propertySubtypes = ["New Listing", "Price Reduction", "Back On Market", "Buyer Match"];

  return (
    <div className="flex flex-col gap-8 h-full pr-2 pb-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold font-display tracking-tight border-l-4 border-cyan pl-4">Campaign Pilot</h2>
        <p className="text-slate-400 pl-4">Choose the immediate action for this new contact.</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => update({ actionType: action.id as any })}
              className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all gap-3 ${
                data.actionType === action.id 
                  ? "bg-cyan/10 border-cyan shadow-[0_0_20px_rgba(0,209,255,0.2)] scale-[1.02]" 
                  : "bg-onyx-surface border-[#27373a] opacity-60 hover:opacity-100 hover:border-cyan/50"
              }`}
            >
              <div className={`size-14 rounded-full flex items-center justify-center ${data.actionType === action.id ? "bg-cyan text-onyx" : "bg-onyx text-slate-500"}`}>
                <span className="material-symbols-outlined text-3xl font-bold">{action.icon}</span>
              </div>
              <div className="text-center">
                <h3 className={`font-bold text-lg mb-1 ${data.actionType === action.id ? "text-white" : "text-slate-300"}`}>{action.title}</h3>
                <p className="text-[10px] text-slate-500 font-medium leading-tight">{action.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* AI Campaign Context */}
        {data.actionType === "AI_CAMPAIGN" && (
          <div className="bg-indigo-500/5 border border-indigo-500/30 rounded-xl p-6 flex items-center gap-6 animate-in fade-in slide-in-from-to-top-2">
            <div className="size-16 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center border border-indigo-500/20 shrink-0">
              <span className="material-symbols-outlined text-3xl">psychology</span>
            </div>
            <div>
              <h4 className="font-bold text-indigo-100">AI Nurture Strategy</h4>
              <p className="text-sm text-slate-400">Gemini will generate a personalized 18-touchpoint sequence based on the <strong>{data.leadType}</strong> classification and <strong>{data.heatIndex}</strong> heat index.</p>
            </div>
          </div>
        )}

        {/* Property Blast Sub-selection */}
        {data.actionType === "PROPERTY_BLAST" && (
          <div className="flex flex-col gap-6 p-6 border border-cyan/20 bg-cyan/5 rounded-2xl animate-in fade-in slide-in-from-top-4">
            <div>
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">1. Select Property</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                {isLoading ? (
                  <div className="col-span-2 py-10 text-center text-slate-500 italic">Finding properties...</div>
                ) : properties.length === 0 ? (
                  <div className="col-span-2 py-10 text-center text-slate-500 italic">No properties found.</div>
                ) : properties.map((p) => (
                  <div 
                    key={p.id}
                    onClick={() => update({ selectedPropertyId: p.id })}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      data.selectedPropertyId === p.id 
                        ? "bg-cyan border-cyan text-onyx shadow-lg" 
                        : "bg-onyx border-[#27373a] text-slate-300 hover:border-cyan/50"
                    }`}
                  >
                    <div className="size-12 rounded bg-black shrink-0 overflow-hidden border border-[#27373a]">
                      {p.thumbnail_url ? <img src={p.thumbnail_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-slate-600">house</span></div>}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs truncate">{p.address_line1}</p>
                      <p className={`text-[10px] ${data.selectedPropertyId === p.id ? "text-onyx opacity-70" : "text-slate-500"} truncate`}>{p.city}, {p.state}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">2. Campaign Type</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {propertySubtypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => update({ propertySubtype: type })}
                    className={`p-3 rounded-xl border text-[11px] font-black uppercase tracking-widest text-center transition-all ${
                      data.propertySubtype === type 
                        ? "bg-cyan border-cyan text-onyx shadow-lg" 
                        : "bg-onyx border-[#27373a] text-slate-400 hover:border-cyan/50"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

