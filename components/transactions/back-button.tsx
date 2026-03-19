import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href="/transactions"
          className="inline-flex items-center justify-center p-2 rounded-lg bg-muted hover:bg-primary group"
        >
          <ArrowLeft className="size-5 text-night group-hover:text-white" />
        </Link>
      </TooltipTrigger>
      <TooltipContent align="end">
        <p>Back to transactions.</p>
      </TooltipContent>
    </Tooltip>
  );
}
