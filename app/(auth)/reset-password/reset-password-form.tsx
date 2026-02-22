"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LockKeyhole, Eye, EyeOff, Loader } from "lucide-react";
import { useForm, useWatch, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ResetPassword, resetPasswordSchema } from "@/lib/schemas/users";
import { resetPassword } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function ResetPasswordForm({ token }: { token: string }) {

  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    control,
    reset,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<ResetPassword>({
    mode: "all",
    resolver: zodResolver(resetPasswordSchema),
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

  const onSubmit: SubmitHandler<ResetPassword> = async (values) => {
    const { error } = await resetPassword({
      newPassword: values.password,
      token,
    });

    if (error) {
      toast.error(error.message || "Failed to reset password.");
    } else {
      reset();
      toast.success("Password has been reset. You can now sign in.");
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    }
  };

  return (
    <Card className="w-11/12 border-0 md:w-5/12 shadow-lg rounded-lg  pb-10">
      <CardHeader className="text-center">
        <CardTitle className="text-xl lg:text-2xl  text-slate-900 font-semibold">
          Create your new password
        </CardTitle>
        <p className="text-night text-sm">
          Secure your account with a strong password
        </p>
      </CardHeader>
      <CardContent>
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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

          {/* Call To Action Button*/}
          <div className="text-center pt-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-2/3 h-12 font-semibold text-base bg-[#0077B6] hover:bg-[#006298]"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader className="size-4 animate-spin" />
                  Resetting...
                </span>
              ) : (
                "Reset"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export { ResetPasswordForm };
