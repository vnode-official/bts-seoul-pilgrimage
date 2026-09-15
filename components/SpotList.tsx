"use client";

import { SPOTS } from "@/data/spots";
import { filterSpots } from "@/lib/access";
import { useMapSession } from "@/stores/map-session";
import { SpotListItem } from "@/components/SpotListItem";

export function SpotList() {
  const tier = useMapSession((s) => s.tier);
  const categoryFilter = useMapSession((s) => s.categoryFilter);
  const search = useMapSession((s) => s.search);
  const spots = filterSpots(SPOTS, {
    tier,
    filter: categoryFilter,
    search,
    includeLocked: true,
  });

  if (spots.length === 0) {
    return (
      <p className="px-1 py-8 text-center text-[13px] text-white/45">
        No pins match that search. Try a station name or neighborhood.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {spots.map((spot) => (
        <SpotListItem key={spot.id} spot={spot} />
      ))}
    </div>
  );
}
