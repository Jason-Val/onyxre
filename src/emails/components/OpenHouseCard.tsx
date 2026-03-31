import { Section, Row, Column, Text } from '@react-email/components';
import * as React from 'react';

interface OpenHouseSchedule {
  date: string;
  time: string;
}

interface OpenHouseCardProps {
  schedule?: OpenHouseSchedule[];
}

export const OpenHouseCard = ({
  schedule = [
    { date: "Saturday, Oct 24th", time: "1:00 PM - 4:00 PM" },
    { date: "Sunday, Oct 25th", time: "1:00 PM - 4:00 PM" }
  ]
}: OpenHouseCardProps) => {
  if (!schedule || schedule.length === 0) return null;

  return (
    <Section className="bg-white border border-gray-200 rounded-xl w-full max-w-[600px] mx-auto my-4 shadow-sm overflow-hidden">
      <Section className="bg-gray-50 border-b border-gray-200 p-4 text-center">
        <Text className="m-0 tracking-widest text-sm font-bold uppercase text-gray-900">
          Open House Schedule
        </Text>
      </Section>
      <Section className="px-6 py-2 w-full">
        {schedule.map((item, index) => (
          <Row 
            key={index} 
            className={`py-4 w-full ${index !== schedule.length - 1 ? 'border-b border-gray-100' : ''}`}
          >
            <Column className="w-[50%] align-middle text-left pl-2">
              <Text className="m-0 text-gray-900 font-medium text-lg">
                {item.date}
              </Text>
            </Column>
            <Column className="w-[50%] align-middle text-right pr-2">
              <Text className="m-0 text-gray-600 font-medium text-base">
                {item.time}
              </Text>
            </Column>
          </Row>
        ))}
      </Section>
    </Section>
  );
};

export default OpenHouseCard;
