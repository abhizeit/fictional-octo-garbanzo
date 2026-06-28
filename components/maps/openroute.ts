import { MAP_CONFIG } from "@/lib/map-config";
import type { MapCoordinate, MapRoute } from "./types";

const emptyRoute: MapRoute = { coordinates: [] };

/**
 * Fetch a driving route between two points via OpenRouteService.
 * Returns an empty route when no API key is configured or the request fails.
 * We intentionally do NOT fall back to a straight line — that misleads when
 * the store origin and selected pin are far apart (e.g. Delhi → Bangalore).
 */
export async function fetchRoute(
  from: MapCoordinate,
  to: MapCoordinate,
): Promise<MapRoute> {
  const apiKey = MAP_CONFIG.OPENROUTESERVICE_API_KEY;
  if (!apiKey) {
    return emptyRoute;
  }

  const response = await fetch(
    `${MAP_CONFIG.OPENROUTESERVICE_URL}/v2/directions/driving-car/geojson`,
    {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        coordinates: [
          [from.longitude, from.latitude],
          [to.longitude, to.latitude],
        ],
      }),
    },
  );

  if (!response.ok) {
    return emptyRoute;
  }

  const data = (await response.json()) as {
    features?: Array<{
      geometry?: { coordinates?: [number, number][] };
      properties?: {
        summary?: { distance?: number; duration?: number };
      };
    }>;
  };

  const feature = data.features?.[0];
  const line = feature?.geometry?.coordinates ?? [];

  if (line.length < 2) {
    return emptyRoute;
  }

  return {
    coordinates: line.map(([longitude, latitude]) => ({
      latitude,
      longitude,
    })),
    distanceMeters: feature?.properties?.summary?.distance,
    durationSeconds: feature?.properties?.summary?.duration,
  };
}
