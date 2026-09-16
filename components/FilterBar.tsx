"use client";

import { Landmark, MapPinned, Utensils } from "lucide-react";
import { cn } from "@/lib/cn";
import { useMapSession } from "@/stores/map-session";
import type { MapFilter, RegionFilter } from "@/types";

const REGIONS: { id: RegionFilter; label: string }[] = [
  { id: "all", label: "Seoul + Goyang" },
  { id: "seoul", label: "Seoul" },
  { id: "goyang", label: "Goyang" },
];

const FILTERS: { id: MapFilter; label: string; icon: typeof Landmark }[] = [
  { id: "all", label: "All", icon: Landmark },
  { id: "bts", label: "BTS Spot", icon: Landmark },
  { id: "food", label: "Naver 4.8+ Food", icon: Utensils },
];

export function FilterBar() {
  const categoryFilter = useMapSession((s) => s.categoryFilter);
  const setCategoryFilter = useMapSession((s) => s.setCategoryFilter);
  const regionFilter = useMapSession((s) => s.regionFilter);
  const setRegionFilter = useMapSession((s) => s.setRegionFilter);

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1.5">
        {REGIONS.map((region) => {
          const active = regionFilter === region.id;
          return (
            <button
              key={region.id}
              type="button"
              onClick={() => setRegionFilter(region.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition",
                active
                  ? "border-accent/40 bg-accent/20 text-white"
                  : "border-white/10 bg-white/5 text-white/60 hover:text-white",
              )}
            >
              <MapPinned className="h-3 w-3" strokeWidth={1.75} />
              {region.label}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((filter) => {
          const Icon = filter.icon;
          const active = categoryFilter === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => setCategoryFilter(filter.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition",
                active
                  ? "border-accent/40 bg-accent/20 text-white"
                  : "border-white/10 bg-white/5 text-white/60 hover:text-white",
              )}
            >
              <Icon className="h-3 w-3" strokeWidth={1.75} />
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
