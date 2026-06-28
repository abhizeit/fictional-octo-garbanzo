"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useProduct } from "@/lib/hooks/use-products";
import { ProductForm } from "@/app/products/components/product-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  searchParamsRecordToString,
  type NextSearchParamsRecord,
} from "@/lib/next-search-params";

export default function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<NextSearchParamsRecord>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const sp = use(searchParams);
  const { data: product, isLoading, error } = useProduct(id);

  const handleSuccess = () => {
    const qs = searchParamsRecordToString(sp);
    router.push(qs ? `/products?${qs}` : "/products");
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 h-full w-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 h-full w-full gap-4">
        <div className="text-center">
          <p className="text-destructive font-medium">Failed to load product</p>
          <p className="text-sm text-muted-foreground mt-1">
            {(error as any)?.response?.data?.message || "An error occurred"}
          </p>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
            <p className="text-muted-foreground mt-1">
              Update the product details
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push(`/products/${id}/variants`)}
        >
          Manage Variants
        </Button>
      </div>

      {product && (
        <ProductForm
          initialData={product}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
