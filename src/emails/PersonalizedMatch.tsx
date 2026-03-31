import { Html, Head, Preview, Body, Container, Tailwind, Section, Text } from '@react-email/components';
import { PropertyCard } from './components/PropertyCard';
import { OpenHouseCard } from './components/OpenHouseCard';
import { AgentCard } from './components/AgentCard';
import { Footer } from './components/Footer';
import * as React from 'react';

// Using props so the email can be hydrated dynamically from the CRM
interface PersonalizedMatchEmailProps {
  propertyDetails?: any;
  agentDetails?: any;
  openHouses?: { date: string; time: string }[];
  clientName?: string;
  personalMessage?: string;
}

export const PersonalizedMatchEmail = ({ 
  propertyDetails, 
  agentDetails, 
  openHouses = [
    { date: "Saturday, Oct 24th", time: "1:00 PM - 4:00 PM" }
  ],
  clientName = "Sarah",
  personalMessage = "I was touring this incredible new listing today and it immediately made me think of what you've been looking for. The outdoor entertaining space and the chef's kitchen feel like exactly what we discussed. Let me know if you'd like an exclusive early tour before the open house this weekend!"
}: PersonalizedMatchEmailProps) => {
  return (
    <Tailwind>
      <Html>
        <Head>
          <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
        </Head>
        <Preview>A home I think you'll love</Preview>
        <Body className="bg-gray-100 font-sans p-4 m-0">
          <Container className="bg-white border border-gray-200 mt-10 mb-10 mx-auto rounded-xl shadow-lg p-0 overflow-hidden w-full max-w-[600px]">
             
            <Section className="bg-black py-8 text-center w-full">
              <h1 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }} className="text-white text-5xl font-normal m-0 tracking-widest uppercase px-4">
                Handpicked For You
              </h1>
            </Section>

            {/* Personal Message Section */}
            <Section className="px-8 pt-8 pb-2">
              <Text className="text-gray-900 text-xl font-medium m-0 mb-4">
                Hi {clientName},
              </Text>
              <Text className="text-gray-700 text-base leading-relaxed m-0 italic border-l-4 border-gray-200 pl-4">
                "{personalMessage}"
              </Text>
            </Section>

            <Section className="px-4 mt-6">
              <PropertyCard
               statusBadge="FEATURED LISTING"
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

export default PersonalizedMatchEmail;
