"use client";

import type { Spot } from "@/types";

export function MockDotField({
  spots,
  onSpot,
}: {
  spots: Spot[];
  onSpot: (spot: Spot) => void;
}) {
  return (
    <div className="absolute inset-0 z-[1]">
      {spots.map((spot) => {
        const left = ((spot.coords.lng - 126.82) / 0.38) * 100;
        const top = (1 - (spot.coords.lat - 37.46) / 0.16) * 100;
        return (
          <button
            key={spot.id}
            type="button"
            onClick={() => onSpot(spot)}
            className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_16px_rgba(139,92,246,0.85)]"
            style={{
              left: `${Math.min(96, Math.max(4, left))}%`,
              top: `${Math.min(90, Math.max(8, top))}%`,
            }}
            aria-label={spot.nameEn}
          />
        );
      })}
    </div>
  );
}
