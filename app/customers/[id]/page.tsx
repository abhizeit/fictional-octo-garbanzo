"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, Loader2, ShoppingBag } from "lucide-react";
import Link from "next/link";
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
import { useCustomer } from "@/lib/hooks/use-customers";
import { CustomerAddressesCard } from "../components/customer-addresses-card";
import { CustomerPersonalInfoCard } from "../components/customer-personal-info-card";
import type { NextSearchParamsRecord } from "@/lib/next-search-params";
import type { OrderStatus } from "../customer.types";

const orderStatusClass: Record<OrderStatus, string> = {
  PENDING: "bg-secondary text-secondary-foreground",
  PREPARING: "bg-primary text-primary-foreground",
  COMPLETED: "bg-muted text-muted-foreground border",
  CANCELLED: "bg-destructive text-destructive-foreground",
};

function StatusBadge({
  status,
  label,
  className = "",
}: {
  status?: OrderStatus;
  label: string;
  className?: string;
}) {
  const classes = status
    ? orderStatusClass[status]
    : "bg-primary text-primary-foreground";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classes} ${className}`}
    >
      {label}
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

export default function CustomerDetailPage({
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

  const { data: customer, isLoading, error } = useCustomer(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">Failed to load customer</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() =>
            router.push(`/customers${backQuery ? `?${backQuery}` : ""}`)
          }
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Customers
        </Button>
      </div>
    );
  }

  const favorites = customer.favorites ?? [];

  return (
    <div className="flex flex-col h-full w-full p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            router.push(`/customers${backQuery ? `?${backQuery}` : ""}`)
          }
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {customer.name || "Unnamed Customer"}
          </h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">
            {customer.code}
          </p>
        </div>
        <StatusBadge
          label={customer.is_active ? "Active" : "Inactive"}
          className="ml-auto"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Phone</CardDescription>
            <CardTitle className="text-lg font-mono">
              {customer.phone}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Email</CardDescription>
            <CardTitle className="text-lg truncate">
              {customer.email || "—"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Orders</CardDescription>
            <CardTitle className="text-lg">
              {customer._count?.orders ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Favorites</CardDescription>
            <CardTitle className="text-lg">
              {customer._count?.favorites ?? favorites.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <CustomerPersonalInfoCard customer={customer} />

      <CustomerAddressesCard
        customerId={customer.id}
        customerName={customer.name}
        customerPhone={customer.phone}
        addresses={customer.addresses}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Favorites
          </CardTitle>
          <CardDescription>
            Products this customer has saved
          </CardDescription>
        </CardHeader>
        <CardContent>
          {favorites.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No favorites yet
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Saved</TableHead>
                    <TableHead>Availability</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {favorites.map((fav) => (
                    <TableRow key={fav.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {fav.product.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={fav.product.image}
                              alt={fav.product.name}
                              className="h-10 w-10 rounded object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded bg-muted" />
                          )}
                          <Link
                            href={`/products/edit/${fav.product.id}`}
                            className="font-medium hover:underline"
                          >
                            {fav.product.name}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {fav.product.code}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(fav.created_at)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          label={
                            fav.product.is_available
                              ? "Available"
                              : "Unavailable"
                          }
                          className={
                            fav.product.is_available
                              ? ""
                              : "bg-muted text-muted-foreground border"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Recent Orders
          </CardTitle>
          <CardDescription>
            Last {customer.orders.length} orders placed by this customer
          </CardDescription>
        </CardHeader>
        <CardContent>
          {customer.orders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No orders yet
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customer.orders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/orders/${order.id}`)}
                    >
                      <TableCell className="font-mono text-xs">
                        {order.id.slice(0, 8)}…
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(order.created_at)}
                      </TableCell>
                      <TableCell>{order._count?.items ?? 0}</TableCell>
                      <TableCell className="font-medium">
                        {formatAmount(order.total_amount)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} label={order.status} />
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
        Joined {formatDate(customer.created_at)}
      </p>
    </div>
  );
}
