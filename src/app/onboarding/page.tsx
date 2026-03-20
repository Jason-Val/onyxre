"use client";

import { useState, useEffect } from "react";
import { WizardFrame } from "@/components/wizard/WizardFrame";
import { BasicInfoStep } from "@/components/wizard/steps/agent/BasicInfoStep";
import { BrandStyleStep } from "@/components/wizard/steps/agent/BrandStyleStep";
import { AgentA2PStep } from "@/components/wizard/steps/agent/AgentA2PStep";
import { BrokerA2PStep } from "@/components/wizard/steps/agent/BrokerA2PStep";
import { OnboardingProvider, useOnboarding } from "@/components/wizard/steps/agent/OnboardingContext";
import { createClient } from "@/supabase/client";

const AGENT_TIERS = ["Free Agent", "Junior Agent", "Senior Agent"];

const STEPS = [
  { title: "Basic Info & Brokerage" },
  { title: "Style & Brand" },
  { title: "A2P 10DLC Compliance" },
];

function WizardContent() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<string>("");
  const { data, updateData } = useOnboarding();
  const supabase = createClient();

  // Load subscription tier from DB so we can branch the A2P step
  useEffect(() => {
    async function loadTier() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();
      if (!profile?.organization_id) return;
      const { data: org } = await supabase
        .from("organizations")
        .select("subscription_tier")
        .eq("id", profile.organization_id)
        .single();
      if (org?.subscription_tier) {
        setSubscriptionTier(org.subscription_tier);
        updateData({ subscriptionTier: org.subscription_tier });
      }
    }
    loadTier();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAgentTier = AGENT_TIERS.includes(subscriptionTier);

  async function saveAndRedirect(a2pStatus: "completed" | "skipped") {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();
      const orgId = profile?.organization_id;
      if (!orgId) throw new Error("No organization found.");

      // Update org with brand + A2P data
      const { error: orgError } = await supabase
        .from("organizations")
        .update({
          name: data.brokerageName || "My Brokerage",
          logo_url: data.logoUrl || null,
          brand_visual_dna: data.visualDna,
          brand_primary_color: data.primaryColor,
          brand_secondary_color: data.secondaryColor,
          brand_typography: data.typography,
          a2p_status: a2pStatus,
          a2p_campaign_description: data.a2pCampaignDescription || null,
          a2p_sample_message_1: data.a2pSampleMessage1 || null,
          a2p_sample_message_2: data.a2pSampleMessage2 || null,
          commission_split: data.commissionSplit ? parseFloat(data.commissionSplit) : null,
          // Broker-specific
          ...(isAgentTier ? {} : {
            a2p_legal_name: data.a2pLegalName || null,
            a2p_ein: data.a2pEin || null,
            a2p_business_type: data.a2pBusinessType || null,
            a2p_industry: data.a2pIndustry || null,
            a2p_website: data.a2pWebsite || null,
            a2p_address: data.a2pAddress || null,
            a2p_sms_consent: data.a2pSmsConsent,
          }),
        })
        .eq("id", orgId);
      if (orgError) throw orgError;

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          phone_number: data.phoneNumber || null,
          license_number: data.licenseNumber,
          bio: data.professionalBio,
          avatar_url: data.avatarUrl || null,
          role: "AGENT",
          // Agent A2P fields
          ...(isAgentTier ? {
            a2p_legal_name: data.agentLegalName || null,
            a2p_address: data.agentAddress || null,
          } : {}),
        })
        .eq("id", user.id);
      if (profileError) throw profileError;

      window.location.href = "/dashboard";
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      return;
    }
    await saveAndRedirect("completed");
  };

  const handleSkip = async () => {
    await saveAndRedirect("skipped");
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const a2pStep = isAgentTier
    ? <AgentA2PStep onSkip={handleSkip} />
    : <BrokerA2PStep onSkip={handleSkip} />;

  return (
    <div className="flex-1 min-h-screen bg-onyx text-slate-100 flex items-center justify-center">
      <WizardFrame
        title="Agent Onboarding"
        steps={STEPS}
        currentStep={currentStep}
        onNext={handleNext}
        onPrev={handlePrev}
        nextLabel={isSubmitting ? "Saving…" : currentStep === STEPS.length - 1 ? "Complete Setup" : "Continue"}
        isNextDisabled={isSubmitting}
      >
        <BasicInfoStep />
        <BrandStyleStep />
        {a2pStep}
      </WizardFrame>
      {submitError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-6 py-3 shadow-xl z-50">
          {submitError}
        </div>
      )}
    </div>
  );
}

export default function AgentOnboardingWizard() {
  return (
    <OnboardingProvider>
      <WizardContent />
    </OnboardingProvider>
  );
}
