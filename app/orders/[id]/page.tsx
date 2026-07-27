"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Package,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useOrder, useUpdateOrderStatus } from "@/lib/hooks/use-orders";
import type { NextSearchParamsRecord } from "@/lib/next-search-params";
import {
  ORDER_STATUS_CLASS,
  ORDER_STATUS_TRANSITIONS,
  OrderStatus,
} from "../order.types";
import { useState } from "react";

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ORDER_STATUS_CLASS[status]}`}
    >
      {status}
    </span>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAmount(amount: string | number) {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);
}

function statusActionLabel(status: OrderStatus) {
  switch (status) {
    case "PREPARING":
      return "Mark Preparing";
    case "COMPLETED":
      return "Mark Completed";
    case "CANCELLED":
      return "Cancel Order";
    default:
      return status;
  }
}

export default function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<NextSearchParamsRecord>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const resolvedSearchParams = use(searchParams);
  const backQuery = new URLSearchParams(
    Object.entries(resolvedSearchParams).reduce(
      (acc, [key, value]) => {
        if (value != null) acc[key] = String(value);
        return acc;
      },
      {} as Record<string, string>,
    ),
  ).toString();

  const { data: order, isLoading, error } = useOrder(id);
  const updateStatus = useUpdateOrderStatus();
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);

  const handleConfirmStatus = async () => {
    if (!pendingStatus) return;
    await updateStatus.mutateAsync({ id, status: pendingStatus });
    setPendingStatus(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">Failed to load order</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() =>
            router.push(`/orders${backQuery ? `?${backQuery}` : ""}`)
          }
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
      </div>
    );
  }

  const nextStatuses = ORDER_STATUS_TRANSITIONS[order.status] ?? [];

  return (
    <div className="flex flex-col h-full w-full p-8 space-y-6">
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            router.push(`/orders${backQuery ? `?${backQuery}` : ""}`)
          }
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Order</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-muted-foreground mt-1 font-mono text-sm truncate">
            {order.id}
          </p>
        </div>
        {nextStatuses.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((status) => (
              <Button
                key={status}
                variant={status === "CANCELLED" ? "destructive" : "default"}
                disabled={updateStatus.isPending}
                onClick={() => setPendingStatus(status)}
              >
                {statusActionLabel(status)}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-lg">
              {formatAmount(order.total_amount)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Items</CardDescription>
            <CardTitle className="text-lg">{order.items.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Placed</CardDescription>
            <CardTitle className="text-lg">
              {formatDate(order.created_at)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <p className="text-muted-foreground">Receiver</p>
              <p className="font-medium">{order.address.receiver_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-mono">{order.address.receiver_phone}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Customer ID</p>
              <Link
                href={`/customers/${order.user_id}`}
                className="font-mono text-xs text-primary hover:underline"
              >
                {order.user_id.slice(0, 8)}… View customer
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Delivery Address
            </CardTitle>
            {order.address.address_type && (
              <CardDescription className="capitalize">
                {order.address.address_type}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              {order.address.formatted_address ||
                [order.address.street, order.address.city, order.address.postal_code]
                  .filter(Boolean)
                  .join(", ") ||
                "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Items
          </CardTitle>
          <CardDescription>
            {order.items.length} line{" "}
            {order.items.length === 1 ? "item" : "items"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {order.items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No items
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.product_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.variant_name}
                          {item.variant_sku ? ` · ${item.variant_sku}` : ""}
                        </div>
                        {item.attributes &&
                          Object.keys(item.attributes).length > 0 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {Object.entries(item.attributes)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(" · ")}
                            </div>
                          )}
                        {item.addons && item.addons.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Addons:{" "}
                            {item.addons
                              .map(
                                (a) =>
                                  `${a.name} ×${a.quantity} (${formatAmount(a.price)})`,
                              )
                              .join(", ")}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatAmount(item.unit_price)}</TableCell>
                      <TableCell className="font-medium">
                        {formatAmount(item.total_price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      <p className="text-xs text-muted-foreground">
        Last updated {formatDate(order.updated_at)}
      </p>

      <AlertDialog
        open={!!pendingStatus}
        onOpenChange={(open) => !open && setPendingStatus(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update order status?</AlertDialogTitle>
            <AlertDialogDescription>
              Change this order from{" "}
              <span className="font-medium">{order.status}</span> to{" "}
              <span className="font-medium">{pendingStatus}</span>. This cannot
              be undone for completed or cancelled orders.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateStatus.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmStatus}
              disabled={updateStatus.isPending}
              className={
                pendingStatus === "CANCELLED"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : undefined
              }
            >
              {updateStatus.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
