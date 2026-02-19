"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Plus, Search, Loader2 } from "lucide-react";
import {
  useProducts,
  useDeleteProduct,
  useToggleProductStatus,
} from "@/lib/hooks/use-products";
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
import { ProductTable } from "./components/product-table";

export function ProductsClient() {
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

  const [deletingProductId, setDeletingProductId] = useState<string | null>(
    null,
  );

  const {
    data: products,
    isLoading,
    error,
  } = useProducts({
    search: debouncedSearch || undefined,
    page,
    limit: pageSize,
  });

  // Mutations
  const deleteProduct = useDeleteProduct();
  const toggleStatus = useToggleProductStatus();

  // Handlers
  const handleDelete = async () => {
    if (deletingProductId) {
      await deleteProduct.mutateAsync(deletingProductId);
      setDeletingProductId(null);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    await toggleStatus.mutateAsync({ id, isActive: !currentStatus });
  };

  const productList = Array.isArray(products) ? products : products?.data || [];

  const meta = products && "meta" in products ? products.meta : undefined;
  const total = meta?.total || productList.length;
  const totalPages = meta?.total_pages || Math.ceil(total / pageSize);

  return (
    <div className="flex flex-col h-full w-full p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your food products
          </p>
        </div>
        <Button
          onClick={() =>
            router.push(`/products/create?${searchParams.toString()}`)
          }
          size="lg"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Product
        </Button>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
          <CardDescription>Find and filter products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name or code..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <CardDescription>
            {total} {total === 1 ? "product" : "products"} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 h-full w-full">
              <Loader2 className="animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">Failed to load products</p>
              <p className="text-sm text-muted-foreground mt-1">
                {(error as any)?.response?.data?.message || "An error occurred"}
              </p>
            </div>
          ) : productList.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found</p>
              <Button
                onClick={() => router.push("/products/create")}
                variant="outline"
                className="mt-4"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create your first product
              </Button>
            </div>
          ) : (
            <ProductTable
              data={productList}
              page={page}
              pageSize={pageSize}
              total={total}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onDelete={(id) => setDeletingProductId(id)}
              onToggleStatus={handleToggleStatus}
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingProductId}
        onOpenChange={(open) => !open && setDeletingProductId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product and remove it from our servers.
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
