"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Plus, Search, Loader2 } from "lucide-react";
import {
  useBanners,
  useDeleteBanner,
  useToggleBannerStatus,
} from "@/lib/hooks/use-banners";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BannerTable } from "./banner-table";

export default function Banners() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("limit")) || 10;
  const initialSearchQuery = searchParams.get("search") || "";

  const [searchTerm, setSearchTerm] = useState(initialSearchQuery);
  const debouncedSearch = useDebounce(searchTerm, 500);

  const createQueryString = (
    params: Record<string, string | number | null>,
  ) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, String(value));
      }
    });

    return newSearchParams.toString();
  };

  const [prevInitialSearch, setPrevInitialSearch] =
    useState(initialSearchQuery);
  if (initialSearchQuery !== prevInitialSearch) {
    setSearchTerm(initialSearchQuery);
    setPrevInitialSearch(initialSearchQuery);
  }

  useEffect(() => {
    if (debouncedSearch !== initialSearchQuery) {
      router.push(
        `${pathname}?${createQueryString({ search: debouncedSearch, page: 1 })}`,
      );
    }
  }, [debouncedSearch, router, pathname, initialSearchQuery]);

  const handlePageChange = (newPage: number) => {
    router.push(`${pathname}?${createQueryString({ page: newPage })}`);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const [deletingBannerId, setDeletingBannerId] = useState<string | null>(null);

  const {
    data: banners,
    isLoading,
    error,
  } = useBanners({
    search: debouncedSearch || undefined,
    page,
    limit: pageSize,
  });

  const deleteBanner = useDeleteBanner();
  const toggleStatus = useToggleBannerStatus();

  const handleDelete = async () => {
    if (deletingBannerId) {
      await deleteBanner.mutateAsync(deletingBannerId);
      setDeletingBannerId(null);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    await toggleStatus.mutateAsync({ id, is_active: !currentStatus });
  };

  const bannerList = Array.isArray(banners) ? banners : banners?.data || [];

  const meta = banners && "meta" in banners ? banners.meta : undefined;
  const total = meta?.total || bannerList.length;
  const totalPages = meta?.total_pages || Math.ceil(total / pageSize);

  return (
    <div className="flex flex-col h-full w-full p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Banners</h1>
          <p className="text-muted-foreground mt-1">
            Manage app promotional banners
          </p>
        </div>
        <Button
          onClick={() =>
            router.push(`/banners/create?${searchParams.toString()}`)
          }
          size="lg"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Banner
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
          <CardDescription>Find banners</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search banners by title or subtitle..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Banners</CardTitle>
          <CardDescription>
            {bannerList.length} {bannerList.length === 1 ? "banner" : "banners"}{" "}
            total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 h-full w-full">
              <Loader2 className="animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">Failed to load banners</p>
              <p className="text-sm text-muted-foreground mt-1">
                {(error as any)?.error?.message || "An error occurred"}
              </p>
            </div>
          ) : bannerList.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No banners found</p>
              <Button
                onClick={() => router.push("/banners/create")}
                variant="outline"
                className="mt-4"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create your first banner
              </Button>
            </div>
          ) : (
            <BannerTable
              data={bannerList}
              page={page}
              pageSize={pageSize}
              total={total}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onDelete={(id: string) => setDeletingBannerId(id)}
              onToggleStatus={handleToggleStatus}
            />
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deletingBannerId}
        onOpenChange={(open) => !open && setDeletingBannerId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              banner and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
