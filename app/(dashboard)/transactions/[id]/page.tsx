import { getServerSession } from "@/lib/check-permissions";
import { redirect, notFound } from "next/navigation";
import { getTransactionById } from "@/lib/actions/transactions";
import { TransactionDetailsContent } from "@/components/transactions/transaction-details-content";

interface TransactionDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function TransactionDetailsPage({
  params,
}: TransactionDetailsPageProps) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const transaction = await getTransactionById(id);

  if (!transaction) {
    notFound();
  }

  return <TransactionDetailsContent transaction={transaction} />;
}
