"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TVariant } from "../variant.types";
import {
  useVariantAttributes,
  useCreateVariantAttribute,
  useDeleteVariantAttribute,
} from "../hooks/use-variant-attributes";
import { attributeService } from "@/app/attribute/attribute.service";
import { attributeValueService } from "@/app/attribute/attribute-value.service";
import { useQuery } from "@tanstack/react-query";
import {
  ZVariantAttributeValueCreate,
  TVariantAttributeValueCreate,
} from "../variant-attribute-value.types";

interface VariantAttributesDialogProps {
  variant: TVariant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VariantAttributesDialog({
  variant,
  open,
  onOpenChange,
}: VariantAttributesDialogProps) {
  const [page] = useState(1);
  const [limit] = useState(10);

  // Fetch variant attributes
  const { data: variantAttributesResponse, isLoading: attributesLoading } =
    useVariantAttributes({
      variant_id: variant?.id,
      page,
      limit,
    });

  // Fetch all available attributes for the dropdown
  const { data: allAttributesResponse, isLoading: allAttributesLoading } =
    useQuery({
      queryKey: ["attributes", 1, 100, ""],
      queryFn: () =>
        attributeService.getAttributes({
          page: 1,
          limit: 100,
        }),
      enabled: open,
    });

  const { mutateAsync: createAttribute, isPending: isCreating } =
    useCreateVariantAttribute();
  const { mutateAsync: deleteAttribute, isPending: isDeleting } =
    useDeleteVariantAttribute();

  const [selectedAttributeId, setSelectedAttributeId] = useState<string>("");

  const { data: attributeValuesResponse, isLoading: attributeValuesLoading } =
    useQuery({
      queryKey: ["attribute-values", selectedAttributeId],
      queryFn: () =>
        attributeValueService.getAttributeValues({
          attribute_id: selectedAttributeId,
        }),
      enabled: !!selectedAttributeId,
    });

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<Omit<TVariantAttributeValueCreate, "variant_id">>({
    resolver: zodResolver(
      ZVariantAttributeValueCreate.omit({ variant_id: true }),
    ),
    defaultValues: {
      attribute_value_id: "",
      is_active: true,
    },
  });

  const selectedAttributeValueId = watch("attribute_value_id");

  useEffect(() => {
    if (!open) {
      reset();
      setSelectedAttributeId("");
    }
  }, [open, reset]);

  // When selected attribute changes, reset the attribute value
  useEffect(() => {
    setValue("attribute_value_id", "");
  }, [selectedAttributeId, setValue]);

  const onSubmit = async (
    data: Omit<TVariantAttributeValueCreate, "variant_id">,
  ) => {
    if (!variant?.id) return;
    await createAttribute({
      ...data,
      variant_id: variant.id,
    });
    reset(); // Reset form on success
  };

  const variantAttributes = Array.isArray(variantAttributesResponse)
    ? variantAttributesResponse
    : variantAttributesResponse?.data || [];

  const allAttributes = Array.isArray(allAttributesResponse)
    ? allAttributesResponse
    : allAttributesResponse?.data || [];

  const attributeValues = Array.isArray(attributeValuesResponse)
    ? attributeValuesResponse
    : attributeValuesResponse?.data || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Attributes for {variant?.name}</DialogTitle>
          <DialogDescription>
            Assign attribute values like Size, Color, or Material to this
            variant.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex items-end gap-4"
          >
            <div className="grid gap-2 flex-1">
              <Label htmlFor="attribute_id">Attribute</Label>
              <Select
                value={selectedAttributeId}
                onValueChange={setSelectedAttributeId}
                disabled={allAttributesLoading || isCreating}
              >
                <SelectTrigger id="attribute_id">
                  <SelectValue placeholder="Select attribute" />
                </SelectTrigger>
                <SelectContent>
                  {allAttributes.map((attr) => (
                    <SelectItem key={attr.id} value={attr.id}>
                      {attr.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 flex-1">
              <Label htmlFor="attribute_value_id">Value</Label>
              <Select
                value={selectedAttributeValueId}
                onValueChange={(val) => setValue("attribute_value_id", val)}
                disabled={
                  !selectedAttributeId || attributeValuesLoading || isCreating
                }
              >
                <SelectTrigger id="attribute_value_id">
                  <SelectValue placeholder="Select value" />
                </SelectTrigger>
                <SelectContent>
                  {attributeValues.map((val) => (
                    <SelectItem key={val.id} value={val.id}>
                      {val.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.attribute_value_id && (
                <p className="text-sm text-destructive">
                  {errors.attribute_value_id.message as string}
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={isCreating || !selectedAttributeValueId}
              className="mb-[2px]"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span className="sr-only">Add Attribute</span>
            </Button>
          </form>

          <div>
            <h4 className="mb-4 text-sm font-medium">Assigned Attributes</h4>
            {attributesLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : variantAttributes.length === 0 ? (
              <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                No attributes assigned yet.
              </div>
            ) : (
              <div className="rounded-md border">
                <div className="divide-y relative">
                  {variantAttributes.map((attr) => (
                    <div
                      key={attr.id}
                      className="flex items-center justify-between p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {attr.attribute_value?.attribute?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {attr.attribute_value?.value}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive h-8 w-8"
                        onClick={() => deleteAttribute(attr.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove attribute</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
