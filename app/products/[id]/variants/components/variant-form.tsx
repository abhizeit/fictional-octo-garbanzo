"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CloudinaryUpload } from "@/components/custom/cloudinary-upload";
import { attributeValueService } from "@/app/attribute/attribute-value.service";
import { productService } from "@/app/products/product.service";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { TVariant, TVariantCreate, ZVariantCreate } from "../variant.types";

interface VariantFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TVariantCreate) => void;
  initialData?: TVariant | null;
  isLoading?: boolean;
  productId: string;
}

function AttributeSelect({
  attribute,
  value,
  onChange,
  disabled,
}: {
  attribute: { id: string; name: string };
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}) {
  const { data: attributeValuesResponse, isLoading } = useQuery({
    queryKey: ["attribute-values", attribute.id],
    queryFn: () =>
      attributeValueService.getAttributeValues({
        attribute_id: attribute.id,
      }),
  });

  const attributeValues = Array.isArray(attributeValuesResponse)
    ? attributeValuesResponse
    : attributeValuesResponse?.data || [];

  return (
    <div className="grid gap-2">
      <Label>
        {attribute.name} <span className="text-destructive">*</span>
      </Label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder={`Select ${attribute.name}`} />
        </SelectTrigger>
        <SelectContent>
          {attributeValues.map((val) => (
            <SelectItem key={val.id} value={val.id}>
              {val.value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function VariantForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
  productId,
}: VariantFormProps) {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<z.input<typeof ZVariantCreate>>({
    resolver: zodResolver(ZVariantCreate),
    defaultValues: {
      name: "",
      slug: "",
      price: 0,
      sku: "",
      image: "",
      is_default: false,
      is_active: true,
      is_available: true,
      product_id: productId,
    },
  });

  const { data: productResponse, isLoading: productLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => productService.getProduct(productId),
    enabled: open,
  });

  const productAttributes =
    productResponse?.product_attributes?.map((pa) => pa.attribute) || [];

  const [attributeSelections, setAttributeSelections] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          name: initialData.name,
          slug: initialData.slug ?? "",
          price: Number(initialData.price),
          sku: initialData.sku || "",
          image: initialData.image || "",
          is_default: initialData.is_default,
          is_active: initialData.is_active,
          is_available: initialData.is_available,
          product_id: productId,
        });

        const initialSelections: Record<string, string> = {};
        if (initialData.variant_attribute_values) {
          for (const vav of initialData.variant_attribute_values) {
            if (vav.attribute_value?.attribute_id) {
              initialSelections[vav.attribute_value.attribute_id] =
                vav.attribute_value_id;
            }
          }
        }
        setAttributeSelections(initialSelections);
      } else {
        reset({
          name: "",
          slug: "",
          price: 0,
          sku: "",
          image: "",
          is_default: false,
          is_available: true,
          is_active: true,
          product_id: productId,
        });
        setAttributeSelections({});
      }
    }
  }, [open, initialData, reset, productId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form
          onSubmit={handleSubmit((data) => {
            if (productAttributes.length > 0) {
              // Ensure all attributes have a selected value
              const allSelected = productAttributes.every(
                (attr) => !!attributeSelections[attr.id]
              );
              if (!allSelected) {
                toast.error(
                  "Please select a value for each product attribute before saving.",
                );
                return;
              }
            }
            
            const finalData = {
              ...data,
              attribute_value_ids: Object.values(attributeSelections),
            };
            onSubmit(finalData as TVariantCreate);
          })}
        >
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Variant" : "Add Variant"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the details of this variant."
                : "Enter the details for the new variant."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. 6 Pieces, Large, Spicy"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">
                Slug <span className="text-destructive">*</span>
              </Label>
              <Input
                id="slug"
                placeholder="e.g. 6-pieces, large-hot"
                {...register("slug")}
              />
              {errors.slug && (
                <p className="text-sm text-destructive">
                  {errors.slug.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">
                  Price <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("price")}
                />
                {errors.price && (
                  <p className="text-sm text-destructive">
                    {errors.price.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sku">
                  SKU <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="sku"
                  placeholder="e.g. PRD-VAR-01"
                  {...register("sku")}
                />
                {errors.sku && (
                  <p className="text-sm text-destructive">
                    {errors.sku.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Variant Image</Label>
              <CloudinaryUpload
                value={watch("image") || ""}
                onChange={(url) => setValue("image", url)}
                label="Image"
                required={false}
              />
              {errors.image && (
                <p className="text-sm text-destructive">
                  {errors.image.message}
                </p>
              )}
            </div>

            <div className="flex gap-4 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_default"
                  checked={watch("is_default")}
                  onCheckedChange={(checked) =>
                    setValue("is_default", checked === true)
                  }
                />
                <Label htmlFor="is_default">Default Variant</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_available"
                  checked={watch("is_available")}
                  onCheckedChange={(checked) =>
                    setValue("is_available", checked === true)
                  }
                />
                <Label htmlFor="is_available">Available for Sale</Label>
              </div>
            </div>

            {productAttributes.length > 0 && (
              <>
                <div className="my-2 border-t" />
                <h4 className="text-sm font-medium mb-2">Attributes</h4>
                <div className="grid gap-4">
                  {productAttributes.map((attr) => (
                    <AttributeSelect
                      key={attr.id}
                      attribute={attr}
                      value={attributeSelections[attr.id] || ""}
                      onChange={(val) =>
                        setAttributeSelections((prev) => ({
                          ...prev,
                          [attr.id]: val,
                        }))
                      }
                      disabled={isLoading}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
