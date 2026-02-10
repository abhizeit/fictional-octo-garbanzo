"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Plus, Search, Loader2 } from "lucide-react";
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
import { toast } from "sonner";
import { AttributeTable } from "./attribute-table";
import { AttributeForm } from "./attribute-form";
import { attributeService } from "./attribute.service";
import { TAttribute } from "./attribute.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function AttributePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  // Get initial state from URL params
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("limit")) || 10;
  const initialSearchQuery = searchParams.get("search") || "";

  const [searchTerm, setSearchTerm] = useState(initialSearchQuery);
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<TAttribute | null>(
    null,
  );
  const [deletingAttributeId, setDeletingAttributeId] = useState<string | null>(
    null,
  );

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
  useEffect(() => {
    if (initialSearchQuery !== searchTerm) {
      setSearchTerm(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Update URL when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== initialSearchQuery) {
      router.push(
        `${pathname}?${createQueryString({ search: debouncedSearch, page: 1 })}`,
      );
    }
  }, [debouncedSearch, router, pathname]);

  const handlePageChange = (newPage: number) => {
    router.push(`${pathname}?${createQueryString({ page: newPage })}`);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Queries
  const {
    data: attributesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["attributes", page, pageSize, debouncedSearch],
    queryFn: () =>
      attributeService.getAttributes({
        page,
        limit: pageSize,
        search: debouncedSearch || undefined,
      }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: attributeService.createAttribute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes"] });
      toast.success("Attribute created successfully");
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create attribute");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      attributeService.updateAttribute(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes"] });
      toast.success("Attribute updated successfully");
      setIsFormOpen(false);
      setEditingAttribute(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update attribute");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: attributeService.deleteAttribute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes"] });
      toast.success("Attribute deleted successfully");
      setDeletingAttributeId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete attribute");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      attributeService.toggleAttributeStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes"] });
      toast.success("Attribute status updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  // Handlers
  const handleCreate = () => {
    setEditingAttribute(null);
    setIsFormOpen(true);
  };

  const handleEdit = (attribute: TAttribute) => {
    setEditingAttribute(attribute);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (deletingAttributeId) {
      await deleteMutation.mutateAsync(deletingAttributeId);
    }
  };

  const handleFormSubmit = async (data: any) => {
    if (editingAttribute) {
      await updateMutation.mutateAsync({ id: editingAttribute.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const attributeList = Array.isArray(attributesData)
    ? attributesData
    : attributesData?.data || [];

  const meta =
    attributesData && "meta" in attributesData
      ? attributesData.meta
      : undefined;
  const total = meta?.total || attributeList.length;
  const totalPages = meta?.total_pages || Math.ceil(total / pageSize);

  return (
    <div className="flex flex-col h-full w-full p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attributes</h1>
          <p className="text-muted-foreground mt-1">
            Manage product attributes (e.g., Color, Size, Material)
          </p>
        </div>
        <Button onClick={handleCreate} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Add Attribute
        </Button>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
          <CardDescription>Find and filter attributes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search attributes by name..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attributes Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Attributes</CardTitle>
          <CardDescription>
            {total} {total === 1 ? "attribute" : "attributes"} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 h-full w-full">
              <Loader2 className="animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">Failed to load attributes</p>
              <p className="text-sm text-muted-foreground mt-1">
                {(error as any)?.message || "An error occurred"}
              </p>
            </div>
          ) : attributeList.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No attributes found</p>
              <Button onClick={handleCreate} variant="outline" className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create your first attribute
              </Button>
            </div>
          ) : (
            <AttributeTable
              data={attributeList}
              page={page}
              pageSize={pageSize}
              total={total}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onEdit={handleEdit}
              onDelete={setDeletingAttributeId}
              onToggleStatus={(id, status) =>
                toggleStatusMutation.mutate({ id, isActive: !status })
              }
            />
          )}
        </CardContent>
      </Card>

      {/* Attribute Form Modal */}
      <AttributeForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingAttribute(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingAttribute}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingAttributeId}
        onOpenChange={(open) => !open && setDeletingAttributeId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              attribute and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
