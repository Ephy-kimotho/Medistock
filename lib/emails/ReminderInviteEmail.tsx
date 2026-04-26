import { format } from "date-fns";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Text,
  Preview,
  Section,
  Tailwind,
  Button,
  Hr,
} from "@react-email/components";

type Role = "user" | "admin" | "auditor" | "inventory_manager" | "hr";

interface ReminderEmailProps {
  name?: string;
  email: string;
  employeeId: string;
  inviteURL: string;
  role: Role;
  expiryDate: Date;
  invitor?: string;
}

function formatRole(role: Role): string {
  const roleMap: Record<Role, string> = {
    admin: "Administrator",
    hr: "Human Resources",
    inventory_manager: "Inventory Manager",
    user: "Pharmacist",
    auditor: "Auditor",
  };
  return roleMap[role] || role;
}

function ReminderEmail({
  name = "there",
  email,
  employeeId,
  invitor = "an admin",
  inviteURL,
  role = "user",
  expiryDate,
}: ReminderEmailProps) {
  const formattedExpiry = format(expiryDate, "MMMM d, yyyy 'at' h:mm a");

  return (
    <Html lang="en">
      <Head />
      <Preview>Reminder: Your MediStock invitation is waiting</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: "#0077B6",
              },
            },
          },
        }}
      >
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white mx-auto my-10 py-10 px-8 max-w-3xl rounded-lg">
            <Section className="text-center w-full mb-4">
              <Heading
                as="h1"
                className="text-gray-900 font-bold text-2xl tracking-tight mb-4"
              >
                MediStock
              </Heading>
            </Section>

            {/* Reminder Badge */}
            <Section className="text-center mb-4">
              <Text className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                Reminder
              </Text>
            </Section>

            <Section className="mb-4">
              <Heading
                as="h3"
                className="text-gray-800 font-medium text-lg mb-4"
              >
                Hi {name}, your invitation is still waiting!
              </Heading>

              <Text className="text-gray-700 text-base leading-7 mb-4">
                This is a friendly reminder that {invitor} has invited you to
                join MediStock. Your account is ready to be activated.
              </Text>

              <Text className="text-gray-700 text-base leading-7 mb-4">
                MediStock is a pharmaceutical inventory management system that
                helps health centers track medicines, manage stock levels, and
                generate reports.
              </Text>
            </Section>

            {/* Employee Details Card */}
            <Section className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
              <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-4">
                Your Employee Details
              </Text>

              <Text className="text-gray-700 text-base mb-2">
                <strong>Name:</strong> {name}
              </Text>
              <Text className="text-gray-700 text-base mb-2">
                <strong>Email:</strong> {email}
              </Text>
              <Text className="text-gray-700 text-base mb-2">
                <strong>Role:</strong> {formatRole(role)}
              </Text>
              <Text className="text-gray-700 text-base mb-0">
                <strong>Employee ID:</strong> {employeeId}
              </Text>
            </Section>

            {/* Urgency Message */}
            <Section className="bg-amber-50 rounded-lg p-4 mb-6 border border-amber-200">
              <Text className="text-amber-800 text-sm leading-6 mb-0">
                Please accept this invitation soon. It will expire on{" "}
                <strong>{formattedExpiry}</strong>.
              </Text>
            </Section>

            {/* CTA Button */}
            <Section className="text-center py-2 mb-4">
              <Button
                href={inviteURL}
                className="bg-brand text-white py-4 px-8 rounded-lg inline-block text-xl font-bold"
              >
                Accept Invitation
              </Button>
            </Section>

            <Hr className="border-gray-200 my-5" />

            {/* Post-Acceptance Instructions */}
            <Section className="bg-blue-50 rounded-lg p-6 mb-6 border border-blue-200">
              <Text className="text-blue-800 text-sm font-semibold mb-2">
                After Accepting Your Invitation
              </Text>
              <Text className="text-blue-700 text-sm leading-6 mb-0">
                Once you&apos;ve created your account, visit your{" "}
                <strong>Profile</strong> page to download your{" "}
                <strong>Employee Tag</strong> a printable ID card with your
                details.
              </Text>
            </Section>

            <Hr className="border-gray-200 my-5" />

            {/* Footer Note */}
            <Section className="mb-6">
              <Text className="text-gray-500 text-sm leading-6 mb-0">
                If you didn&apos;t expect this invitation or have already
                accepted it, you can safely ignore this email.
              </Text>
            </Section>

            <Hr className="border-gray-200 my-5" />

            {/* Footer */}
            <Section>
              <Text className="text-gray-400 text-xs text-center m-0">
                MediStock &copy; {new Date().getFullYear()} - Pharmaceutical
                Inventory Management
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

// Preview props for dev server
ReminderEmail.PreviewProps = {
  name: "John Kamau",
  email: "john@gmail.com",
  employeeId: "EMP-0005",
  inviteURL: "http://localhost:3000/accept?token=123",
  role: "user",
  expiryDate: new Date(2026, 3, 12),
  invitor: "Jacob Kimotho",
} as ReminderEmailProps;

export default ReminderEmail;
