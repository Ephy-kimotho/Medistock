"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Mail, LockKeyhole, Eye, EyeOff, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Login, loginSchema } from "@/lib/schemas/users";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { signIn } from "@/lib/auth-client";
import Link from "next/link";
import { toast } from "sonner";

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Login>({
    mode: "all",
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: Login) => {
    try {
      const { error } = await signIn.email(values);

      if (error) {
        throw new Error(error.message || "Invalid email or password");
      }
      reset();
      toast.success("Login successful");

      router.prefetch("/dashboard");
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      const message =
        error instanceof Error ? error.message : "Invalid email or password";
      toast.error(message);
    }
  };

  return (
    <Card className="w-11/12 border-0 md:w-5/12 shadow-lg rounded-lg pb-10">
      <CardHeader className="text-center">
        <CardTitle className="text-xl lg:text-2xl text-slate-900 font-semibold">
          Welcome Back
        </CardTitle>
        <p className="text-night text-sm">Sign into your account to continue</p>
      </CardHeader>
      <CardContent>
        <form className="space-y-7" onSubmit={handleSubmit(onSubmit)}>
          {/* Email Address */}
          <div className="space-y-2">
            <Label htmlFor="email" className="font-medium">
              Email address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                type="email"
                id="email"
                placeholder="john@clinic.com"
                disabled={isSubmitting}
                className={cn(
                  "pl-10 pr-12 h-11 text-base",
                  errors.email
                    ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
                    : "focus-visible:ring-azure focus-visible:border-azure",
                )}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

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
                placeholder="Enter your password"
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

          {/* Action Buttons */}
          <div className="text-center pt-3 flex flex-col items-center gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-2/3 py-5 cursor-pointer font-semibold text-base"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader className="size-4 animate-spin" />
                  Logging in...
                </span>
              ) : (
                "Log in"
              )}
            </Button>
          </div>
        </form>

        <div className="mt-3 text-center">
          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
          >
            Forgot password?
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export { LoginForm };
