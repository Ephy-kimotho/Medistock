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

interface ResetPasswordEmailProps {
  name: string;
  resetURL: string;
  expiresAt: Date;
}

function ResetPasswordEmail({
  name = "there",
  resetURL,
  expiresAt,
}: ResetPasswordEmailProps) {
  const formattedTime = format(expiresAt, "h:mm a");

  return (
    <Html lang="en">
      <Head />
      <Preview>Reset your MediStock password</Preview>
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
            {/* Header */}
            <Section className="text-center w-full mb-4">
              <Heading
                as="h1"
                className="text-gray-900 font-bold text-2xl tracking-tight mb-4"
              >
                MediStock
              </Heading>
            </Section>

            {/* Main Content */}
            <Section className="mb-4">
              <Heading
                as="h3"
                className="text-gray-800 font-medium text-lg mb-4"
              >
                Hi {name}, we received a request to reset your password.
              </Heading>

              <Text className="text-gray-700 text-base leading-7 mb-4">
                Click the button below to create a new password. If you
                didn&apos;t request this, you can safely ignore this email your
                password will remain unchanged.
              </Text>
            </Section>

            {/* CTA Button */}
            <Section className="text-center py-2 mb-4">
              <Button
                href={resetURL}
                className="bg-brand text-white py-4 px-8 rounded-lg inline-block text-xl font-bold"
              >
                Reset Password
              </Button>
            </Section>

            {/* Fallback Link */}
            <Section className="mb-4">
              <Text className="text-gray-700 text-base leading-7 mb-2">
                Or copy and paste this link into your browser:
              </Text>
              <Text className="text-blue-600 text-sm break-all">
                {resetURL}
              </Text>
            </Section>

            <Hr className="border-gray-200 my-5" />

            {/* Expiry Notice */}
            <Section className="mb-6">
              <Text className="text-gray-800 text-sm leading-6 mb-2">
                This link will expire in <strong>15 minutes</strong> (today at{" "}
                <strong>{formattedTime}</strong>).
              </Text>

              <Text className="text-gray-500 text-sm leading-6 mb-0">
                If you didn&apos;t request a password reset, no action is
                needed. Your account is still secure.
              </Text>
            </Section>

            <Hr className="border-gray-200 my-5" />

            {/* Security Tip */}
            <Section className="mb-6">
              <Text className="text-gray-600 text-sm leading-6 mb-2">
                <strong>Security tip:</strong> Never share this link with
                anyone. MediStock staff will never ask for your password.
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

export default ResetPasswordEmail;
