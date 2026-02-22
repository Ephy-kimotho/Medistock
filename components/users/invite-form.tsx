"use client";

import { ReactNode, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";
import { invitationSchema, InvitationType } from "@/lib/schemas/users";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import type { Role } from "@/lib/types";
import z from "zod";

function InvitationForm({ children }: { children: ReactNode }) {
  // Get the current session user
  const { currentUser } = usePermissions();

  // Dialog open state
  const [open, setOpen] = useState(false);

  // React Hook form management
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<InvitationType>({
    mode: "all",
    resolver: zodResolver(invitationSchema),
  });

  const onSubmit: SubmitHandler<InvitationType> = async (values) => {
    try {
      // Make the Invite API request
      const response = await fetch("/api/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          invitedById: currentUser?.id,
        }),
      });

      // Get the response
      const data = await response.json();

      // Check if fetch request went through okay
      if (!response.ok) {
        toast.error(data.message || "Invitation failed!");
        return;
      }

      // Check if invite was successful.
      if (data.success) {
        toast.success(data.message);
        reset();
        setOpen(false);
      }
    } catch (error) {
      // Invite error handling
      if (error instanceof Error) {
        toast.error(error.message);
      } else if (error instanceof z.ZodError) {
        toast.error("Validation failed.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader className="gap-0">
          <DialogTitle className="text-lg">
            Invite a user to join Medistock
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Create a new user&apos;s account with the specified role.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* User Name */}
          <div className="space-y-2">
            <Label htmlFor="user-name" className="text-slate-800 font-semibold">
              User Name
            </Label>
            <Input
              id="user-name"
              type="text"
              placeholder="e.g John Doe"
              className={cn(
                errors.name &&
                  "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-400",
              )}
              disabled={isSubmitting}
              {...register("name")}
            />

            {errors.name && (
              <p className="mt-1 pl-2 text-red-400 text-sm">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label
              htmlFor="user-email"
              className="text-slate-800 font-semibold"
            >
              Email
            </Label>
            <Input
              id="user-email"
              type="email"
              placeholder="e.g john@clinic.com"
              className={cn(
                errors.email &&
                  "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-400",
              )}
              disabled={isSubmitting}
              {...register("email")}
            />

            {errors.email && (
              <p className="mt-1 pl-2 text-red-400 text-sm">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Select */}
          <div className="space-y-2">
            <Label htmlFor="user-role">Role</Label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select
                  disabled={isSubmitting}
                  value={field.value}
                  onValueChange={(value: Role) => {
                    field.onChange(value);
                  }}
                >
                  <SelectTrigger
                    className={cn(
                      "w-full",
                      errors.role &&
                        "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-400",
                    )}
                  >
                    <SelectValue placeholder="Choose user role" />
                  </SelectTrigger>
                  <SelectContent id="user-role">
                    <SelectGroup>
                      <SelectLabel>Choose new user&apos;s role</SelectLabel>
                      <SelectItem value="auditor">Auditor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="inventory_manager">
                        Inventory Manager
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && (
              <p className="mt-1 pl-2 text-red-400 text-sm">
                {errors.role.message}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                disabled={isSubmitting}
                className="w-2/6 cursor-pointer"
              >
                Cancel
              </Button>
            </DialogClose>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-2/5 cursor-pointer"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader className="size-4 animate-spin" />
                  Inviting...
                </span>
              ) : (
                "Invite user"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { InvitationForm };
