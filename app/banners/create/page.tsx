"use client";

import { useRouter } from "next/navigation";
import { useCreateBanner } from "@/lib/hooks/use-banners";
import { BannerForm } from "../banner-form";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CreateBannerPage() {
  const router = useRouter();
  const createBanner = useCreateBanner();

  const handleSubmit = async (data: any) => {
    try {
      await createBanner.mutateAsync(data);
      router.push("/banners");
    } catch (error) {
      console.error("Failed to create banner:", error);
    }
  };

  return (
    <div className="flex flex-col h-full w-full p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Banner</h1>
          <p className="text-muted-foreground mt-1">
            Add a new banner to the system
          </p>
        </div>
      </div>

      <BannerForm onSubmit={handleSubmit} isLoading={createBanner.isPending} />
    </div>
  );
}
