import { Layout } from "@/components/dashboard-layout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Layout>{children}</Layout>;
}