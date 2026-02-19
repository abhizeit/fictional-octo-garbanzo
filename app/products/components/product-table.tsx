"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Product } from "@/app/products/product.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProductTableProps {
  data: Product[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
}

export function ProductTable({
  data,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onDelete,
  onToggleStatus,
}: ProductTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const columns: ColumnDef<Product>[] = [
    {
      id: "Image",
      accessorFn: (row) => row.image,
      header: "Image",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-10 h-10 rounded-md object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
                No Img
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: "Name",
      accessorFn: (row) => row.name,
      header: "Name",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div>
            <div className="font-medium">{product.name}</div>
            <div className="text-xs text-muted-foreground font-mono">
              {product.code}
            </div>
          </div>
        );
      },
    },
    {
      id: "Categories",
      header: "Categories",
      cell: ({ row }) => {
        const categories = row.original.categories || [];
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {categories.length > 0 ? (
              categories.map((cat, index) => (
                <span
                  key={cat.category.id}
                  className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-sm"
                >
                  {cat.category.name}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">-</span>
            )}
          </div>
        );
      },
    },
    {
      id: "Info",
      header: "Info",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            <span>Variants: {product._count?.variants ?? 0}</span>
            <span>Addons: {product._count?.addons ?? 0}</span>
          </div>
        );
      },
    },
    {
      id: "Status",
      accessorFn: (row) => row.is_active,
      header: "Status",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={product.is_active ?? true}
              onCheckedChange={() =>
                onToggleStatus(product.id, product.is_active ?? true)
              }
            />
            <div className="flex flex-col">
              <span className="text-sm">
                {product.is_active ? "Active" : "Inactive"}
              </span>
              <span className="text-xs text-muted-foreground">
                {product.is_available ? "Available" : "Unavailable"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      id: "Actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    router.push(
                      `/products/edit/${product.id}?${searchParams.toString()}`,
                    )
                  }
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(product.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {data.length > 0 ? (page - 1) * pageSize + 1 : 0} to{" "}
          {Math.min(page * pageSize, total)} of {total} entries
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {page} of {totalPages || 1}
            </div>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= (totalPages || 1)}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
