"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  invitationRequestSchema,
  type InvitationRequestInput,
} from "@/lib/schemas/invitation-request";
import { useCreateInvitationRequest } from "@/hooks/useInvitationRequests";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";

interface InvitationRequestFormProps {
  children: React.ReactNode;
  requestorId: string;
}

export function InvitationRequestForm({
  children,
  requestorId,
}: InvitationRequestFormProps) {
  const [open, setOpen] = useState(false);

  const { mutate: createRequest, isPending } = useCreateInvitationRequest();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<InvitationRequestInput>({
    mode: "all",
    resolver: zodResolver(invitationRequestSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "user",
      employeeId: "",
    },
  });

  const onSubmit: SubmitHandler<InvitationRequestInput> = (values) => {
    createRequest(
      { data: values, requestorId },
      {
        onSuccess: () => {
          reset();
          setOpen(false);
        },
      },
    );
  };

  const handleOpenChange = (open: boolean) => {
    if (!isPending) {
      setOpen(open);
      if (!open) reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            New Invitation Request
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Create a request to invite a new employee to the system.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Full Name
            </Label>
            <Input
              id="name"
              placeholder="e.g., John Doe"
              disabled={isPending}
              className={cn(
                "h-11 text-base",
                errors.name
                  ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
                  : "focus-visible:ring-azure focus-visible:border-azure",
              )}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g., john@clinic.com"
              disabled={isPending}
              className={cn(
                "h-11 text-base",
                errors.email
                  ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
                  : "focus-visible:ring-azure focus-visible:border-azure",
              )}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Employee ID */}
          <div className="space-y-2">
            <Label htmlFor="employeeId" className="text-sm font-medium">
              Employee ID
            </Label>
            <Input
              id="employeeId"
              placeholder="e.g., EMP001"
              disabled={isPending}
              className={cn(
                "h-11 text-base",
                errors.employeeId
                  ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
                  : "focus-visible:ring-azure focus-visible:border-azure",
              )}
              {...register("employeeId")}
            />
            {errors.employeeId && (
              <p className="text-red-500 text-sm">
                {errors.employeeId.message}
              </p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium">
              Role
            </Label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isPending}
                >
                  <SelectTrigger
                    className={cn(
                      "w-full h-11 text-base",
                      errors.role
                        ? "border-red-400 focus:ring-red-400"
                        : "focus:ring-azure",
                    )}
                  >
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="inventory_manager">
                      Inventory Manager
                    </SelectItem>
                    <SelectItem value="user">Pharmacist</SelectItem>
                    <SelectItem value="auditor">Auditor</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && (
              <p className="text-red-500 text-sm">{errors.role.message}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-3 pt-4">
            <Button
              size="lg"
              type="button"
              className="bg-lipstick-red hover:bg-crimson-red flex-1 sm:flex-none sm:w-32"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              size="lg"
              type="submit"
              className="flex-1 sm:flex-none sm:w-44 bg-azure hover:bg-blue-600"
              disabled={isPending}
            >
              {isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader className="size-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                "Create Request"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
