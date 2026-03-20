"use client";

import { useState } from "react";
import { WizardFrame } from "@/components/wizard/WizardFrame";
import { ContactDetailsStep } from "@/components/wizard/steps/contact/ContactDetailsStep";
import { LeadTypeStep } from "@/components/wizard/steps/contact/LeadTypeStep";
import { CampaignPilotStep } from "@/components/wizard/steps/contact/CampaignPilotStep";

const STEPS = [
  { title: "Contact Details" },
  { title: "Lead Type" },
  { title: "Campaign Pilot" },
];

export default function ContactOnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      window.location.href = "/crm";
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
        nextLabel={currentStep === STEPS.length - 1 ? "Save & Launch" : "Continue"}
      >
        <ContactDetailsStep />
        <LeadTypeStep />
        <CampaignPilotStep />
      </WizardFrame>
    </div>
  );
}
