import { Section, Row, Column, Img, Text, Button, Link } from '@react-email/components';
import * as React from 'react';

interface AgentCardProps {
  name: string;
  title?: string;
  headshotUrl?: string;
  phone: string;
  email: string;
  website?: string;
  brokerageLogo?: string;
}

export const AgentCard = ({
  name = "Jane Agent",
  title = "Real Estate Professional",
  headshotUrl = "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  phone = "(555) 555-5555",
  email = "jane@example.com",
  website,
  brokerageLogo,
}: AgentCardProps) => {
  // Strip non-numeric characters for tel link
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  return (
    <Section className="bg-gray-50 rounded-xl p-6 md:p-8 w-full max-w-[600px] mx-auto my-8 border border-gray-200">
      <Row>
        <Column className="w-[120px] align-top text-center hidden sm:table-cell">
          <Img 
            src={headshotUrl} 
            alt={name}
            width="96" 
            height="96" 
            className="rounded-full w-24 h-24 object-cover border-2 border-white shadow-sm inline-block"
          />
        </Column>
        <Column className="align-top sm:pl-6">
          {/* Mobile headshot (optional if layout allows) */}
          <Section className="sm:hidden block mb-4 text-center">
             <Img 
              src={headshotUrl} 
              alt={name}
              width="80" 
              height="80" 
              className="rounded-full w-20 h-20 object-cover border-2 border-white shadow-sm inline-block"
            />
          </Section>

          <Text className="text-xl font-medium text-gray-900 m-0 mb-1">{name}</Text>
          <Text className="text-sm text-gray-500 uppercase tracking-wider m-0 mb-4">{title}</Text>
          
          <Text className="text-sm text-gray-600 m-0 mb-2">
            <strong>Phone:</strong> <Link href={`tel:${cleanPhone}`} className="text-blue-600 no-underline">{phone}</Link>
          </Text>
          
          <Text className="text-sm text-gray-600 m-0 mb-4">
            <strong>Email:</strong> <Link href={`mailto:${email}`} className="text-blue-600 no-underline">{email}</Link>
          </Text>

          {/* Call button with tel: link */}
          <Section className="mt-4 mb-4">
            <Button
              href={`tel:${cleanPhone}`}
              className="bg-black text-white px-6 py-3 rounded-md text-sm font-medium no-underline inline-block text-center w-full max-w-[250px]"
            >
              Call {name.split(' ')[0]} Now
            </Button>
          </Section>

          {website && (
            <Section className="mt-2 text-center sm:text-left">
              <Link href={website} className="text-blue-600 text-sm font-medium no-underline">
                Visit Website &rarr;
              </Link>
            </Section>
          )}

          {brokerageLogo && (
            <Section className="mt-6 pt-6 border-t border-gray-200 text-center sm:text-left">
              <Img src={brokerageLogo} alt="Brokerage Logo" width="100" className="opacity-70" />
            </Section>
          )}
        </Column>
      </Row>
    </Section>
  );
};

export default AgentCard;
