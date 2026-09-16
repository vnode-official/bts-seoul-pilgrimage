"use client";

import { Lock, MapPin, Utensils } from "lucide-react";
import { cn } from "@/lib/cn";
import { isSpotUnlocked } from "@/lib/access";
import { NaverOpenButton } from "@/components/NaverOpenButton";
import { ShareSpotButton } from "@/components/ShareSpotButton";
import { useMapSession } from "@/stores/map-session";
import type { Spot } from "@/types";

export function SpotListItem({ spot }: { spot: Spot }) {
  const tier = useMapSession((s) => s.tier);
  const selected = useMapSession((s) => s.selectedSpotId === spot.id);
  const setSelectedSpotId = useMapSession((s) => s.setSelectedSpotId);
  const requestUnlock = useMapSession((s) => s.requestUnlock);
  const unlocked = isSpotUnlocked(spot, tier);
  const Icon = spot.category === "food" ? Utensils : MapPin;

  return (
    <div
      className={cn(
        "flex w-full items-start gap-2 rounded-2xl border px-3 py-2.5 transition",
        selected
          ? "border-accent/40 bg-accent/15"
          : "border-transparent hover:border-white/10 hover:bg-white/5",
      )}
    >
      <button
        type="button"
        onClick={() => {
          if (!unlocked) {
            requestUnlock();
            return;
          }
          setSelectedSpotId(spot.id);
        }}
        className="flex min-w-0 flex-1 items-start gap-3 text-left"
      >
        <span
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
            spot.category === "food" ? "bg-amber-500/15 text-amber-200" : "bg-accent/15 text-accent",
          )}
        >
          {unlocked ? (
            <Icon className="h-4 w-4" strokeWidth={1.7} />
          ) : (
            <Lock className="h-3.5 w-3.5 text-white/50" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-white">
            {spot.nameEn}
          </span>
          <span className="mt-0.5 block truncate text-[11px] text-white/45">
            {spot.nameKr} · {spot.region === "goyang" ? "Goyang" : "Seoul"} ·{" "}
            {spot.neighborhood}
          </span>
        </span>
      </button>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <ShareSpotButton variant="compact" spot={spot} />
        {unlocked ? (
          <NaverOpenButton
            variant="compact"
            target={{ nameEn: spot.nameEn, nameKr: spot.nameKr, coords: spot.coords }}
          />
        ) : null}
      </div>
    </div>
  );
}
