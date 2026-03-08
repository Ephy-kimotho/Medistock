import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryForm } from "@/components/categories/categories-form";
import { CategoriesListing } from "@/components/categories/category-listing";
import { getCategories } from "@/lib/actions/categories";
import { getServerSession } from "@/lib/check-permissions";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { redirect } from "next/navigation";

interface CategoriesPageProps {
  searchParams: Promise<{ page: string; search: string }>;
}

async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const user = session.user;

  const isAdminOrManager =
    user.role === "admin" || user.role === "inventory_manager";

  const params = await searchParams;

  const currentPage = Number(params.page) || 1;
  const search = params.search || "";

  // Prefetch on the server
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["categories", "list", currentPage, search],
    queryFn: () => getCategories({ page: currentPage, search }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col flex-1">
        <header className="flex flex-col md:flex-row  md:items-center gap-4 md:gap-0 md:justify-between mb-5">
          <div>
            <h2 className="text-2xl text-slate-900 font-bold">Categories</h2>
            <p className="text-muted-foreground text-pretty">
              Manage medicine categories
            </p>
          </div>

          {isAdminOrManager && (
            <CategoryForm>
              <Button className="h-0 py-5 px-8 bg-azure self-start hover:bg-primary capitalize inline-flex items-center gap-2">
                <Plus className="size-4" />
                add category
              </Button>
            </CategoryForm>
          )}
        </header>

        {/* Catgory Listings goes here */}
        <CategoriesListing currentPage={currentPage} initialSearch={search} />
      </div>
    </HydrationBoundary>
  );
}

export default CategoriesPage;
