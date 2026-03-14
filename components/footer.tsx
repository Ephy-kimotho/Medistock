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
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigate = (newPage: number) => {
    const params = new URLSearchParams();

    preserveParams?.forEach((param) => {
      const value = searchParams.get(param);
      if (value) {
        params.set(param, value);
      }
    });

    params.set(paramName, newPage.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <footer className="w-full flex items-center justify-between">
      <p className="text-sm text-muted-foreground font-medium">
        Showing page {currentPage} of {totalPages}{" "}
        {totalPages === 1 ? "page" : "pages"}
      </p>

      <div className="flex items-center gap-2">
        <Button
          disabled={!hasPrev}
          variant="outline"
          size="lg"
          className="shrink-0 inline-flex items-center gap-3 group hover:border-azure"
          onClick={() => hasPrev && navigate(currentPage - 1)}
        >
          <ChevronLeft className="size-5 group-hover:text-azure" />
          <span className="hidden sm:inline">Previous</span>
        </Button>
        <span className="shrink-0 size-10 font-medium rounded-md bg-azure text-white grid place-items-center">
          {currentPage}
        </span>
        <Button
          disabled={!hasNext}
          variant="outline"
          size="lg"
          className="shrink-0 inline-flex items-center gap-3 group hover:border-azure"
          onClick={() => hasNext && navigate(currentPage + 1)}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="size-5 group-hover:text-azure" />
        </Button>
      </div>
    </footer>
  );
}
