"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, LockKeyhole, Eye, EyeOff, Loader } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { setupSchema, type SetupSchema } from "@/lib/schemas/setup";
import { useForm, SubmitHandler, } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { createAdminUser } from "@/lib/actions/setup";
import { toast } from "sonner";

export default function SetupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SetupSchema>({
    mode: "all",
    resolver: zodResolver(setupSchema),
  });

  const onSubmit: SubmitHandler<SetupSchema> = async (values) => {
    const response = await createAdminUser(values);

    if (response.success === false) {
      toast.error(response.message);
      return;
    }

    toast.success(response.message);
    router.push("/login");
  };

  return (
    <Card className="w-11/12 border-0 md:w-5/12 shadow-lg rounded-lg pb-10">
      <CardHeader className="text-center">
        <CardTitle className="text-xl lg:text-2xl text-slate-900 font-semibold">
          Welcome to Medistock
        </CardTitle>

        <p className="text-night text-sm">
          This is the first time setup, create your admin account to get
          started.
        </p>
      </CardHeader>

      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="font-medium">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                type="text"
                id="name"
                placeholder="John Doe"
                disabled={isSubmitting}
                className={cn(
                  "pl-10 h-11 text-base",
                  errors.name
                    ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
                    : "focus-visible:ring-azure focus-visible:border-azure",
                )}
                {...register("name")}
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <Label htmlFor="email" className="font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                type="email"
                id="email"
                placeholder="john@clinic.com"
                disabled={isSubmitting}
                className={cn(
                  "pl-10 h-11 text-base",
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

          {/* CTA Button */}
          <div className="text-center pt-2">
            <Button className="w-2/3 h-11" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader className="size-4 animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Create Admin Account"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
