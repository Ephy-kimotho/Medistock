"use client";

import { useState, useEffect, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  User,
  LockKeyhole,
  Eye,
  EyeOff,
  Loader,
  Mail,
  IdCard,
  Phone,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type AcceptInvitation,
  acceptInvitationSchema,
} from "@/lib/schemas/users";
import { cn, formatRole } from "@/lib/utils";
import { toast } from "sonner";
import { acceptInvitation } from "@/lib/actions/invitations";
import { PhotoUpload } from "@/components/photo-upload";
import { ImageService } from "@/lib/services/image-service";

interface AcceptInviteFormProps {
  token: string;
  email: string;
  name: string;
  role: string;
  employeeId: string;
  phone: string;
}

export function AcceptInviteForm({
  token,
  email,
  name,
  role,
  phone,
  employeeId,
}: AcceptInviteFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const {
    register,
    control,
    reset,
    trigger,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<AcceptInvitation>({
    mode: "all",
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: {
      name: name,
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

  const handlePhotoChange = (file: File | null) => {
    setPhotoFile(file);
    setPhotoError(null);

    // Validate file immediately for user feedback
    if (file) {
      const imageService = new ImageService({
        bucket: "avatars",
        folder: "profiles",
      });
      const validation = imageService.validate(file);
      if (!validation.valid) {
        setPhotoError(validation.error || "Invalid file");
        setPhotoFile(null);
      }
    }
  };

  const onSubmit = (values: AcceptInvitation) => {
    startTransition(async () => {
      let imageUrl: string | undefined;

      console.log("During submission", employeeId);

      // Upload photo if selected
      if (photoFile) {
        try {
          setUploadProgress("Uploading photo...");

          const imageService = new ImageService({
            bucket: "avatars",
            folder: "profiles",
          });

          const result = await imageService.process(photoFile);

          if (!result.success) {
            toast.error(result.error || "Failed to upload photo");
            setUploadProgress("");
            return;
          }

          imageUrl = result.url;
        } catch (error) {
          console.error("Photo upload error:", error);
          toast.error("Failed to upload photo. Please try again.");
          setUploadProgress("");
          return;
        }
      }

      setUploadProgress("Creating account...");

      const fields = {
        token,
        name: values.name,
        password: values.password,
        phone,
        image: imageUrl,
      };

      const result = await acceptInvitation({ fields, employeeId });

      reset();
      setPhotoFile(null);
      setUploadProgress("");

      if (result && !result.success) {
        toast.error(result.message);
      }
    });
  };

  return (
    <Card className="w-11/12 border-0 md:w-5/12 shadow-lg rounded-lg pb-10">
      <CardHeader className="text-center">
        <CardTitle className="text-xl lg:text-2xl text-slate-900 font-semibold">
          Accept Invitation
        </CardTitle>
        <p className="text-slate-600 text-sm">
          Complete your account setup to join Medistock.
        </p>
      </CardHeader>

      <CardContent>
        {/* Invitation Info */}
        <div className="mb-4 p-4 flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500 flex items-center gap-2">
              <Mail className="size-4" />
              Email
            </span>
            <span className="font-medium text-slate-900">{email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500 flex items-center">
              <Shield className="size-4" />
              Role
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium">
              {formatRole(role)}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500 flex items-center gap-2">
              <Phone className="size-4" />
              Phone number
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium">
              {phone}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500 flex items-center gap-2">
              <IdCard className="size-4" />
              Employee ID
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium">
              {employeeId}
            </span>
          </div>
        </div>

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
                disabled={isPending}
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

          {/* Profile Photo (Optional) */}
          <div className="space-y-2 border rounded-lg p-2">
            <Label className="font-medium">
              Profile Photo{" "}
              <span className="text-muted-foreground font-normal">
                (Optional)
              </span>
            </Label>
            <PhotoUpload
              file={photoFile}
              onChange={handlePhotoChange}
              disabled={isPending}
              error={photoError}
            />
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

          {/* Submit Button */}
          <div className="text-center pt-3">
            <Button
              type="submit"
              disabled={isPending}
              className="w-2/3 h-12 font-semibold text-base bg-azure hover:bg-blue-600"
            >
              {isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader className="size-4 animate-spin" />
                  {uploadProgress || "Creating Account..."}
                </span>
              ) : (
                "Create Account"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
