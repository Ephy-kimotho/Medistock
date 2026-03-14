import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface NewEmployeeRequestEmailProps {
  adminName: string;
  employeeName: string;
  employeeEmail: string;
  employeeRole: string;
  employeeId: string;
  requestedBy: string;
  onboardingUrl: string;
}

export default function NewEmployeeRequestEmail({
  adminName = "Admin",
  employeeName = "",
  employeeEmail = "",
  employeeRole = "user",
  employeeId = "",
  requestedBy = "HR",
  onboardingUrl = "",
}: NewEmployeeRequestEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>New employee onboarding request - {employeeName}</Preview>
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
                as="h2"
                className="text-gray-800 font-semibold text-xl mb-4"
              >
                New Employee Request
              </Heading>

              <Text className="text-gray-700 text-base leading-7 mb-4">
                Hi {adminName},
              </Text>

              <Text className="text-gray-700 text-base leading-7 mb-4">
                A new employee onboarding request has been submitted by{" "}
                <strong>{`${requestedBy} (HR)`}</strong> and requires your
                action to send the invitation.
              </Text>
            </Section>

            {/* Employee Details Card */}
            <Section className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
              <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-4">
                Employee Details
              </Text>

              <Text className="text-gray-700 text-base mb-2">
                <strong>Name:</strong> {employeeName}
              </Text>
              <Text className="text-gray-700 text-base mb-2">
                <strong>Email:</strong> {employeeEmail}
              </Text>
              <Text className="text-gray-700 text-base mb-2">
                <strong>Role:</strong>{" "}
                {employeeRole === "user" ? "Pharmacist" : employeeRole}
              </Text>
              <Text className="text-gray-700 text-base mb-0">
                <strong>Employee ID:</strong> {employeeId}
              </Text>
            </Section>

            {/* Action Text */}
            <Section className="mb-4">
              <Text className="text-gray-700 text-base leading-7 mb-4">
                Please review and send the invitation to allow this employee to
                access the system.
              </Text>
            </Section>

            {/* CTA Button */}
            <Section className="text-center py-2 mb-4">
              <Button
                href={onboardingUrl}
                className="bg-brand text-white py-4 px-8 rounded-lg inline-block text-base font-bold"
              >
                View Onboarding Requests
              </Button>
            </Section>

            {/* Fallback Link */}
            <Section className="mb-4">
              <Text className="text-gray-700 text-sm leading-7 mb-2">
                Or copy and paste this link into your browser:
              </Text>
              <Text className="text-blue-600 text-sm break-all">
                {onboardingUrl}
              </Text>
            </Section>

            <Hr className="border-gray-200 my-5" />

            {/* Footer Note */}
            <Section className="mb-6">
              <Text className="text-gray-500 text-sm leading-6 mb-0">
                This is an automated notification from MediStock. If you have
                any questions, please contact HR.
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
/* NewEmployeeRequestEmail.PreviewProps = {
  adminName: "Dr. Sarah Johnson",
  employeeName: "John Doe",
  employeeEmail: "john.doe@clinic.com",
  employeeRole: "Inventory Manager",
  employeeId: "EMP001",
  requestedBy: "Jane Smith (HR)",
  onboardingUrl: "http://localhost:3000/onboarding",
} as NewEmployeeRequestEmailProps; */
