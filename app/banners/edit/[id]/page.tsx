"use client";

import { useRouter, useParams } from "next/navigation";
import { useBanner, useUpdateBanner } from "@/lib/hooks/use-banners";
import { BannerForm } from "../../banner-form";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditBannerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: banner, isLoading, error } = useBanner(id);
  const updateBanner = useUpdateBanner();

  const handleSubmit = async (data: any) => {
    try {
      await updateBanner.mutateAsync({ id, data });
      router.push("/banners");
    } catch (error) {
      console.error("Failed to update banner:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !banner) {
    return (
      <div className="p-8 text-center text-destructive">
        Failed to load banner details.
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Edit Banner</h1>
          <p className="text-muted-foreground mt-1">
            Update existing banner details
          </p>
        </div>
      </div>

      <BannerForm
        initialData={banner}
        onSubmit={handleSubmit}
        isLoading={updateBanner.isPending}
      />
    </div>
  );
}
