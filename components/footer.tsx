"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface FooterProps {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  paramName?: string;
  preserveParams?: string[];
}

export function Footer({
  currentPage,
  hasNext,
  hasPrev,
  totalPages,
  paramName = "page",
  preserveParams,
}: FooterProps) {
  // Get the the router object and search params
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigate = (newPage: number) => {
    // create new params
    const params = new URLSearchParams();

    // Set the params we want preserved when changing tabs
    preserveParams?.forEach((param) => {
      // Get the value of the param
      const value = searchParams.get(param);

      if (value) {
        params.set(param, value);
      }
    });

    // set the page
    params.set(paramName, newPage.toString());

    // Navigate to the new page with updated params
    router.push(`?${params.toString()}`);
  };

  return (
    <footer className="absolute right-0 left-0 -bottom-36 w-full py-4 px-4 md:px-6 flex item-center justify-between ">
      <p className="text-sm text-muted-foreground font-medium">
        Showing page {currentPage} of {totalPages}{" "}
        {totalPages === 1 ? "page" : "pages"}
      </p>

      <div className="flex item-center gap-2 ">
        <Button
          disabled={!hasPrev}
          variant="outline"
          size="lg"
          className="shrink-0 inline-flex item-center gap-3 group hover:border-azure"
          onClick={() => hasPrev && navigate(currentPage - 1)}
        >
          <ChevronLeft className="size-5 group-hover:text-azure" />
          <span>Previous</span>
        </Button>
        <span className="shrink-0 size-10 font-medium rounded-md bg-azure text-white grid place-items-center">
          {currentPage}
        </span>
        <Button
          disabled={!hasNext}
          variant="outline"
          size="lg"
          className="shrink-0 inline-flex item-center gap-3 group hover:border-azure"
          onClick={() => hasNext && navigate(currentPage + 1)}
        >
          <span>Next</span>
          <ChevronRight className="size-5 group-hover:text-azure" />
        </Button>
      </div>
    </footer>
  );
}
