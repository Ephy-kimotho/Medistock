"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type ForgotPassword, forgotPasswordSchema } from "@/lib/schemas/users";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";
import { requestPasswordReset } from "@/lib/auth-client";
import SubmittedUI from "./submtited-ui";
import { toast } from "sonner";
import Link from "next/link";

function ForgotPasswordPage() {
  const [submitProps, setSubmitProps] = useState({
    hasSubmittedEmail: false,
    email: "",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPassword>({
    mode: "all",
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit: SubmitHandler<ForgotPassword> = async (values) => {
    const { error } = await requestPasswordReset({
      email: values.email,
      redirectTo: "/reset-password",
    });

    if (error) {
      toast.error(error.message || "Failed to send email");
    } else {
      setSubmitProps({
        email: values.email,
        hasSubmittedEmail: true,
      });
       reset();
      toast.success(
        "If an account exists for this email we've sent a reset link",
      );
    }
  };

  if (submitProps.hasSubmittedEmail) {
    return <SubmittedUI email={submitProps.email.trim()} />;
  }

  return (
    <Card className="w-11/12 border-0 md:w-5/12 shadow-lg rounded-lg  pb-10">
      <CardHeader className="text-center">
        <CardTitle className="text-xl lg:text-2xl  text-slate-900 font-semibold">
          Forgot Password ?
        </CardTitle>
        <p className="text-night text-sm">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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

          {/* Action Button*/}
          <div className="text-center pt-3 flex flex-col items-center gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-2/3 py-5 cursor-pointer font-semibold text-base"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader className="size-4 animate-spin" />
                  Sending...
                </span>
              ) : (
                "Send"
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="size-4" />
            Back to login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default ForgotPasswordPage;
