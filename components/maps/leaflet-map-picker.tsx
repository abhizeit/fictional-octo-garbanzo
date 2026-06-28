"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2, MapPin, Navigation, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MAP_CONFIG } from "@/lib/map-config";
import { reverseGeocode, searchPlaces } from "./nominatim";
import { fetchRoute } from "./openroute";
import type {
  MapCoordinate,
  MapLocation,
  MapPickerProps,
  MapRoute,
  MapSearchResult,
} from "./types";

// Fix default marker icons in bundlers
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const originIcon = L.divIcon({
  className: "",
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#2563eb;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function toLatLng(coord: MapCoordinate): [number, number] {
  return [coord.latitude, coord.longitude];
}

function MapViewSync({
  center,
  zoom,
}: {
  center: MapCoordinate;
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(toLatLng(center), zoom, { duration: 0.6 });
  }, [map, center.latitude, center.longitude, zoom]);
  return null;
}

function MapClickHandler({
  disabled,
  onPick,
}: {
  disabled?: boolean;
  onPick: (coord: MapCoordinate) => void;
}) {
  useMapEvents({
    click(e) {
      if (disabled) return;
      onPick({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
  });
  return null;
}

export function LeafletMapPicker({
  value,
  onChange,
  defaultCenter = MAP_CONFIG.DEFAULT_CENTER,
  routeFrom = MAP_CONFIG.ROUTE_ORIGIN,
  className = "",
  height = 320,
  disabled = false,
  zoom = MAP_CONFIG.DEFAULT_ZOOM,
}: MapPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MapSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [route, setRoute] = useState<MapRoute | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const center = value ?? defaultCenter;
  const mapCenter = useMemo(() => center, [center.latitude, center.longitude]);

  const applyLocation = useCallback(
    async (coordinate: MapCoordinate) => {
      setIsGeocoding(true);
      try {
        const address = await reverseGeocode(coordinate);
        const location: MapLocation = { ...coordinate, address };
        onChange(location);

        if (routeFrom) {
          const routePreview = await fetchRoute(routeFrom, coordinate);
          setRoute(routePreview);
        }
      } catch {
        onChange(coordinate);
      } finally {
        setIsGeocoding(false);
      }
    },
    [onChange, routeFrom],
  );

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    searchDebounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchPlaces(query);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  }, []);

  const selectSearchResult = async (result: MapSearchResult) => {
    setSearchQuery(result.label);
    setSearchResults([]);
    onChange(result.location);
    if (routeFrom) {
      const routePreview = await fetchRoute(routeFrom, result.location);
      setRoute(routePreview);
    }
  };

  useEffect(() => {
    if (value && routeFrom) {
      fetchRoute(routeFrom, value).then(setRoute).catch(() => setRoute(null));
    } else {
      setRoute(null);
    }
  }, [value?.latitude, value?.longitude, routeFrom]);

  const routePositions = route?.coordinates.map(toLatLng) ?? [];
  const hasRoutePreview = routePositions.length >= 2 && route?.distanceMeters != null;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search address (Nominatim)..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
          disabled={disabled}
        />
        {(isSearching || isGeocoding) && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {searchResults.length > 0 && (
          <div className="absolute z-[1000] mt-1 w-full rounded-md border bg-popover shadow-md max-h-48 overflow-auto">
            {searchResults.map((result) => (
              <button
                key={result.id}
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent border-b last:border-b-0"
                onClick={() => selectSearchResult(result)}
              >
                {result.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        className="rounded-md border overflow-hidden relative"
        style={{ height: typeof height === "number" ? `${height}px` : height }}
      >
        <MapContainer
          center={toLatLng(mapCenter)}
          zoom={zoom}
          className="h-full w-full z-0"
          scrollWheelZoom={!disabled}
        >
          <TileLayer url={MAP_CONFIG.OSM_TILE_URL} attribution={MAP_CONFIG.OSM_ATTRIBUTION} />
          <MapViewSync center={mapCenter} zoom={value ? 16 : zoom} />
          <MapClickHandler disabled={disabled} onPick={applyLocation} />

          {routeFrom && hasRoutePreview && (
            <Marker position={toLatLng(routeFrom)} icon={originIcon} />
          )}

          {value && (
            <Marker
              position={toLatLng(value)}
              icon={defaultIcon}
              draggable={!disabled}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target as L.Marker;
                  const { lat, lng } = marker.getLatLng();
                  applyLocation({ latitude: lat, longitude: lng });
                },
              }}
            />
          )}

          {hasRoutePreview && (
            <Polyline positions={routePositions} color="#2563eb" weight={4} />
          )}
        </MapContainer>

        {!value && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
            <span className="rounded-full bg-background/90 px-3 py-1 text-xs text-muted-foreground shadow border flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Click the map or search to set location
            </span>
          </div>
        )}
      </div>

      {hasRoutePreview && route?.distanceMeters != null && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Navigation className="h-3 w-3" />
          Route from store: {(route.distanceMeters / 1000).toFixed(1)} km
          {route.durationSeconds != null &&
            ` · ~${Math.round(route.durationSeconds / 60)} min`}
        </p>
      )}

      {value && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                  applyLocation({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                  });
                });
              }
            }}
          >
            Use my location
          </Button>
        </div>
      )}
    </div>
  );
}
