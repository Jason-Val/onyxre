"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface OnboardingData {
  // BasicInfoStep
  firstName: string;
  lastName: string;
  phoneNumber: string;
  brokerageName: string;
  licenseNumber: string;
  avatarUrl: string;
  professionalBio: string;
  logoUrl: string;
  commissionSplit: string;
  bufferAccessToken: string;

  // BrandStyleStep
  visualDna: string;
  primaryColor: string;
  secondaryColor: string;
  typography: string;

  // Subscription (loaded from DB, not entered in wizard)
  subscriptionTier: string;

  // Broker A2P
  a2pLegalName: string;
  a2pEin: string;
  a2pBusinessType: string;
  a2pIndustry: string;
  a2pWebsite: string;
  a2pAddress: string;
  a2pSmsConsent: boolean;

  // Agent A2P (sole-proprietor)
  agentLegalName: string;
  agentAddress: string;
  // SSN is intentionally NOT stored here — ephemeral only

  // Shared Messaging Intent (both agent + broker)
  a2pCampaignDescription: string;
  a2pSampleMessage1: string;
  a2pSampleMessage2: string;
}

export const defaultOnboardingData: OnboardingData = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  brokerageName: "",
  licenseNumber: "",
  avatarUrl: "",
  professionalBio: "",
  logoUrl: "",
  commissionSplit: "",
  bufferAccessToken: "",
  visualDna: "Modern",
  primaryColor: "#00D1FF",
  secondaryColor: "#475569",
  typography: "Inter (Sans-Serif)",
  subscriptionTier: "",
  a2pLegalName: "",
  a2pEin: "",
  a2pBusinessType: "Sole Proprietorship",
  a2pIndustry: "Real Estate",
  a2pWebsite: "",
  a2pAddress: "",
  a2pSmsConsent: false,
  agentLegalName: "",
  agentAddress: "",
  a2pCampaignDescription:
    "Reaching out to interested home buyers and sellers to provide property information, schedule showings, and offer market updates.",
  a2pSampleMessage1:
    "Hi [Name], this is [Agent Name] with OnyxRE. I saw you were looking at 123 Main St—would you like me to send over the disclosures or schedule a private tour?",
  a2pSampleMessage2:
    "Hi [Name], just a quick update—the price just dropped on the home we toured yesterday. Let me know if you want to take another look!",
};

interface OnboardingContextProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

const OnboardingContext = createContext<OnboardingContextProps | undefined>(undefined);

export function OnboardingProvider({
  children,
  initialData = {},
}: {
  children: ReactNode;
  initialData?: Partial<OnboardingData>;
}) {
  const [data, setData] = useState<OnboardingData>({ ...defaultOnboardingData, ...initialData });

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  return (
    <OnboardingContext.Provider value={{ data, updateData }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
