"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { PaginatedAsyncMultiSelect } from "@/components/custom/paginated-async-multi-select";
import { categoryService } from "@/app/category/category.service";
import { TCategory } from "@/app/category/category.types";
import { attributeService } from "@/app/attribute/attribute.service";
import { TAttribute } from "@/app/attribute/attribute.types";
import {
  Product,
  TProductCreate,
  ZProductCreate,
} from "@/app/products/product.types";
import { useCreateProduct, useUpdateProduct } from "@/lib/hooks/use-products";

interface ProductFormProps {
  initialData?: Product;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProductForm({
  initialData,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const isEditMode = !!initialData;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<TProductCreate>({
    resolver: zodResolver(ZProductCreate),
    defaultValues: {
      name: "",
      slug: "",
      code: "",
      description: "",
      image: "",
      is_available: true,
      is_active: true,
      category_ids: [],
      attribute_ids: [],
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        slug: initialData.slug ?? "",
        code: initialData.code,
        description: initialData.description || "",
        image: initialData.image || "",
        is_available: initialData.is_available ?? true,
        is_active: initialData.is_active ?? true,
        category_ids: initialData.categories?.map((c) => c.category.id) || [],
        attribute_ids:
          initialData.product_attributes?.map((pa) => pa.attribute.id) || [],
      });
    }
  }, [initialData, reset]);

  // Hooks
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const onSubmit = async (data: TProductCreate) => {
    try {
      if (isEditMode && initialData?.id) {
        await updateProduct.mutateAsync({
          id: initialData.id,
          data: data,
        });
      } else {
        await createProduct.mutateAsync(data);
      }
      onSuccess?.();
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCategoriesByIds = async (ids: (string | number)[]) => {
    // In a real app, you'd want a specific API endpoint for this.
    // Here we simulate by fetching individual items in parallel.
    const promises = ids.map((id) => categoryService.getCategory(String(id)));
    const results = await Promise.all(promises);
    return results;
  };

  // Helper to fetch multiple attributes for preloading
  const fetchAttributesByIds = async (ids: (string | number)[]) => {
    const promises = ids.map((id) => attributeService.getAttribute(String(id)));
    const results = await Promise.all(promises);
    return results;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {isEditMode ? "Edit Product" : "Create New Product"}
        </CardTitle>
        <CardDescription>
          {isEditMode
            ? "Update the product details below"
            : "Add a new product to your inventory"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Chicken Bucket"
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Code Field */}
            <div className="space-y-2">
              <Label htmlFor="code">
                Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="code"
                {...register("code")}
                placeholder="CHKN-BKT"
                aria-invalid={!!errors.code}
              />
              {errors.code && (
                <p className="text-sm text-destructive">
                  {errors.code.message}
                </p>
              )}
            </div>

            {/* Slug Field */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="slug">
                Slug <span className="text-destructive">*</span>
              </Label>
              <Input
                id="slug"
                {...register("slug")}
                placeholder="zinger-burger"
                aria-invalid={!!errors.slug}
              />
              <p className="text-xs text-muted-foreground">
                URL-safe identifier (lowercase, hyphens). Used for links and APIs.
              </p>
              {errors.slug && (
                <p className="text-sm text-destructive">
                  {errors.slug.message}
                </p>
              )}
            </div>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Delicious chicken bucket with customized pieces..."
              rows={3}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Image Upload */}
          <CloudinaryUpload
            value={watch("image")}
            onChange={(url) => setValue("image", url)}
            label="Product Image"
            required={false}
          />
          {errors.image && (
            <p className="text-sm text-destructive">{errors.image.message}</p>
          )}

          {/* Categories Multi-Select */}
          <div className="space-y-2">
            <PaginatedAsyncMultiSelect<TCategory>
              value={watch("category_ids")}
              onChange={(value) => setValue("category_ids", value.map(String))}
              fetcher={categoryService.getCategories}
              preloadFetcher={fetchCategoriesByIds}
              getOptionLabel={(category) => category.name}
              getOptionValue={(category) => category.id}
              label="Categories"
              placeholder="Select categories..."
            />
            {errors.category_ids && (
              <p className="text-sm text-destructive">
                {errors.category_ids.message}
              </p>
            )}
          </div>

          {/* Attributes Multi-Select */}
          <div className="space-y-2">
            <PaginatedAsyncMultiSelect<TAttribute>
              value={watch("attribute_ids") || []}
              onChange={(value) => setValue("attribute_ids", value.map(String))}
              fetcher={(params) => attributeService.getAttributes(params).then((res) => res)}
              preloadFetcher={fetchAttributesByIds}
              getOptionLabel={(attribute) => attribute.name}
              getOptionValue={(attribute) => attribute.id}
              label="Attributes"
              placeholder="Select attributes..."
            />
            {errors.attribute_ids && (
              <p className="text-sm text-destructive">
                {errors.attribute_ids.message}
              </p>
            )}
          </div>

          <div className="flex gap-6">
            {/* Available Status */}
            <div className="flex items-center space-x-2 border p-4 rounded-md w-full">
              <Checkbox
                id="is_available"
                checked={watch("is_available")}
                onCheckedChange={(checked) =>
                  setValue("is_available", checked === true)
                }
              />
              <div className="flex flex-col">
                <Label
                  htmlFor="is_available"
                  className="text-sm font-medium cursor-pointer"
                >
                  Available
                </Label>
                <span className="text-xs text-muted-foreground">
                  Product can be ordered by customers
                </span>
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-2 border p-4 rounded-md w-full">
              <Checkbox
                id="is_active"
                checked={watch("is_active")}
                onCheckedChange={(checked) =>
                  setValue("is_active", checked === true)
                }
              />
              <div className="flex flex-col">
                <Label
                  htmlFor="is_active"
                  className="text-sm font-medium cursor-pointer"
                >
                  Active
                </Label>
                <span className="text-xs text-muted-foreground">
                  Product is visible in the system
                </span>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="mt-6 flex justify-between gap-4">
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
                ? "Update Product"
                : "Create Product"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
