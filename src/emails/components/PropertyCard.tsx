import { Section, Row, Column, Img, Text, Button } from '@react-email/components';
import * as React from 'react';

interface PropertyCardProps {
  imageUrl?: string;
  address: string;
  cityStateZip: string;
  price: string;
  priceReduction?: string;
  beds?: number | string;
  baths?: number | string;
  sqft?: number | string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  statusBadge?: string; // e.g., "JUST LISTED", "PRICE REDUCTION"
}

export const PropertyCard = ({
  imageUrl = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  address = "123 Luxury Lane",
  cityStateZip = "Beverly Hills, CA 90210",
  price = "$5,400,000",
  priceReduction,
  beds = 4,
  baths = 5,
  sqft = 4200,
  description = "Experience unparalleled luxury in this stunning Beverly Hills estate. Completely reimagined with exquisite finishes, featuring a state-of-the-art chef's kitchen, soaring ceilings, and a spectacular backyard oasis perfect for entertaining.",
  ctaText = "View Property Details",
  ctaLink = "#",
  statusBadge = "JUST LISTED",
}: PropertyCardProps) => {
  return (
    <Section className="bg-white border border-gray-200 rounded-lg overflow-hidden w-full max-w-[600px] mx-auto my-6 shadow-sm">
      {imageUrl && (
        <Img src={imageUrl} alt={address} width="600" height="300" className="w-full h-[300px] object-cover" />
      )}
      <Section className="p-6">
        {statusBadge && (
          <Text className="text-xs font-bold tracking-widest text-blue-500 uppercase m-0 mb-2">
            {statusBadge}
          </Text>
        )}
        <Text className="text-3xl font-light text-gray-900 m-0 mb-1">
          {price} 
          {priceReduction && (
            <span className="text-red-500 font-normal italic text-xl ml-2">
              (-{priceReduction})
            </span>
          )}
        </Text>
        <Text className="text-gray-600 text-lg m-0 mb-4">{address}<br/>{cityStateZip}</Text>
        
        {(beds || baths || sqft) && (
          <Row className="border-t border-b border-gray-200 py-4 mb-6 mt-4">
            {beds && (
              <Column className="text-center w-1/3">
                <Text className="m-0 text-gray-900 font-medium text-lg">{beds}</Text>
                <Text className="m-0 text-gray-500 text-xs uppercase tracking-wider">Beds</Text>
              </Column>
            )}
            {baths && (
              <Column className="text-center w-1/3 border-l border-gray-200">
                <Text className="m-0 text-gray-900 font-medium text-lg">{baths}</Text>
                <Text className="m-0 text-gray-500 text-xs uppercase tracking-wider">Baths</Text>
              </Column>
            )}
            {sqft && (
              <Column className="text-center w-1/3 border-l border-gray-200">
                <Text className="m-0 text-gray-900 font-medium text-lg">{sqft}</Text>
                <Text className="m-0 text-gray-500 text-xs uppercase tracking-wider">Sqft</Text>
              </Column>
            )}
          </Row>
        )}

        {description && (
          <Text className="text-gray-600 text-base leading-relaxed m-0 mb-6">
            {description}
          </Text>
        )}

        <Section className="text-center mt-6">
          <Button
            href={ctaLink}
            className="bg-gray-900 text-white px-8 py-3 rounded-md font-medium no-underline inline-block text-center"
          >
            {ctaText}
          </Button>
        </Section>
      </Section>
    </Section>
  );
};

export default PropertyCard;
