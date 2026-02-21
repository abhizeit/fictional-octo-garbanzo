"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Tags,
} from "lucide-react";
import Image from "next/image";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TVariant } from "../variant.types";

interface VariantTableProps {
  data: TVariant[];
  onEdit: (variant: TVariant) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  onManageAttributes: (variant: TVariant) => void;
}

export function VariantTable({
  data,
  onEdit,
  onDelete,
  onToggleStatus,
  onManageAttributes,
}: VariantTableProps) {
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Default</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((variant) => (
              <TableRow key={variant.id}>
                <TableCell>
                  {variant.image ? (
                    <div className="relative h-10 w-10 overflow-hidden rounded-md border">
                      <Image
                        src={variant.image}
                        alt={variant.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                      <span className="text-xs text-muted-foreground">
                        No img
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{variant.name}</TableCell>
                <TableCell>{variant.sku || "-"}</TableCell>
                <TableCell>${Number(variant.price).toFixed(2)}</TableCell>
                <TableCell>
                  {variant.is_default ? (
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                      Default
                    </span>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  {variant.is_available ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      <span className="text-xs">Yes</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <XCircle className="mr-1 h-4 w-4" />
                      <span className="text-xs">No</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={variant.is_active}
                    onCheckedChange={() =>
                      onToggleStatus(variant.id, variant.is_active)
                    }
                  />
                </TableCell>
                <TableCell>
                  {format(new Date(variant.created_at), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onEdit(variant)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Variant
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onManageAttributes(variant)}
                      >
                        <Tags className="mr-2 h-4 w-4" />
                        Manage Attributes
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this variant?",
                            )
                          ) {
                            onDelete(variant.id);
                          }
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Variant
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
