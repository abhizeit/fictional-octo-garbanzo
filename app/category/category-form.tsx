"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CloudinaryUpload } from "@/components/custom/cloudinary-upload";
import { PaginatedAsyncSelect } from "@/components/custom/paginated-async-select";
import { categoryService } from "./category.service";
import { TCategory, TCategoryCreate, ZCategoryCreate } from "./category.types";
import {
  useCreateCategory,
  useUpdateCategory,
} from "@/lib/hooks/use-categories";

interface CategoryFormProps {
  initialData?: TCategory; // Pass existing category for edit mode
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CategoryForm({
  initialData,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const isEditMode = !!initialData;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<TCategoryCreate>({
    resolver: zodResolver(ZCategoryCreate),
    defaultValues: {
      name: "",
      slug: "",
      image: "",
      description: "",
      parent_id: undefined,
      is_active: true,
    },
  });

  const name = watch("name");

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        slug: initialData.slug || "",
        image: initialData.image || "",
        description: initialData.description || "",
        parent_id: initialData.parent_id || undefined,
        is_active: initialData.is_active ?? true,
      });
    }
  }, [initialData, reset]);

  useEffect(() => {
    if (!isEditMode && name) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", generatedSlug);
    }
  }, [name, setValue, isEditMode]);

  /* Hooks */
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const onSubmit = async (data: TCategoryCreate) => {
    try {
      if (isEditMode && initialData?.id) {
        await updateCategory.mutateAsync({
          id: initialData.id,
          data: {
            id: initialData.id,
            name: data.name,
            slug: data.slug,
            image: data.image || undefined,
            description: data.description,
            parent_id: data.parent_id,
            is_active: data.is_active,
          },
        });
      } else {
        await createCategory.mutateAsync({
          name: data.name,
          slug: data.slug,
          image: data.image || undefined,
          description: data.description,
          parent_id: data.parent_id,
          is_active: data.is_active,
        });
      }

      reset();
      onSuccess?.();
    } catch (error) {
      // Errors are handled by the hooks
      console.error(error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {isEditMode ? "Edit Category" : "Create New Category"}
        </CardTitle>
        <CardDescription>
          {isEditMode
            ? "Update the category details below"
            : "Add a new category to organize your products"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Electronics"
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Slug Field */}
          <div className="space-y-2">
            <Label htmlFor="slug">
              Slug <span className="text-destructive">*</span>
            </Label>
            <Input
              id="slug"
              {...register("slug")}
              placeholder="electronics"
              aria-invalid={!!errors.slug}
            />
            <p className="text-xs text-muted-foreground">
              {isEditMode
                ? "URL-friendly version of the name"
                : "URL-friendly version of the name (auto-generated)"}
            </p>
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Brief description of the category..."
              rows={3}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>
          <CloudinaryUpload
            value={watch("image")}
            onChange={(url) => setValue("image", url)}
            label="Category Image"
            required={false}
          />
          {errors.image && (
            <p className="text-sm text-destructive">{errors.image.message}</p>
          )}

          {/* Parent Category Field */}
          <PaginatedAsyncSelect<TCategory>
            value={watch("parent_id")}
            onChange={(value) => setValue("parent_id", value as string)}
            fetcher={categoryService.getCategories}
            preloadFetcher={(id) => categoryService.getCategory(String(id))}
            getOptionLabel={(category) => category.name}
            getOptionValue={(category) => category.id}
            label="Parent Category"
            placeholder="Search categories..."
            excludeIds={isEditMode && initialData ? [initialData.id] : []}
            staticOptions={[{ value: "", label: "None" }]}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Optional: Select a parent for nested categories
          </p>

          {/* Active Status Field */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={watch("is_active")}
              onCheckedChange={(checked) =>
                setValue("is_active", checked === true)
              }
            />
            <Label
              htmlFor="is_active"
              className="text-sm font-normal cursor-pointer"
            >
              Active (category is visible to users)
            </Label>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between gap-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting} className="ml-auto">
            {isSubmitting
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
                ? "Update Category"
                : "Create Category"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
