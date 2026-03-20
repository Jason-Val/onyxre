import { useRef, useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    google: any;
  }
}

export interface AddressData {
  address: string;
  beds: number;
  baths: number;
  sqft: string;
  yearBuilt: string;
  price: string;
}

interface AddressStepProps {
  data: AddressData;
  onChange: (data: AddressData) => void;
}

export function AddressStep({ data, onChange }: AddressStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.google && inputRef.current && !autocompleteRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "us" },
        fields: ["address_components", "formatted_address"],
        types: ["address"],
      });

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace();
        if (place?.formatted_address) {
          onChange({ ...data, address: place.formatted_address });
        }
      });
    }
  }, [data, onChange]);

  function update(field: keyof AddressData, value: string | number) {
    onChange({ ...data, [field]: value });
  }

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  return (
    <div className="flex flex-col gap-8 h-full pr-2 pb-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold font-display tracking-tight border-l-4 border-cyan pl-4">Property Address &amp; Details</h2>
        <p className="text-slate-400 pl-4">Locate the property and confirm core specifications.</p>
      </div>

      <div className="bg-onyx-surface border border-[#27373a] rounded-xl p-8 shadow-2xl">
        <div className="flex flex-col gap-2 mb-8 relative">
          <label className="text-slate-300 text-sm font-semibold ml-1">Street Address</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">search</span>
            <input
              ref={inputRef}
              value={data.address}
              onChange={(e) => update("address", e.target.value)}
              className="w-full bg-onyx border border-[#27373a] text-slate-100 rounded-lg h-12 pl-12 pr-4 focus:border-cyan outline-none transition-all placeholder:text-slate-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
              placeholder="Start typing property address..."
            />
            {googleMapsApiKey && (
              <Script
                src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`}
                onLoad={() => {
                  if (window.google && inputRef.current && !autocompleteRef.current) {
                    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
                      componentRestrictions: { country: "us" },
                      fields: ["address_components", "formatted_address"],
                      types: ["address"],
                    });
                    autocompleteRef.current.addListener("place_changed", () => {
                      const place = autocompleteRef.current?.getPlace();
                      if (place?.formatted_address) {
                        onChange({ ...data, address: place.formatted_address });
                      }
                    });
                  }
                }}
              />
            )}
          </div>
          <p className="text-xs text-slate-500 text-right mt-1">Enter full street address</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col gap-2">
            <label className="text-slate-300 text-sm font-semibold ml-1">List Price ($)</label>
            <input
              type="number"
              value={data.price}
              onChange={(e) => update("price", e.target.value)}
              placeholder="e.g. 1250000"
              className="w-full bg-onyx border border-[#27373a] text-slate-100 rounded-lg h-12 px-4 focus:border-cyan outline-none transition-all placeholder:text-slate-600"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-slate-300 text-sm font-semibold ml-1">Year Built</label>
            <input
              type="number"
              value={data.yearBuilt}
              onChange={(e) => update("yearBuilt", e.target.value)}
              placeholder="e.g. 1995"
              className="w-full bg-onyx border border-[#27373a] text-slate-100 rounded-lg h-12 px-4 focus:border-cyan outline-none transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-slate-300 text-sm font-semibold ml-1">Beds</label>
            <input
              type="number"
              min={1}
              value={data.beds}
              onChange={(e) => update("beds", parseInt(e.target.value) || 1)}
              className="w-full bg-onyx border border-[#27373a] text-slate-100 rounded-lg h-12 px-4 focus:border-cyan outline-none transition-all"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-slate-300 text-sm font-semibold ml-1">Baths</label>
            <input
              type="number"
              min={1}
              step={0.5}
              value={data.baths}
              onChange={(e) => update("baths", parseFloat(e.target.value) || 1)}
              className="w-full bg-onyx border border-[#27373a] text-slate-100 rounded-lg h-12 px-4 focus:border-cyan outline-none transition-all"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-slate-300 text-sm font-semibold ml-1">Sq Ft</label>
            <input
              value={data.sqft}
              onChange={(e) => update("sqft", e.target.value)}
              placeholder="e.g. 2,400"
              className="w-full bg-onyx border border-[#27373a] text-slate-100 rounded-lg h-12 px-4 focus:border-cyan outline-none transition-all placeholder:text-slate-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
