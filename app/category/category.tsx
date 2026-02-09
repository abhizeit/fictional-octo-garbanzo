"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Plus, Search, Loader2 } from "lucide-react";
import {
  useCategories,
  useDeleteCategory,
  useToggleCategoryStatus,
} from "@/lib/hooks/use-categories";
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
import { CategoryTable } from "./category-table";

export default function Category() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Get initial state from URL params
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

  // Sync state with URL params
  const [prevInitialSearch, setPrevInitialSearch] =
    useState(initialSearchQuery);
  if (initialSearchQuery !== prevInitialSearch) {
    setSearchTerm(initialSearchQuery);
    setPrevInitialSearch(initialSearchQuery);
  }

  // Update URL when debounced search changes
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

  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(
    null,
  );

  const {
    data: categories,
    isLoading,
    error,
  } = useCategories({
    search: debouncedSearch || undefined,
    page,
    limit: pageSize,
  });

  // Mutations
  const deleteCategory = useDeleteCategory();
  const toggleStatus = useToggleCategoryStatus();

  // Handlers
  const handleDelete = async () => {
    if (deletingCategoryId) {
      await deleteCategory.mutateAsync(deletingCategoryId);
      setDeletingCategoryId(null);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    await toggleStatus.mutateAsync({ id, isActive: !currentStatus });
  };

  const categoryList = Array.isArray(categories)
    ? categories
    : categories?.data || [];

  const meta = categories && "meta" in categories ? categories.meta : undefined;
  const total = meta?.total || categoryList.length;
  const totalPages = meta?.total_pages || Math.ceil(total / pageSize);

  return (
    <div className="flex flex-col h-full w-full p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product categories
          </p>
        </div>
        <Button
          onClick={() =>
            router.push(`/category/create?${searchParams.toString()}`)
          }
          size="lg"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Category
        </Button>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
          <CardDescription>Find and filter categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories by name or slug..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>
            {categoryList.length}{" "}
            {categoryList.length === 1 ? "category" : "categories"} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 h-full w-full">
              <Loader2 className="animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">Failed to load categories</p>
              <p className="text-sm text-muted-foreground mt-1">
                {(error as any)?.error?.message || "An error occurred"}
              </p>
            </div>
          ) : categoryList.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No categories found</p>
              <Button
                onClick={() => router.push("/category/create")}
                variant="outline"
                className="mt-4"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create your first category
              </Button>
            </div>
          ) : (
            <CategoryTable
              data={categoryList}
              page={page}
              pageSize={pageSize}
              total={total}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onDelete={(id) => setDeletingCategoryId(id)}
              onToggleStatus={handleToggleStatus}
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingCategoryId}
        onOpenChange={(open) => !open && setDeletingCategoryId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              category and remove it from our servers.
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
