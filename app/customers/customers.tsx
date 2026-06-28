"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import {
  useCustomers,
  useDeleteCustomer,
  useToggleCustomerStatus,
} from "@/lib/hooks/use-customers";
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
import { CustomerTable } from "./customer-table";

export default function Customers() {
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

  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(
    null,
  );

  const {
    data: customers,
    isLoading,
    error,
  } = useCustomers({
    search: debouncedSearch || undefined,
    page,
    limit: pageSize,
  });

  const deleteCustomer = useDeleteCustomer();
  const toggleStatus = useToggleCustomerStatus();

  const handleDelete = async () => {
    if (deletingCustomerId) {
      await deleteCustomer.mutateAsync(deletingCustomerId);
      setDeletingCustomerId(null);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    await toggleStatus.mutateAsync({ id, is_active: !currentStatus });
  };

  const customerList = customers?.data ?? [];
  const meta = customers?.meta;
  const total = meta?.total ?? customerList.length;
  const totalPages = meta?.total_pages ?? Math.ceil(total / pageSize);

  return (
    <div className="flex flex-col h-full w-full p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-1">
            View and manage registered customers
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
          <CardDescription>Find customers by name, phone, or code</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
          <CardDescription>
            {total} {total === 1 ? "customer" : "customers"} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 h-full w-full">
              <Loader2 className="animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">Failed to load customers</p>
              <p className="text-sm text-muted-foreground mt-1">
                {(error as any)?.error?.message || "An error occurred"}
              </p>
            </div>
          ) : customerList.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No customers found</p>
            </div>
          ) : (
            <CustomerTable
              data={customerList}
              page={page}
              pageSize={pageSize}
              total={total}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onDelete={(id: string) => setDeletingCustomerId(id)}
              onToggleStatus={handleToggleStatus}
            />
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deletingCustomerId}
        onOpenChange={(open) => !open && setDeletingCustomerId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will soft-delete the customer account. They will no longer
              appear in the customer list.
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
