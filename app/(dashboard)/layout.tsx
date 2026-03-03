import { Layout } from "@/components/dashboard-layout";
import Providers from "@/components/providers";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout>
      <Providers>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </Providers>
    </Layout>
  );
}
