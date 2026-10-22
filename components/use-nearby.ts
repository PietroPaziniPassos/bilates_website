"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NEARBY_RADIUS_KM, cityCoords, distanceKm } from "@/lib/cidades";

export type NearbyStatus = "unsupported" | "asking" | "on" | "empty" | "denied" | "unavailable";

const GEO_OPTIONS: PositionOptions = { enableHighAccuracy: false, maximumAge: 10 * 60_000, timeout: 10_000 };

function placesWithin(origin: [number, number], places: [string, number][]) {
  const keys = new Set<string>();
  for (const [key] of places) {
    const [city, uf] = key.split("|");
    const coords = cityCoords(city, uf);
    if (coords && distanceKm(origin, coords) <= NEARBY_RADIUS_KM) keys.add(key);
  }
  return keys;
}

type Handlers = { onFound: (manual: boolean) => void; onLost: () => void };

// A permissão é pedida ao abrir a página (decisão do Pietro); o status fica exposto para o
// seletor de Local explicar quando o filtro não pode ligar, em vez de falhar calado.
export function useNearby(places: [string, number][], handlers: Handlers) {
  const [status, setStatus] = useState<NearbyStatus>("asking");
  const [origin, setOrigin] = useState<[number, number] | null>(null);
  const handlersRef = useRef(handlers);
  const placesRef = useRef(places);
  useEffect(() => {
    handlersRef.current = handlers;
    placesRef.current = places;
  });

  const locate = useCallback((manual: boolean) => {
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      handlersRef.current.onLost();
      return;
    }
    if (manual) setStatus("asking");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const here: [number, number] = [coords.latitude, coords.longitude];
        setOrigin(here);
        if (placesWithin(here, placesRef.current).size === 0) {
          setStatus("empty");
          handlersRef.current.onLost();
          return;
        }
        setStatus("on");
        handlersRef.current.onFound(manual);
      },
      (err) => {
        setStatus(err.code === 1 ? "denied" : "unavailable");
        handlersRef.current.onLost();
      },
      GEO_OPTIONS,
    );
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- pedido único ao montar
    locate(false);
  }, [locate]);

  const nearbyPlaces = useMemo(
    () => (origin && status === "on" ? placesWithin(origin, places) : null),
    [origin, places, status],
  );
  const count = nearbyPlaces
    ? places.reduce((sum, [key, n]) => sum + (nearbyPlaces.has(key) ? n : 0), 0)
    : 0;

  return { status, nearbyPlaces, count, locate: () => locate(true) };
}
