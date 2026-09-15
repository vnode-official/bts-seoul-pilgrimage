"use client";

import { useEffect, useRef } from "react";
import { useLiveTransit } from "@/stores/live-transit";
import { createVehiclePin } from "@/lib/vehicle-pin";
import type { TransitVehicle } from "@/types/transit";

export function LiveVehicleLayer({ map }: { map: naver.maps.Map }) {
  const vehicles = useLiveTransit((state) => state.snapshot?.vehicles ?? []);
  const overlaysRef = useRef<naver.maps.Marker[]>([]);

  useEffect(() => {
    const maps = window.naver?.maps;
    if (!maps) return;
    overlaysRef.current.forEach((marker) => marker.setMap(null));
    const plottable = vehicles.filter(
      (vehicle): vehicle is TransitVehicle & { coords: NonNullable<TransitVehicle["coords"]> } =>
        vehicle.coords !== null,
    );
    overlaysRef.current = plottable.map((vehicle) => {
      const el = createVehiclePin(vehicle);
      return new maps.Marker({
        map,
        position: new maps.LatLng(vehicle.coords.lat, vehicle.coords.lng),
        icon: { content: el, anchor: new maps.Point(8, 8) },
        zIndex: vehicle.mode === "bus" ? 60 : 55,
        title: `${vehicle.lineLabel} ${vehicle.label}`,
      });
    });
    return () => {
      overlaysRef.current.forEach((marker) => marker.setMap(null));
      overlaysRef.current = [];
    };
  }, [map, vehicles]);

  return null;
}
