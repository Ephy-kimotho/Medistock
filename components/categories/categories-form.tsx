"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
import { useForm, SubmitHandler, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  categorySchema,
  type CategoryFormData,
} from "@/lib/schemas/categories";
import { MEDICINE_CATEGORIES, getDescriptionByCategory } from "@/constants";
import { useCreateCategory } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";
import { Loader, Info } from "lucide-react";
import type { CreateCategory } from "@/lib/types";

interface CategoryFormProps {
  children: React.ReactNode;
}

export function CategoryForm({ children }: CategoryFormProps) {
  const [open, setOpen] = useState(false);

  const { mutate: createCategory, isPending } = useCreateCategory();

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    mode: "all",
    resolver: zodResolver(categorySchema),
    defaultValues: {
      categorySelect: "",
      customName: "",
      descriptionSelect: "default",
      customDescription: "",
    },
  });

  // Watch category selection to handle auto-select and conditional rendering
  const categorySelect = useWatch({ control, name: "categorySelect" });
  const descriptionSelect = useWatch({ control, name: "descriptionSelect" });

  const isOtherCategory = categorySelect === "other";
  const isOtherDescription = descriptionSelect === "other";
  const showCustomDescription = isOtherCategory || isOtherDescription;

  // When category changes, reset description to default (auto-select)
  useEffect(() => {
    if (categorySelect === "other") {
      setValue("descriptionSelect", "other");
      setValue("customDescription", "");
    } else if (categorySelect) {
      setValue("descriptionSelect", "default");
      setValue("customDescription", "");
    }
  }, [categorySelect, setValue]);

  // Get the matching description for the selected category
  const matchingDescription = getDescriptionByCategory(categorySelect);

  const onSubmit: SubmitHandler<CategoryFormData> = (values) => {
    // Resolve final values
    const finalData: CreateCategory = {
      name:
        values.categorySelect === "other"
          ? values.customName!.trim()
          : values.categorySelect,
      description:
        values.categorySelect === "other" ||
        values.descriptionSelect === "other"
          ? values.customDescription!.trim()
          : matchingDescription!,
    };

    createCategory(finalData, {
      onSuccess: () => {
        reset();
        setOpen(false);
      },
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
      <DialogContent className="sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Add Category
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Create a new category to organize your medicines.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
          {/* Category Name Select */}
          <div className="space-y-2">
            <Label htmlFor="category-select" className="text-sm font-medium">
              Category Name
            </Label>
            <Controller
              control={control}
              name="categorySelect"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isPending}
                >
                  <SelectTrigger
                    id="category-select"
                    className={cn(
                      "w-full",
                      errors.categorySelect
                        ? "border-red-400 focus:ring-red-400"
                        : "focus:ring-azure",
                    )}
                  >
                    <SelectValue placeholder="Select a category..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {MEDICINE_CATEGORIES.map((category) => (
                      <SelectItem key={category.name} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="other" className="text-muted-foreground">
                      Other (custom category)
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categorySelect && (
              <p className="text-red-500 text-sm">
                {errors.categorySelect.message}
              </p>
            )}
          </div>

          {/* Custom Category Name - only if "Other" selected */}
          {isOtherCategory && (
            <div className="space-y-2">
              <Label htmlFor="custom-name" className="text-sm font-medium">
                Custom Category Name
              </Label>
              <Input
                id="custom-name"
                placeholder="e.g., Herbal Remedies"
                disabled={isPending}
                className={cn(
                  "h-11 text-base",
                  errors.customName
                    ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
                    : "focus-visible:ring-azure focus-visible:border-azure",
                )}
                {...register("customName")}
              />
              {errors.customName && (
                <p className="text-red-500 text-sm">
                  {errors.customName.message}
                </p>
              )}
            </div>
          )}

          {/* Description Select - only if NOT "Other" category */}
          {!isOtherCategory && categorySelect && (
            <div className="space-y-2">
              <Label
                htmlFor="description-select"
                className="text-sm font-medium"
              >
                Description
              </Label>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Info className="size-3.5" />
                <span>Pre-filled based on your category selection</span>
              </div>
              <Controller
                control={control}
                name="descriptionSelect"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending}
                  >
                    <SelectTrigger
                      id="description-select"
                      className={cn(
                        "w-full",
                        errors.descriptionSelect
                          ? "border-red-400 focus:ring-red-400"
                          : "focus:ring-azure",
                      )}
                    >
                      <SelectValue placeholder="Select a description..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">
                        {matchingDescription}
                      </SelectItem>
                      <SelectItem
                        value="other"
                        className="text-muted-foreground"
                      >
                        Other (custom description)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.descriptionSelect && (
                <p className="text-red-500 text-sm">
                  {errors.descriptionSelect.message}
                </p>
              )}
            </div>
          )}

          {/* Custom Description - if category is "Other" OR description is "Other" */}
          {showCustomDescription && (
            <div className="space-y-2">
              <Label
                htmlFor="custom-description"
                className="text-sm font-medium"
              >
                Custom Description
              </Label>
              <Textarea
                id="custom-description"
                rows={3}
                placeholder="Enter a brief description for this category..."
                disabled={isPending}
                className={cn(
                  "text-base resize-none",
                  errors.customDescription
                    ? "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400"
                    : "focus-visible:ring-azure focus-visible:border-azure",
                )}
                {...register("customDescription")}
              />
              {errors.customDescription && (
                <p className="text-red-500 text-sm">
                  {errors.customDescription.message}
                </p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-3 pt-4">
            <Button
              size="lg"
              type="button"
              className="flex-1 sm:flex-none bg-lipstick-red hover:bg-crimson-red sm:w-32"
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
                  Creating...
                </span>
              ) : (
                "Create Category"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
