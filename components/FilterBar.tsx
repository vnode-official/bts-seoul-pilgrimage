"use client";

import { Utensils, Landmark } from "lucide-react";
import { cn } from "@/lib/cn";
import { useMapSession } from "@/stores/map-session";
import type { MapFilter } from "@/types";

const FILTERS: { id: MapFilter; label: string; icon: typeof Landmark }[] = [
  { id: "all", label: "All", icon: Landmark },
  { id: "bts", label: "BTS Spot", icon: Landmark },
  { id: "food", label: "Naver 4.8+ Food", icon: Utensils },
];

export function FilterBar() {
  const categoryFilter = useMapSession((s) => s.categoryFilter);
  const setCategoryFilter = useMapSession((s) => s.setCategoryFilter);

  return (
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
  );
}
