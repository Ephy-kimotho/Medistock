import { Layout } from "@/components/dashboard-layout";
import Providers from "@/components/providers";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <Layout>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </Layout>
    </Providers>
  );
}