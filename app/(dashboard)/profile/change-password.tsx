import React, { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LockKeyhole, Eye, EyeOff, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, SubmitHandler, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { changeUserPassword } from "@/lib/actions/users";
import { toast } from "sonner";
import { signOut } from "@/lib/auth-client";
import { type ChangePassword, changePasswordSchema } from "@/lib/schemas/users";

interface ChangePasswordFormProps {
  userId: string;
  children: React.ReactNode;
}

export function ChangePasswordForm({
  userId,
  children,
}: ChangePasswordFormProps) {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    reset,
    trigger,
    formState: { errors, touchedFields },
  } = useForm<ChangePassword>({
    mode: "all",
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Watch password fields for validation
  const password = useWatch({ control, name: "password" });
  const confirmPassword = useWatch({ control, name: "confirmPassword" });

  // Re-validate confirmPassword when password changes
  useEffect(() => {
    if (touchedFields.confirmPassword && confirmPassword) {
      trigger("confirmPassword");
    }
  }, [password, confirmPassword, trigger, touchedFields.confirmPassword]);

  const onSubmit: SubmitHandler<ChangePassword> = (values) => {
    startTransition(async () => {
      const result = await changeUserPassword(values.password, userId);

      if (result.status) {
        toast.success("Password changed successfully.");
        reset();
        setOpen(false);
        await signOut();
        router.push("/login");
      } else {
        toast.error("Failed to change password");
      }
    });
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Change Password
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="font-medium">
              Password
            </Label>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Create a password"
                disabled={isPending}
                className={cn(
                  "pl-10 pr-12 h-11 text-base",
                  errors.password
                    ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
                    : "focus-visible:ring-azure focus-visible:border-azure",
                )}
                {...register("password")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isPending}
              >
                {showPassword ? (
                  <EyeOff className="size-5 text-muted-foreground" />
                ) : (
                  <Eye className="size-5 text-muted-foreground" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="font-medium">
              Confirm Password
            </Label>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                id="confirm-password"
                placeholder="Confirm your password"
                disabled={isPending}
                className={cn(
                  "pl-10 pr-12 h-11 text-base",
                  errors.confirmPassword
                    ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
                    : "focus-visible:ring-azure focus-visible:border-azure",
                )}
                {...register("confirmPassword")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isPending}
              >
                {showPassword ? (
                  <EyeOff className="size-5 text-muted-foreground" />
                ) : (
                  <Eye className="size-5 text-muted-foreground" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              size="lg"
              className="bg-lipstick-red px-10 hover:bg-crimson-red"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              size="lg"
              type="submit"
              className="bg-azure px-4 hover:bg-blue-600"
              disabled={isPending}
            >
              {isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader className="text-white size-4 animate-spin" />
                  <span>Updating...</span>
                </span>
              ) : (
                "Update password"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
