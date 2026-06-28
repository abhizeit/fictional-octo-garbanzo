"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MapPicker } from "@/components/maps/map-picker";
import type { MapCoordinate, MapLocation } from "@/components/maps/types";
import { MAP_CONFIG } from "@/lib/map-config";
import {
  CustomerAddress,
  CustomerAddressInput,
} from "../customer.types";

const addressFormSchema = z.object({
  receiver_name: z.string().min(2, "Receiver name is required"),
  receiver_phone: z
    .string()
    .min(10, "Valid phone number is required")
    .max(16),
  address_type: z.string().optional(),
  address_details: z.string().optional(),
  formatted_address: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  postal_code: z.string().optional(),
  is_default: z.boolean(),
});

type AddressFormValues = z.infer<typeof addressFormSchema>;

interface CustomerAddressFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CustomerAddressInput) => Promise<void>;
  initialData?: CustomerAddress | null;
  isLoading?: boolean;
  defaultReceiverName?: string;
  defaultReceiverPhone?: string;
}

function locationFromAddress(address: CustomerAddress): MapCoordinate {
  return {
    latitude: address.latitude,
    longitude: address.longitude,
  };
}

export function CustomerAddressForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
  defaultReceiverName = "",
  defaultReceiverPhone = "",
}: CustomerAddressFormProps) {
  const isEditing = !!initialData;
  const [mapLocation, setMapLocation] = useState<MapLocation | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      receiver_name: "",
      receiver_phone: "",
      address_type: "home",
      address_details: "",
      formatted_address: "",
      street: "",
      city: "",
      district: "",
      postal_code: "",
      is_default: false,
    },
  });

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      reset({
        receiver_name: initialData.receiver_name,
        receiver_phone: initialData.receiver_phone,
        address_type: initialData.address_type || "home",
        address_details: initialData.address_details || "",
        formatted_address: initialData.formatted_address || "",
        street: initialData.street || "",
        city: initialData.city || "",
        district: initialData.district || "",
        postal_code: initialData.postal_code || "",
        is_default: initialData.is_default,
      });
      setMapLocation({
        latitude: initialData.latitude,
        longitude: initialData.longitude,
        address: {
          formatted_address: initialData.formatted_address || undefined,
          street: initialData.street || undefined,
          city: initialData.city || undefined,
          district: initialData.district || undefined,
          postal_code: initialData.postal_code || undefined,
        },
      });
    } else {
      reset({
        receiver_name: defaultReceiverName,
        receiver_phone: defaultReceiverPhone,
        address_type: "home",
        address_details: "",
        formatted_address: "",
        street: "",
        city: "",
        district: "",
        postal_code: "",
        is_default: false,
      });
      setMapLocation(null);
    }
    setMapError(null);
  }, [open, initialData, reset, defaultReceiverName, defaultReceiverPhone]);

  const applyMapLocation = (location: MapLocation) => {
    setMapLocation(location);
    setMapError(null);

    if (location.address?.formatted_address) {
      setValue("formatted_address", location.address.formatted_address);
    }
    if (location.address?.street) {
      setValue("street", location.address.street);
    }
    if (location.address?.city) {
      setValue("city", location.address.city);
    }
    if (location.address?.district) {
      setValue("district", location.address.district);
    }
    if (location.address?.postal_code) {
      setValue("postal_code", location.address.postal_code);
    }
  };

  const submitForm = handleSubmit(async (data) => {
    if (!mapLocation) {
      setMapError("Please select a location on the map");
      return;
    }

    await onSubmit({
      receiver_name: data.receiver_name,
      receiver_phone: data.receiver_phone,
      address_type: data.address_type,
      address_details: data.address_details || undefined,
      formatted_address: data.formatted_address || undefined,
      street: data.street || undefined,
      city: data.city || undefined,
      district: data.district || undefined,
      postal_code: data.postal_code || undefined,
      country: mapLocation.address?.country,
      region: mapLocation.address?.region,
      is_default: data.is_default,
      latitude: mapLocation.latitude,
      longitude: mapLocation.longitude,
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={submitForm}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Address" : "Add Address"}
            </DialogTitle>
            <DialogDescription>
              Search or click the map to set the delivery location. Route preview
              uses OpenRouteService when an API key is configured.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="receiver_name">
                  Receiver Name <span className="text-destructive">*</span>
                </Label>
                <Input id="receiver_name" {...register("receiver_name")} />
                {errors.receiver_name && (
                  <p className="text-sm text-destructive">
                    {errors.receiver_name.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="receiver_phone">
                  Receiver Phone <span className="text-destructive">*</span>
                </Label>
                <Input id="receiver_phone" {...register("receiver_phone")} />
                {errors.receiver_phone && (
                  <p className="text-sm text-destructive">
                    {errors.receiver_phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Address Type</Label>
                <Select
                  value={watch("address_type") || "home"}
                  onValueChange={(val) => setValue("address_type", val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end pb-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_default"
                    checked={watch("is_default")}
                    onCheckedChange={(checked) =>
                      setValue("is_default", checked === true)
                    }
                  />
                  <Label htmlFor="is_default">Default address</Label>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address_details">Apartment / Floor / Landmark</Label>
              <Textarea
                id="address_details"
                rows={2}
                placeholder="e.g. Flat 4B, near metro station"
                {...register("address_details")}
              />
            </div>

            <MapPicker
              value={
                mapLocation
                  ? {
                      latitude: mapLocation.latitude,
                      longitude: mapLocation.longitude,
                    }
                  : initialData
                    ? locationFromAddress(initialData)
                    : null
              }
              onChange={applyMapLocation}
              defaultCenter={MAP_CONFIG.DEFAULT_CENTER}
              routeFrom={MAP_CONFIG.ROUTE_ORIGIN}
              height={300}
              disabled={isLoading}
            />
            {mapError && (
              <p className="text-sm text-destructive">{mapError}</p>
            )}

            <div className="grid gap-2">
              <Label htmlFor="formatted_address">Formatted Address</Label>
              <Input
                id="formatted_address"
                placeholder="Auto-filled from map"
                {...register("formatted_address")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="street">Street</Label>
                <Input id="street" {...register("street")} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register("city")} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Address"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
