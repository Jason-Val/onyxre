import { Html, Head, Preview, Body, Container, Tailwind, Section } from '@react-email/components';
import { PropertyCard } from './components/PropertyCard';
import { AgentCard } from './components/AgentCard';
import * as React from 'react';

export const DemoEmail = () => {
  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>Component Preview</Preview>
        <Body className="bg-gray-100 font-sans p-4 m-0">
          <Container className="bg-white border border-gray-200 mt-10 mb-10 mx-auto rounded-xl shadow-lg p-0 overflow-hidden w-full max-w-[600px]">
             
            <Section className="bg-blue-600 p-8 text-center text-white">
              <h1 className="text-2xl font-light m-0 tracking-wide uppercase">New Listing Alert</h1>
            </Section>

            <Section className="px-4">
              <PropertyCard
               imageUrl="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
               address="123 Luxury Lane"
               cityStateZip="Beverly Hills, CA 90210"
               price="$5,400,000"
               beds={4}
               baths={5}
               sqft={4200}
               statusBadge="JUST LISTED"
              />
            </Section>

            <Section className="px-4 pb-4">
              <AgentCard
               name="Emily Chen"
               title="Senior Luxury Partner"
               phone="(310) 555-0199"
               email="emily@onyxre.com"
               website="https://onyxre.com"
              />
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default DemoEmail;
