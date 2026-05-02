import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";

interface AlertItem {
  message: string;
  details?: string;
}

interface AlertSummaryEmailProps {
  facilityName: string;
  date: string;
  outOfStock: AlertItem[];
  lowStock: AlertItem[];
  expiringsSoon: AlertItem[];
  expired: AlertItem[];
  alertsUrl: string;
}

export function AlertSummaryEmail({
  facilityName,
  date,
  outOfStock,
  lowStock,
  expiringsSoon,
  expired,
  alertsUrl,
}: AlertSummaryEmailProps) {
  const totalAlerts =
    outOfStock.length + lowStock.length + expiringsSoon.length + expired.length;

  return (
    <Html>
      <Head />
      <Preview>
        MediStock Alert Summary - {totalAlerts.toString()} alert
        {totalAlerts !== 1 ? "s" : ""} require attention
      </Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto py-8 px-4 max-w-xl">
            <Section className="bg-white rounded-lg shadow-sm p-8">
              {/* Header */}
              <Heading className="text-2xl font-bold text-gray-900 mb-2">
                MediStock Alert Summary
              </Heading>
              <Text className="text-gray-600 mt-0 mb-6">{date}</Text>

              <Text className="text-gray-700 mb-6">
                Hi <strong>{facilityName}</strong> Team,
              </Text>

              <Text className="text-gray-700 mb-6">
                This is your daily inventory alert summary. The following issues
                were detected and require attention:
              </Text>

              {/* Out of Stock Section */}
              {outOfStock.length > 0 && (
                <Section className="mb-6">
                  <Heading className="text-lg font-semibold text-red-600 mb-3">
                    Out of Stock ({outOfStock.length})
                  </Heading>
                  <Section className="bg-red-50 rounded-md p-4 border border-red-200">
                    {outOfStock.map((item, index) => (
                      <Text key={index} className="text-gray-800 my-1">
                        • {item.message}
                        {item.details && (
                          <span className="text-gray-500 text-sm">
                            {" "}
                            - {item.details}
                          </span>
                        )}
                      </Text>
                    ))}
                    <Text className="text-red-700 text-sm mt-3 mb-0 font-medium">
                      Recommendation: Restock these medicines immediately to
                      avoid service disruption.
                    </Text>
                  </Section>
                </Section>
              )}

              {/* Low Stock Section */}
              {lowStock.length > 0 && (
                <Section className="mb-6">
                  <Heading className="text-lg font-semibold text-orange-600 mb-3">
                    Low Stock ({lowStock.length})
                  </Heading>
                  <Section className="bg-orange-50 rounded-md p-4 border border-orange-200">
                    {lowStock.map((item, index) => (
                      <Text key={index} className="text-gray-800 my-1">
                        • {item.message}
                        {item.details && (
                          <span className="text-gray-500 text-sm">
                            {" "}
                            - {item.details}
                          </span>
                        )}
                      </Text>
                    ))}
                    <Text className="text-orange-700 text-sm mt-3 mb-0 font-medium">
                       Recommendation: Plan to restock these medicines soon to
                      maintain adequate inventory levels.
                    </Text>
                  </Section>
                </Section>
              )}

              {/* Expiring Soon Section */}
              {expiringsSoon.length > 0 && (
                <Section className="mb-6">
                  <Heading className="text-lg font-semibold text-orange-600 mb-3">
                    Expiring Soon ({expiringsSoon.length})
                  </Heading>
                  <Section className="bg-orange-50 rounded-md p-4 border border-orange-200">
                    {expiringsSoon.map((item, index) => (
                      <Text key={index} className="text-gray-800 my-1">
                        • {item.message}
                        {item.details && (
                          <span className="text-gray-500 text-sm">
                            {" "}
                            - {item.details}
                          </span>
                        )}
                      </Text>
                    ))}
                    <Text className="text-orange-700 text-sm mt-3 mb-0 font-medium">
                       Recommendation: Prioritize dispensing medicines from
                      these batches before they expire.
                    </Text>
                  </Section>
                </Section>
              )}

              {/* Expired Section */}
              {expired.length > 0 && (
                <Section className="mb-6">
                  <Heading className="text-lg font-semibold text-red-600 mb-3">
                    Expired ({expired.length})
                  </Heading>
                  <Section className="bg-red-50 rounded-md p-4 border border-red-200">
                    {expired.map((item, index) => (
                      <Text key={index} className="text-gray-800 my-1">
                        • {item.message}
                        {item.details && (
                          <span className="text-gray-500 text-sm">
                            {" "}
                            - {item.details}
                          </span>
                        )}
                      </Text>
                    ))}
                    <Text className="text-red-700 text-sm mt-3 mb-0 font-medium">
                       Recommendation: Record these batches as wastage
                      immediately. Do not dispense expired medicines.
                    </Text>
                  </Section>
                </Section>
              )}

              <Hr className="my-6 border-gray-200" />

              {/* CTA Button */}
              <Section className="text-center">
                <Link
                  href={alertsUrl}
                  className="inline-block bg-blue-600 text-white font-semibold py-3 px-6 rounded-md no-underline"
                >
                  View All Alerts
                </Link>
              </Section>

              <Hr className="my-6 border-gray-200" />

              {/* Footer */}
              <Text className="text-gray-500 text-sm text-center">
                This is an automated message from MediStock. Please do not reply
                to this email.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default AlertSummaryEmail;
