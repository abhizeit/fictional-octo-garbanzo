"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useProduct } from "@/lib/hooks/use-products";
import { useVariants } from "./hooks/use-variants";
import { VariantTable } from "./components/variant-table";
import { VariantForm } from "./components/variant-form";
import { TVariant, TVariantCreate, TVariantUpdate } from "./variant.types";
import type { NextSearchParamsRecord } from "@/lib/next-search-params";

export default function VariantsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<NextSearchParamsRecord>;
}) {
  const router = useRouter();
  const { id } = use(params);
  use(searchParams); // unwrap page prop; avoids Next.js sync dynamic APIs warning

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<TVariant | null>(null);

  // Fetch Product Details to show the name
  const {
    data: product,
    isLoading: isProductLoading,
    error: productError,
  } = useProduct(id);

  // Fetch Variants
  const {
    variantsData,
    isLoading: isVariantsLoading,
    createMutation,
    updateMutation,
    deleteMutation,
    toggleStatusMutation,
    bulkUpdateMutation,
  } = useVariants({ product_id: id });
  const variantsList = variantsData ?? [];

  const handleCreate = () => {
    setEditingVariant(null);
    setIsFormOpen(true);
  };

  const handleEdit = (variant: TVariant) => {
    setEditingVariant(variant);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: TVariantCreate) => {
    if (editingVariant) {
      await updateMutation.mutateAsync({
        id: editingVariant.id,
        data: { ...data },
      });
    } else {
      await createMutation.mutateAsync({
        ...data,
        product_id: id,
      });
    }
    setIsFormOpen(false);
  };

  const handleVariantQuickUpdate = async (
    variantId: string,
    patch: TVariantUpdate,
  ) => {
    await updateMutation.mutateAsync({
      id: variantId,
      data: patch,
    });
  };

  const handleBulkUpdate = async (patch: TVariantUpdate) => {
    if (variantsList.length === 0) return;
    await bulkUpdateMutation.mutateAsync({
      ids: variantsList.map((variant) => variant.id),
      data: patch,
    });
  };

  if (isProductLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 space-y-4">
        <p className="text-destructive">Failed to load product details</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Variants</h1>
          <p className="text-muted-foreground mt-1">
            Product:{" "}
            <span className="font-medium text-foreground">
              {product.name} ({product.code})
            </span>
          </p>
        </div>
      </div>

      <Separator />

      {/* Variants Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>Variants</CardTitle>
            <CardDescription>
              Manage available variants, prices, and SKUs for this product.
            </CardDescription>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Variant
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          {isVariantsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin" />
            </div>
          ) : variantsList.length === 0 ? (
            <div className="text-center py-12 border rounded-md border-dashed">
              <p className="text-muted-foreground">No variants found</p>
              <Button onClick={handleCreate} variant="outline" className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add your first variant
              </Button>
            </div>
          ) : (
            <VariantTable
              data={variantsList}
              onEdit={handleEdit}
              onDelete={(variantId) => deleteMutation.mutate(variantId)}
              onToggleStatus={(variantId, status) =>
                toggleStatusMutation.mutate({
                  id: variantId,
                  isActive: !status,
                })
              }
            />
          )}
        </CardContent>
      </Card>

      <VariantForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingVariant(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingVariant}
        productId={id}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
