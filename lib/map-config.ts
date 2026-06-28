/**
 * Map provider configuration.
 * Change MAP_PROVIDER or swap MapPicker implementation to migrate providers.
 */

export type MapProvider = "leaflet" | "google";

export const MAP_CONFIG = {
  PROVIDER: (process.env.NEXT_PUBLIC_MAP_PROVIDER ?? "leaflet") as MapProvider,

  /** Default map center (New Delhi) */
  DEFAULT_CENTER: {
    latitude: 28.6139,
    longitude: 77.209,
  },

  DEFAULT_ZOOM: 13,

  /** Store / warehouse origin for route preview */
  ROUTE_ORIGIN: {
    latitude: Number(process.env.NEXT_PUBLIC_STORE_LATITUDE ?? 28.6139),
    longitude: Number(process.env.NEXT_PUBLIC_STORE_LONGITUDE ?? 77.209),
  },

  NOMINATIM_URL: "https://nominatim.openstreetmap.org",
  NOMINATIM_USER_AGENT: "AdminWeb/1.0 (customer-address-admin)",

  OPENROUTESERVICE_URL: "https://api.openrouteservice.org",
  OPENROUTESERVICE_API_KEY:
    process.env.NEXT_PUBLIC_OPENROUTESERVICE_API_KEY ?? "",

  OSM_TILE_URL: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  OSM_ATTRIBUTION:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
} as const;
