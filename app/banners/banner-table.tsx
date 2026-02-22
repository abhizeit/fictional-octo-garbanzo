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
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { TBanner } from "./banner.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BannerTableProps {
  data: TBanner[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
}

export function BannerTable({
  data,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onDelete,
  onToggleStatus,
}: BannerTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const columns: ColumnDef<TBanner>[] = [
    {
      id: "Title",
      accessorFn: (row) => row.title,
      header: "Title",
      cell: ({ row }) => {
        const banner = row.original;
        return (
          <div className="flex items-center gap-3">
            {banner.image_url && (
              <img
                src={banner.image_url}
                alt={banner.title}
                className="w-16 h-10 rounded-md object-cover"
              />
            )}
            <div>
              <div className="font-medium">{banner.title}</div>
              {banner.subtitle && (
                <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {banner.subtitle}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: "LinkType",
      accessorFn: (row) => row.link_type,
      header: "Link Type",
      cell: ({ row }) => (
        <span className="text-sm capitalize text-muted-foreground">
          {row.original.link_type}
        </span>
      ),
    },
    {
      id: "LinkValue",
      accessorFn: (row) => row.link_value,
      header: "Link Value",
      cell: ({ row }) => (
        <span className="font-mono text-xs">
          {row.original.link_value || "-"}
        </span>
      ),
    },
    {
      id: "Position",
      accessorFn: (row) => row.position,
      header: "Position",
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {row.original.position || "-"}
        </span>
      ),
    },
    {
      id: "Status",
      accessorFn: (row) => row.is_active,
      header: "Status",
      cell: ({ row }) => {
        const banner = row.original;
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={banner.is_active ?? true}
              onCheckedChange={() =>
                onToggleStatus(banner.id, banner.is_active ?? true)
              }
            />
            <span className="text-sm">
              {banner.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        );
      },
    },
    {
      id: "Actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const banner = row.original;
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
                      `/banners/edit/${banner.id}?${searchParams.toString()}`,
                    )
                  }
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(banner.id)}
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
                  No banners found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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
