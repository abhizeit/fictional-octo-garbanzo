"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { MapPickerProps } from "./types";

/**
 * Provider-agnostic map picker entry point.
 * Today: Leaflet + OSM + Nominatim + OpenRouteService.
 * Tomorrow: swap the dynamic import to a GoogleMapPicker with the same props.
 */
const LeafletMapPicker = dynamic(
  () =>
    import("./leaflet-map-picker").then((mod) => mod.LeafletMapPicker),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-80 items-center justify-center rounded-md border bg-muted/30">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    ),
  },
);

export function MapPicker(props: MapPickerProps) {
  return <LeafletMapPicker {...props} />;
}

export type { MapPickerProps, MapCoordinate, MapLocation, GeocodedAddress } from "./types";
