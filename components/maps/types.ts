/**
 * Provider-agnostic map types.
 * Swap the MapPicker implementation (Leaflet → Google Maps) without touching consumers.
 */

export interface MapCoordinate {
  latitude: number;
  longitude: number;
}

export interface GeocodedAddress {
  formatted_address?: string;
  city?: string;
  country?: string;
  district?: string;
  region?: string;
  postal_code?: string;
  street?: string;
  street_number?: string;
  iso_country_code?: string;
}

export interface MapLocation extends MapCoordinate {
  address?: GeocodedAddress;
}

export interface MapRoute {
  coordinates: MapCoordinate[];
  distanceMeters?: number;
  durationSeconds?: number;
}

export interface MapSearchResult {
  id: string;
  label: string;
  location: MapLocation;
}

export interface MapPickerProps {
  /** Currently selected pin position */
  value: MapCoordinate | null;
  /** Fired when the user picks or drags a pin (includes reverse-geocoded address when available) */
  onChange: (location: MapLocation) => void;
  /** Map center when no pin is selected */
  defaultCenter?: MapCoordinate;
  /** Optional origin for route preview (e.g. store/warehouse) */
  routeFrom?: MapCoordinate | null;
  className?: string;
  height?: number | string;
  disabled?: boolean;
  zoom?: number;
}

export interface MapPickerRef {
  flyTo: (coordinate: MapCoordinate, zoom?: number) => void;
}
