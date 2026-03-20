"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { WizardFrame } from "@/components/wizard/WizardFrame";
import { AddressStep, AddressData } from "@/components/wizard/steps/property/AddressStep";
import { FeatureSelectionStep, FeaturesData } from "@/components/wizard/steps/property/FeatureSelectionStep";
import { MediaUploadStep, PropertyImage } from "@/components/wizard/steps/property/MediaUploadStep";
import { createClient } from "@/supabase/client";

const STEPS = [
  { title: "Address & Details" },
  { title: "Feature Highlights" },
  { title: "Media Upload" },
];

const DEFAULT_ADDRESS: AddressData = { address: "", beds: 1, baths: 1, sqft: "", yearBuilt: "", price: "" };
const DEFAULT_FEATURES: FeaturesData = { selected: [], custom: "" };

// ── Escape Modal ───────────────────────────────────────────────
function EscapeModal({
  onSaveDraft,
  onDiscard,
  onCancel,
  saving,
}: {
  onSaveDraft: () => void;
  onDiscard: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onCancel}>
      <div
        className="bg-[#0D1117] border border-[#27373a] rounded-2xl p-8 max-w-sm w-full shadow-2xl flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-white">Leave Listing Setup?</h2>
          <p className="text-slate-400 text-sm">Your progress has been saved. Choose what to do next.</p>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={onSaveDraft}
            disabled={saving}
            className="w-full py-3 bg-cyan text-onyx font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            {saving ? "Saving…" : "Save as Draft"}
          </button>
          <button
            onClick={onDiscard}
            className="w-full py-3 border border-red-400/40 text-red-400 font-bold rounded-xl hover:bg-red-400/10 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
            Discard Property
          </button>
          <button
            onClick={onCancel}
            className="w-full py-3 border border-slate-700 text-slate-400 font-semibold rounded-xl hover:border-slate-500 hover:text-white transition-all"
          >
            Continue Editing
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Inner component that uses searchParams ─────────────────────
function PropertyWizardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("propertyId"); // set when resuming a draft
  const supabase = createClient();

  const [currentStep, setCurrentStep] = useState(0);
  const [propertyId, setPropertyId] = useState<string | null>(editId);
  const [addressData, setAddressData] = useState<AddressData>(DEFAULT_ADDRESS);
  const [featuresData, setFeaturesData] = useState<FeaturesData>(DEFAULT_FEATURES);
  const [wizardImages, setWizardImages] = useState<PropertyImage[]>([]);
  const [showEscape, setShowEscape] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initializing, setInitializing] = useState(!!editId);

  // Load existing draft if resuming
  useEffect(() => {
    if (!editId) return;
    async function loadDraft() {
      const { data } = await supabase
        .from("properties")
        .select("address_line1,price,bedrooms,bathrooms,sq_ft,year_built,features")
        .eq("id", editId!)
        .single();
      if (data) {
        setAddressData({
          address: data.address_line1 ?? "",
          beds: data.bedrooms ?? 1,
          baths: data.bathrooms ?? 1,
          sqft: data.sq_ft ? String(data.sq_ft) : "",
          yearBuilt: data.year_built ? String(data.year_built) : "",
          price: data.price ? String(data.price) : "",
        });
        setFeaturesData({ selected: data.features ?? [], custom: "" });
      }
      // Load existing images
      const { data: imgs } = await supabase
        .from("property_images")
        .select("id,url,storage_path,sort_order")
        .eq("property_id", editId!)
        .order("sort_order");
      if (imgs) setWizardImages(imgs as PropertyImage[]);
      setInitializing(false);
    }
    loadDraft();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  // Upsert property as DRAFT — returns the property id
  const upsertDraft = useCallback(async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Get org id
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();
    if (!profile?.organization_id) return null;

    const payload = {
      agent_id: user.id,
      organization_id: profile.organization_id,
      status: "DRAFT" as const,
      address_line1: addressData.address || null,
      price: addressData.price ? parseFloat(addressData.price) : null,
      bedrooms: addressData.beds || null,
      bathrooms: addressData.baths || null,
      sq_ft: addressData.sqft ? parseInt(addressData.sqft.replace(/,/g, "")) : null,
      year_built: addressData.yearBuilt ? parseInt(addressData.yearBuilt) : null,
      features: featuresData.selected,
    };

    if (propertyId) {
      await supabase.from("properties").update(payload).eq("id", propertyId);
      return propertyId;
    } else {
      const { data } = await supabase.from("properties").insert(payload).select("id").single();
      if (data) { setPropertyId(data.id); return data.id; }
      return null;
    }
  }, [supabase, addressData, featuresData, propertyId]);

  // Advance to next step — auto-save draft on each step
  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      await upsertDraft();
      setCurrentStep((p) => p + 1);
    } else {
      // Final step: mark ACTIVE
      setSaving(true);
      const id = await upsertDraft();
      if (id) {
        await supabase.from("properties").update({ status: "ACTIVE" }).eq("id", id);
      }
      setSaving(false);
      router.push("/properties");
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((p) => p - 1);
  };

  // Escape → save draft and navigate away
  const handleSaveDraft = async () => {
    setSaving(true);
    await upsertDraft();
    setSaving(false);
    router.push("/properties");
  };

  // Escape → hard-delete this draft property
  const handleDiscard = async () => {
    if (propertyId) {
      await supabase.from("properties").delete().eq("id", propertyId);
    }
    router.push("/properties");
  };

  if (initializing) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="material-symbols-outlined text-cyan text-4xl animate-spin">autorenew</span>
      </div>
    );
  }

  return (
    <>
      {showEscape && (
        <EscapeModal
          onSaveDraft={handleSaveDraft}
          onDiscard={handleDiscard}
          onCancel={() => setShowEscape(false)}
          saving={saving}
        />
      )}
      <div className="flex-1 bg-onyx text-slate-100 flex items-center justify-center mt-8">
        <WizardFrame
          title="Add New Listing"
          steps={STEPS}
          currentStep={currentStep}
          onNext={handleNext}
          onPrev={handlePrev}
          onEscape={() => setShowEscape(true)}
          isNextDisabled={saving}
          nextLabel={currentStep === STEPS.length - 1 ? (saving ? "Saving…" : "Save Property") : "Continue"}
        >
          <AddressStep data={addressData} onChange={setAddressData} />
          <FeatureSelectionStep data={featuresData} onChange={setFeaturesData} />
          <MediaUploadStep
            propertyId={propertyId}
            images={wizardImages}
            onImagesChange={setWizardImages}
          />
        </WizardFrame>
      </div>
    </>
  );
}

// ── Page export wraps in Suspense for useSearchParams ──────────
export default function PropertyOnboardingWizard() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center">
        <span className="material-symbols-outlined text-cyan text-4xl animate-spin">autorenew</span>
      </div>
    }>
      <PropertyWizardInner />
    </Suspense>
  );
}
