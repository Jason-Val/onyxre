"use client";

const FEATURE_LIST = [
  { name: "Chef's Kitchen", icon: "restaurant" },
  { name: "Pool & Spa", icon: "pool" },
  { name: "Smart Home Tech", icon: "router" },
  { name: "Hardwood Floors", icon: "floor" },
  { name: "Ocean View", icon: "water" },
  { name: "Wine Cellar", icon: "wine_bar" },
  { name: "Home Theater", icon: "live_tv" },
  { name: "RV Parking", icon: "rv_hookup" },
  { name: "Guest House", icon: "cottage" },
  { name: "Solar Panels", icon: "solar_power" },
  { name: "Mountain View", icon: "landscape" },
  { name: "Gated Entry", icon: "security" },
];

export interface FeaturesData {
  selected: string[];
  custom: string;
}

interface FeatureSelectionStepProps {
  data: FeaturesData;
  onChange: (data: FeaturesData) => void;
}

export function FeatureSelectionStep({ data, onChange }: FeatureSelectionStepProps) {
  function toggleFeature(name: string) {
    const next = data.selected.includes(name)
      ? data.selected.filter((f) => f !== name)
      : [...data.selected, name];
    onChange({ ...data, selected: next });
  }

  function addCustom(e: React.FormEvent) {
    e.preventDefault();
    const val = data.custom.trim();
    if (!val || data.selected.includes(val)) return;
    onChange({ selected: [...data.selected, val], custom: "" });
  }

  function removeCustom(name: string) {
    onChange({ ...data, selected: data.selected.filter((f) => f !== name) });
  }

  const customFeatures = data.selected.filter((f) => !FEATURE_LIST.find((fl) => fl.name === f));

  return (
    <div className="flex flex-col gap-8 h-full pr-2 pb-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold font-display tracking-tight border-l-4 border-cyan pl-4">Feature Highlights</h2>
        <p className="text-slate-400 pl-4">Select key selling points to highlight in generated marketing media.</p>
      </div>

      <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-8 shadow-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURE_LIST.map((feat) => {
            const active = data.selected.includes(feat.name);
            return (
              <button
                key={feat.name}
                type="button"
                onClick={() => toggleFeature(feat.name)}
                className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all select-none ${
                  active
                    ? "border-cyan bg-cyan/10 shadow-[0_0_15px_rgba(0,209,255,0.15)] text-white"
                    : "border-[#27373a] bg-onyx hover:border-cyan/50 text-slate-400"
                }`}
              >
                <span className={`material-symbols-outlined text-3xl mb-3 transition-colors ${active ? "text-cyan" : "text-slate-500"}`}>
                  {feat.icon}
                </span>
                <span className="text-sm font-medium text-center">{feat.name}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <label className="text-slate-300 text-sm font-semibold ml-1">Additional Custom Features</label>
          <form onSubmit={addCustom} className="flex gap-2">
            <input
              value={data.custom}
              onChange={(e) => onChange({ ...data, custom: e.target.value })}
              className="flex-1 bg-onyx border border-[#27373a] text-slate-100 rounded-lg h-11 px-4 focus:border-cyan outline-none transition-all placeholder:text-slate-600"
              placeholder="Type feature and press Enter..."
            />
            <button type="submit" className="px-4 h-11 bg-cyan/10 border border-cyan/30 text-cyan rounded-lg text-sm font-bold hover:bg-cyan/20 transition-all">
              Add
            </button>
          </form>
          {customFeatures.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {customFeatures.map((f) => (
                <span key={f} className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan/10 border border-cyan/20 text-cyan text-xs rounded-full font-semibold">
                  {f}
                  <button onClick={() => removeCustom(f)} className="hover:text-white transition-colors">×</button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
