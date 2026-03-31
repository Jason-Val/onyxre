import { Section, Img, Text } from '@react-email/components';
import * as React from 'react';

// Automatically points to your production domain or falls back to your main site
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 
  ? process.env.NEXT_PUBLIC_SITE_URL 
  : "";

export const Footer = () => {
  return (
    <Section className="w-full bg-[#0B0E14] text-center px-4 py-8 border-t border-[#27373a]" align="center">
      <Img 
        src={`${baseUrl}/static/specularos-logo.png`} 
        alt="Specular OS" 
        width="220"
        className="mx-auto" 
      />
      <Text className="text-slate-400 text-[10px] mt-6 tracking-widest uppercase">
        © copyright 2026 specularOS.com
      </Text>
    </Section>
  );
};
