"use client";

import { useRef, useMemo, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotoUploadProps {
  file: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  error?: string | null;
  className?: string;
}

export function PhotoUpload({
  file,
  onChange,
  disabled = false,
  error,
  className,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Derive the preview URL from the file — no state needed
  const previewUrl = useMemo(() => {
    return file ? URL.createObjectURL(file) : null;
  }, [file]);

  // Revoke the object URL on change or unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      onChange(selected);
    }
  };

  const handleRemove = () => {
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
        onChange={handleFileSelect}
        disabled={disabled}
        className="hidden"
        id="photo-input"
      />

      {previewUrl ? (
        // Preview state — photo replaces the upload area
        <div className="relative inline-block">
          <div className="relative size-32 rounded-lg overflow-hidden border-2 border-border shadow-sm">
            <Image
              src={previewUrl}
              alt="Profile preview"
              fill
              className="object-cover"
            />
          </div>

          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={handleRemove}
            disabled={disabled}
            aria-label="Remove photo"
            className="absolute -top-2 -right-2 size-6 rounded-full"
          >
            <X className="size-4" />
          </Button>

          <p className="mt-2 text-xs capitalize text-muted-foreground truncate max-w-32">
            {file?.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {file && `${(file.size / 1024 / 1024).toFixed(2)} MB`}
          </p>
        </div>
      ) : (
        // Upload state — click to select
        <label
          htmlFor="photo-input"
          className={cn(
            "flex flex-col items-center gap-2 border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors",
            "border-muted-foreground/25 hover:border-muted-foreground/50",
            disabled && "opacity-50 cursor-not-allowed",
            error && "border-destructive",
          )}
        >
          <div className="rounded-full bg-muted p-3">
            <Camera className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Click to upload a photo
          </p>
          <p className="text-xs text-muted-foreground">
            JPEG, PNG, WebP, or AVIF (max 20MB)
          </p>
        </label>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
