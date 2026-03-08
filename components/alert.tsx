import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

interface AlertProps {
  title: string;
  description: string;
  actionType: "info" | "warn" | "critical";
  action: string;
  actionFn: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
}

export function Alert({
  action,
  actionFn,
  actionType,
  title,
  description,
  open,
  onOpenChange,
  isLoading = false,
}: AlertProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="capitalize font-bold">{title}</AlertDialogTitle>
          <AlertDialogDescription
            className={cn(
              "p-4 rounded-md mt-2",
              actionType === "info" &&
                "bg-azure/10 text-azure border border-azure",
              actionType === "warn" &&
                "bg-princeton-orange/10 text-princeton-orange border border-princeton-orange",
              actionType === "critical" &&
                "bg-crimson-red/10 text-crimson-red border border-crimson-red",
            )}
          >
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mt-3 flex justify-end gap-2">
          <Button
            disabled={isLoading}
            className="px-6 bg-lipstick-red hover:bg-crimson-red text-white hover:text-white"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              actionFn();
            }}
            disabled={isLoading}
            className={cn(
              "px-10 capitalize",
              actionType === "info" && "hover:bg-blue-600 bg-azure",
              actionType === "warn" &&
                "hover:bg-orange-600 bg-princeton-orange",
              actionType === "critical" && "hover:bg-red-600 bg-crimson-red",
            )}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader className="size-4 animate-spin" />
                Processing...
              </span>
            ) : (
              action
            )}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
