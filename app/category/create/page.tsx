"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { CategoryForm } from "@/app/category/category-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  searchParamsRecordToString,
  type NextSearchParamsRecord,
} from "@/lib/next-search-params";

export default function CreateCategoryPage({
  searchParams,
}: {
  searchParams: Promise<NextSearchParamsRecord>;
}) {
  const router = useRouter();
  const sp = use(searchParams);

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
          <h1 className="text-3xl font-bold tracking-tight">Create Category</h1>
          <p className="text-muted-foreground mt-1">
            Add a new category to organize your products
          </p>
        </div>
      </div>

      {/* Form */}
      <CategoryForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  );
}
