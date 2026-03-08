"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type CategoryType, categorySchema } from "@/lib/schemas/categories";
import { useUpdateCategory } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";
import type { Category } from "@/lib/types";

interface CategoryFormProps {
  category: Category;
  open: boolean;
  setOpen: (open: boolean) => void;
  setSelectedCategory: (category: Category | null) => void;
}

export function EditCategoryForm({
  category,
  open,
  setOpen,
  setSelectedCategory,
}: CategoryFormProps) {
  const { mutate: updateCategory, isPending } = useUpdateCategory();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryType>({
    mode: "all",
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category.name,
      description: category.description || "",
    },
  });

  const onSubmit: SubmitHandler<CategoryType> = (values) => {
    updateCategory(
      { values, categoryId: category.id },
      {
        onSuccess: () => {
          reset();
          setOpen(false);
          setSelectedCategory(null);
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
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Edit the <span className="lowercase">{category.name}</span> Category
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Update the name or details of this category to better organize your
            medicines.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Category Name */}
          <div className="space-y-2">
            <Label htmlFor="category-name" className="text-sm font-medium">
              Category Name
            </Label>
            <Input
              id="category-name"
              placeholder="e.g., Pain relief"
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

          {/* Description */}
          <div className="space-y-2">
            <Label
              htmlFor="category-description"
              className="text-sm font-medium"
            >
              Description{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              id="category-description"
              rows={4}
              placeholder="e.g., Analgesics and pain management medications."
              disabled={isPending}
              className={cn(
                "text-base resize-none",
                errors.description
                  ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
                  : "focus-visible:ring-azure focus-visible:border-azure",
              )}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-3 pt-4">
            <Button
              size="lg"
              type="button"
              className="bg-lipstick-red hover:bg-crimson-red text-white hover:text-white flex-1 sm:flex-none sm:w-32"
              onClick={() => {
                reset();
                setOpen(false);
              }}
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
                  Updating...
                </span>
              ) : (
                "Update Category"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
