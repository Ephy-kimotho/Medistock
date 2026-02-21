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

type Role = "user" | "admin" | "auditor" | "inventory_manager";

interface InviteEmailProps {
  name?: string;
  inviteURL: string;
  role: Role;
  expiryDate: Date;
  invitor?: string;
}

function InviteEmail({
  name = "there",
  invitor = "an admin",
  inviteURL,
  role = "user",
  expiryDate,
}: InviteEmailProps) {
  const formattedExpiry = format(expiryDate, "MMMM d, yyyy 'at' h:mm a");

  return (
    <Html lang="en">
      <Head />
      <Preview>You&apos;s been invited to join MediStock</Preview>
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

            <Section className="mb-4">
              <Heading
                as="h3"
                className="text-gray-800 font-medium text-lg mb-4"
              >
                Hi {name ? name : "there"}, you have been invited to join
                medistock by {invitor}.
              </Heading>

              <Text className="mb-4 text-gray-700 text-base">
                Your new role will be{" "}
                <strong>
                  {role.startsWith("a")
                    ? `an ${role}`
                    : role === "user"
                      ? `a ${role}`
                      : "an Inventory Manager"}
                  .
                </strong>
              </Text>

              <Text className="text-gray-700 text-base leading-7 mb-4">
                MediStock is a pharmaceutical inventory management system that
                helps health centers track medicines, manage stock levels, and
                generate reports.
              </Text>

              <Text className="mb-4 text-gray-700 text-base">
                Click the button below to set your password and activate your
                account.
              </Text>
            </Section>

            {/* CTA buttons */}
            <Section className="text-center py-2 mb-4">
              <Button
                href={inviteURL}
                className="bg-brand text-white py-4 px-8 rounded-lg inline-block text-xl font-bold"
              >
                Accept Invitation
              </Button>
            </Section>

            {/* Fallback Link */}
            <Section className="mb-4">
              <Text className="text-gray-700 text-base leading-7 mb-2">
                Or copy and paste this link into your browser:
              </Text>
              <Text className="text-blue-600 text-sm break-all">
                {inviteURL}
              </Text>
            </Section>

            <Hr className="border-gray-200 my-5" />

            <Section className="mb-6">
              <Text className="text-gray-800 text-sm leading-6 mb-2">
                This invitation will expire on{" "}
                <strong>{formattedExpiry}</strong>.
              </Text>

              <Text className="text-gray-500 text-sm leading-6 mb-0">
                If you didn&apos;t expect this invitation, you can safely ignore
                this email.
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

export default InviteEmail;
