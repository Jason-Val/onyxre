"use client";

import { useState } from "react";
import { WizardFrame } from "@/components/wizard/WizardFrame";
import { ContactDetailsStep } from "@/components/wizard/steps/contact/ContactDetailsStep";
import { LeadTypeStep } from "@/components/wizard/steps/contact/LeadTypeStep";
import { CampaignPilotStep } from "@/components/wizard/steps/contact/CampaignPilotStep";
import { useRouter } from "next/navigation";

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  heatIndex: string | null;
  leadType: string | null;
  timeline: string | null;
  a2pOptIn: boolean;
  notes: string;
  actionType: "JUST_SAVE" | "AI_CAMPAIGN" | "PROPERTY_BLAST" | null;
  selectedPropertyId: string | null;
  propertySubtype: string | null;
}

const STEPS = [
  { title: "Contact Details" },
  { title: "Lead Type" },
  { title: "Campaign Pilot" },
];

export default function ContactOnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    heatIndex: null,
    leadType: null,
    timeline: null,
    a2pOptIn: true,
    notes: "",
    actionType: null,
    selectedPropertyId: null,
    propertySubtype: null,
  });

  const updateFormData = (updates: Partial<ContactFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const isStepValid = () => {
    if (currentStep === 0) {
      return (
        formData.firstName.trim() !== "" &&
        formData.lastName.trim() !== "" &&
        formData.email.trim() !== "" &&
        formData.heatIndex !== null
      );
    }
    if (currentStep === 1) {
      return formData.leadType !== null && formData.timeline !== null;
    }
    if (currentStep === 2) {
      if (formData.actionType === "JUST_SAVE") return true;
      if (formData.actionType === "AI_CAMPAIGN") return true;
      if (formData.actionType === "PROPERTY_BLAST") {
        return formData.selectedPropertyId !== null && formData.propertySubtype !== null;
      }
      return formData.actionType !== null;
    }
    return true;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/crm/contacts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/crm");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create contact");
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="flex-1 bg-onyx text-slate-100 flex items-center justify-center mt-8">
      <WizardFrame
        title="New Contact"
        steps={STEPS}
        currentStep={currentStep}
        onNext={handleNext}
        onPrev={handlePrev}
        onEscape={() => router.push("/crm")}
        isNextDisabled={!isStepValid() || isSubmitting}
        nextLabel={
          isSubmitting 
            ? "Saving..." 
            : currentStep === STEPS.length - 1 
              ? (formData.actionType === "JUST_SAVE" ? "Save Contact" : "Save & Launch") 
              : "Continue"
        }
      >
        <ContactDetailsStep data={formData} update={updateFormData} />
        <LeadTypeStep data={formData} update={updateFormData} />
        <CampaignPilotStep data={formData} update={updateFormData} />
      </WizardFrame>
    </div>
  );
}
