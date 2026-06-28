"use client";

import { useState } from "react";
import { MapPin, MoreVertical, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { CustomerAddressForm } from "./customer-address-form";
import {
  useCreateCustomerAddress,
  useDeleteCustomerAddress,
  useSetDefaultCustomerAddress,
  useUpdateCustomerAddress,
} from "../hooks/use-customer-addresses";
import { CustomerAddress } from "../customer.types";

interface CustomerAddressesCardProps {
  customerId: string;
  customerName?: string | null;
  customerPhone: string;
  addresses: CustomerAddress[];
}

export function CustomerAddressesCard({
  customerId,
  customerName,
  customerPhone,
  addresses,
}: CustomerAddressesCardProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(
    null,
  );
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(
    null,
  );

  const createMutation = useCreateCustomerAddress(customerId);
  const updateMutation = useUpdateCustomerAddress(customerId);
  const deleteMutation = useDeleteCustomerAddress(customerId);
  const setDefaultMutation = useSetDefaultCustomerAddress(customerId);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const openCreate = () => {
    setEditingAddress(null);
    setFormOpen(true);
  };

  const openEdit = (address: CustomerAddress) => {
    setEditingAddress(address);
    setFormOpen(true);
  };

  const handleSubmit = async (data: Parameters<
    typeof createMutation.mutateAsync
  >[0]) => {
    if (editingAddress) {
      await updateMutation.mutateAsync({
        addressId: editingAddress.id,
        data,
      });
    } else {
      await createMutation.mutateAsync(data);
    }
    setFormOpen(false);
    setEditingAddress(null);
  };

  const handleDelete = async () => {
    if (deletingAddressId) {
      await deleteMutation.mutateAsync(deletingAddressId);
      setDeletingAddressId(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Addresses
            </CardTitle>
            <CardDescription>
              Delivery addresses saved by this customer
            </CardDescription>
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Address
          </Button>
        </CardHeader>
        <CardContent>
          {addresses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">
                No addresses saved yet
              </p>
              <Button variant="outline" size="sm" onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Add first address
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="rounded-lg border p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">
                          {address.receiver_name}
                        </span>
                        <span className="text-sm text-muted-foreground font-mono">
                          {address.receiver_phone}
                        </span>
                        {address.is_default && (
                          <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs">
                            Default
                          </span>
                        )}
                        {address.address_type && (
                          <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs capitalize text-secondary-foreground">
                            {address.address_type}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {address.formatted_address ||
                          [address.street, address.city, address.district]
                            .filter(Boolean)
                            .join(", ") ||
                          "—"}
                      </p>
                      {address.address_details && (
                        <p className="text-xs text-muted-foreground">
                          {address.address_details}
                        </p>
                      )}
                      <p className="text-xs font-mono text-muted-foreground">
                        {address.latitude.toFixed(5)},{" "}
                        {address.longitude.toFixed(5)}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(address)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        {!address.is_default && (
                          <DropdownMenuItem
                            onClick={() =>
                              setDefaultMutation.mutate(address.id)
                            }
                          >
                            <Star className="mr-2 h-4 w-4" />
                            Set as default
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeletingAddressId(address.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CustomerAddressForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingAddress(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingAddress}
        isLoading={isSaving}
        defaultReceiverName={customerName || ""}
        defaultReceiverPhone={customerPhone}
      />

      <AlertDialog
        open={!!deletingAddressId}
        onOpenChange={(open) => !open && setDeletingAddressId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete address?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the address from the customer&apos;s saved
              addresses.
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
    </>
  );
}
