import { notFound } from "next/navigation";
import { getServerSession } from "@/lib/check-permissions";
import { redirect } from "next/navigation";
import {
  getCategoryById,
  getCategoryMedicineStats,
  getCategoryMedicines,
} from "@/lib/actions/categories";
import { CategoryPageContent } from "@/components/categories/category-page-content";
import type { Role } from "@/lib/types";

interface CategoryDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function CategoryDetailPage({
  params,
  searchParams,
}: CategoryDetailPageProps) {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const { page, search } = await searchParams;

  const currentPage = page ? parseInt(page, 10) : 1;
  const searchTerm = search ?? "";

  const category = await getCategoryById(id);

  if (!category) {
    notFound();
  }

  const [stats, medicinesData] = await Promise.all([
    getCategoryMedicineStats(id),
    getCategoryMedicines(id, { page: currentPage, search: searchTerm }),
  ]);

  const canManageStock = ["admin", "inventory_manager"].includes(
    user.role as Role,
  );

  return (
    <section className="flex-1 flex flex-col gap-6">
      <CategoryPageContent
        categoryId={id}
        categoryName={category.name}
        categoryDescription={category.description}
        medicines={medicinesData.medicines}
        totalPages={medicinesData.totalPages}
        currentPage={medicinesData.currentPage}
        totalCount={medicinesData.totalCount}
        hasNext={medicinesData.hasNext}
        hasPrev={medicinesData.hasPrev}
        searchTerm={searchTerm}
        stats={stats}
        userId={user.id}
        canManageStock={canManageStock}
      />
    </section>
  );
}
