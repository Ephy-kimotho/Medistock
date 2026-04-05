"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PhotoUpload } from "@/components/photo-upload";
import { imageService } from "@/lib/services/image-service";
import { updateUserImage } from "@/lib/actions/users";
import { toast } from "sonner";
import { Loader, Camera } from "lucide-react";

interface UpdatePhotoDialogProps {
  userId: string;
  currentImageUrl?: string | null;
  children: React.ReactNode;
}

export function UpdatePhotoDialog({
  userId,
  currentImageUrl,
  children,
}: UpdatePhotoDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    setError(null);

    if (selectedFile) {
      const validation = imageService.validate(selectedFile);
      if (!validation.valid) {
        setError(validation.error || "Invalid file");
        setFile(null);
      }
    }
  };

  const handleSubmit = () => {
    if (!file) {
      setError("Please select an image");
      return;
    }

    startTransition(async () => {
      try {
        setUploadProgress("Uploading image...");

        const uploadResult = await imageService.process(file);

        if (!uploadResult.success || !uploadResult.url) {
          toast.error(uploadResult.error || "Failed to upload image");
          setUploadProgress("");
          return;
        }

        // Step 2: Update user record
        setUploadProgress("Updating profile...");

        const result = await updateUserImage(userId, uploadResult.url);

        if (result.success) {
          // Step 3: Delete old image from Supabase (if exists)
          if (currentImageUrl) {
            await imageService.deleteByUrl(currentImageUrl);
          }

          toast.success(result.message);
          setFile(null);
          setOpen(false);
        } else {
          // If database update fails, delete the newly uploaded image
          await imageService.deleteByUrl(uploadResult.url);
          toast.error(result.message);
        }
      } catch (error) {
        console.error("Update photo error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      } finally {
        setUploadProgress("");
      }
    });
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isPending) return;

    setOpen(isOpen);

    if (!isOpen) {
      setFile(null);
      setError(null);
      setUploadProgress("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Update Profile Photo
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Choose a new profile photo. The image will be compressed before
            upload.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <PhotoUpload
            file={file}
            onChange={handleFileChange}
            disabled={isPending}
            error={error}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !file}
            className="bg-azure hover:bg-blue-600"
          >
            {isPending ? (
              <span className="inline-flex items-center gap-2">
                <Loader className="size-4 animate-spin" />
                {uploadProgress || "Updating..."}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <Camera className="size-4" />
                Update Photo
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
