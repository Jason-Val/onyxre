import { Html, Head, Preview, Body, Container, Tailwind, Section } from '@react-email/components';
import { AgentCard } from './components/AgentCard';
import { Footer } from './components/Footer';
import * as React from 'react';

interface AINurtureEmailProps {
  contentHtml: string;
  agentDetails: {
    name: string;
    title?: string;
    headshotUrl?: string;
    phone: string;
    email: string;
    website?: string;
    brokerageLogo?: string;
  };
}

export const AINurtureEmail = ({
  contentHtml = "<p>Hello there,</p><p>Just checking in on your real estate search. Let me know if I can help!</p>",
  agentDetails = {
    name: "Jane Agent",
    title: "Real Estate Professional",
    phone: "(555) 555-5555",
    email: "jane@example.com",
  }
}: AINurtureEmailProps) => {
  // A brief preview text extracted from the HTML or generic
  const cleanPreview = "A message regarding your real estate search.";

  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>{cleanPreview}</Preview>
        <Body className="bg-gray-100 font-sans p-4 m-0">
          <Container className="bg-white border border-gray-200 mt-10 mb-10 mx-auto rounded-xl shadow-lg p-0 overflow-hidden w-full max-w-[600px]">
             
            <Section className="px-8 py-8 text-gray-800 text-base leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
            </Section>

            <Section className="px-4 pb-4 border-t border-gray-100 pt-8">
              <AgentCard
                name={agentDetails.name}
                title={agentDetails.title}
                phone={agentDetails.phone}
                email={agentDetails.email}
                headshotUrl={agentDetails.headshotUrl}
                website={agentDetails.website}
                brokerageLogo={agentDetails.brokerageLogo}
              />
            </Section>

            <Footer />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default AINurtureEmail;
