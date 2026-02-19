"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ProductForm } from "@/app/products/components/product-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CreateProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSuccess = () => {
    router.push(`/products?${searchParams.toString()}`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="flex flex-col h-full w-full p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Product</h1>
          <p className="text-muted-foreground mt-1">
            Add a new product to your inventory
          </p>
        </div>
      </div>

      <ProductForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  );
}
