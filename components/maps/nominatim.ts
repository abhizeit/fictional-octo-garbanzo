import { MAP_CONFIG } from "@/lib/map-config";
import type { GeocodedAddress, MapCoordinate, MapSearchResult } from "./types";

const NOMINATIM_HEADERS = {
  Accept: "application/json",
  "User-Agent": MAP_CONFIG.NOMINATIM_USER_AGENT,
};

type NominatimAddress = {
  road?: string;
  house_number?: string;
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  county?: string;
  postcode?: string;
  country?: string;
  country_code?: string;
};

function parseNominatimAddress(
  address: NominatimAddress,
  displayName?: string,
): GeocodedAddress {
  return {
    formatted_address: displayName,
    street: address.road,
    street_number: address.house_number,
    city: address.city || address.town || address.village,
    district: address.county,
    region: address.state,
    postal_code: address.postcode,
    country: address.country,
    iso_country_code: address.country_code?.toUpperCase(),
  };
}

export async function searchPlaces(query: string): Promise<MapSearchResult[]> {
  if (!query.trim()) return [];

  const url = new URL(`${MAP_CONFIG.NOMINATIM_URL}/search`);
  url.searchParams.set("format", "json");
  url.searchParams.set("q", query.trim());
  url.searchParams.set("limit", "6");
  url.searchParams.set("addressdetails", "1");

  const response = await fetch(url.toString(), { headers: NOMINATIM_HEADERS });
  if (!response.ok) {
    throw new Error("Place search failed");
  }

  const results = (await response.json()) as Array<{
    place_id: number;
    lat: string;
    lon: string;
    display_name: string;
    address?: NominatimAddress;
  }>;

  return results.map((item) => ({
    id: String(item.place_id),
    label: item.display_name,
    location: {
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      address: item.address
        ? parseNominatimAddress(item.address, item.display_name)
        : { formatted_address: item.display_name },
    },
  }));
}

export async function reverseGeocode(
  coordinate: MapCoordinate,
): Promise<GeocodedAddress> {
  const url = new URL(`${MAP_CONFIG.NOMINATIM_URL}/reverse`);
  url.searchParams.set("format", "json");
  url.searchParams.set("lat", String(coordinate.latitude));
  url.searchParams.set("lon", String(coordinate.longitude));
  url.searchParams.set("addressdetails", "1");

  const response = await fetch(url.toString(), { headers: NOMINATIM_HEADERS });
  if (!response.ok) {
    throw new Error("Reverse geocoding failed");
  }

  const data = (await response.json()) as {
    display_name?: string;
    address?: NominatimAddress;
  };

  if (!data.address) {
    return { formatted_address: data.display_name };
  }

  return parseNominatimAddress(data.address, data.display_name);
}
