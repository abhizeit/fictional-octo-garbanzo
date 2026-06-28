"use client";

import { format } from "date-fns";
import { MoreHorizontal, Edit, Trash2, CheckCircle2, XCircle } from "lucide-react";
import Image from "next/image";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TVariant } from "../variant.types";

interface VariantTableProps {
  data: TVariant[];
  onEdit: (variant: TVariant) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
}

export function VariantTable({
  data,
  onEdit,
  onDelete,
  onToggleStatus,
}: VariantTableProps) {
  function formatVariantPrice(price: TVariant["price"]): string {
    if (price == null) return "—";
    if (typeof price === "number" && Number.isFinite(price)) {
      return `$${price.toFixed(2)}`;
    }
    if (typeof price === "string") {
      const n = Number(price);
      return Number.isFinite(n) ? `$${n.toFixed(2)}` : "—";
    }
    if (typeof price === "object" && "toString" in price) {
      const n = Number(String(price));
      return Number.isFinite(n) ? `$${n.toFixed(2)}` : "—";
    }
    return "—";
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Variant</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((variant) => (
            <TableRow key={variant.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  {variant.image ? (
                    <div className="relative h-10 w-10 overflow-hidden rounded-md border flex-shrink-0">
                      <Image
                        src={variant.image}
                        alt={variant.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border bg-muted text-[10px] text-muted-foreground">
                      Img
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{variant.name}</p>
                      {variant.is_default && (
                        <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {variant.sku || "—"} ·{" "}
                      {format(new Date(variant.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{formatVariantPrice(variant.price)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-xs">
                  {variant.is_available ? (
                    <span className="inline-flex items-center text-green-600">
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                      Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-red-600">
                      <XCircle className="mr-1 h-3.5 w-3.5" />
                      Unavailable
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Switch
                    checked={variant.is_active}
                    onCheckedChange={() => onToggleStatus(variant.id, variant.is_active)}
                  />
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
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          if (
                            window.confirm("Are you sure you want to delete this variant?")
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
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
