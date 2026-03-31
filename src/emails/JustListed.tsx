import { Html, Head, Preview, Body, Container, Tailwind, Section } from '@react-email/components';
import { PropertyCard } from './components/PropertyCard';
import { AgentCard } from './components/AgentCard';
import { OpenHouseCard } from './components/OpenHouseCard';
import { Footer } from './components/Footer';
import * as React from 'react';

// Using props so the email can be hydrated dynamically from the CRM
interface JustListedEmailProps {
  propertyDetails?: any;
  agentDetails?: any;
  openHouses?: { date: string; time: string }[];
}

export const JustListedEmail = ({ propertyDetails, agentDetails, openHouses }: JustListedEmailProps) => {
  return (
    <Tailwind>
      <Html>
        <Head>
          <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
        </Head>
        <Preview>Just Listed: See our newest property!</Preview>
        <Body className="bg-gray-100 font-sans p-4 m-0">
          <Container className="bg-white border border-gray-200 mt-10 mb-10 mx-auto rounded-xl shadow-lg p-0 overflow-hidden w-full max-w-[600px]">
             
            <Section className="bg-black py-8 text-center w-full">
              <h1 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }} className="text-white text-5xl font-normal m-0 tracking-widest uppercase">
                Just Listed
              </h1>
            </Section>

            <Section className="px-4 mt-2">
              <PropertyCard
               statusBadge="NEW LISTING"
               {...propertyDetails}
              />
            </Section>

            <Section className="px-4">
              <OpenHouseCard schedule={openHouses} />
            </Section>

            <Section className="px-4 pb-4">
              <AgentCard {...agentDetails} />
            </Section>

            <Footer />
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
};

export default JustListedEmail;
