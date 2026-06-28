"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useCategory } from "@/lib/hooks/use-categories";
import { CategoryForm } from "@/app/category/category-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  searchParamsRecordToString,
  type NextSearchParamsRecord,
} from "@/lib/next-search-params";

export default function EditCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<NextSearchParamsRecord>;
}) {
  const router = useRouter();
  const { slug } = use(params);
  const sp = use(searchParams);
  const { data: category, isLoading, error } = useCategory(slug);

  const handleSuccess = () => {
    const qs = searchParamsRecordToString(sp);
    router.push(qs ? `/category?${qs}` : "/category");
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
          <h1 className="text-3xl font-bold tracking-tight">Edit Category</h1>
          <p className="text-muted-foreground mt-1">
            Update the category details
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12 h-full w-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-destructive">Failed to load category</p>
          <p className="text-sm text-muted-foreground mt-1">
            {(error as any)?.error?.message || "An error occurred"}
          </p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      )}

      {category && (
        <CategoryForm
          initialData={category}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
