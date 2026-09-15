"use client";

import { Ticket } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { FilterBar } from "@/components/FilterBar";
import { GlassPanel } from "@/components/GlassPanel";
import { PanelTabs, SearchField } from "@/components/PanelTabs";
import { SpotList } from "@/components/SpotList";
import { TaxiCard } from "@/components/TaxiCard";
import { TransitHackPanel } from "@/components/TransitHackPanel";
import { cn } from "@/lib/cn";
import { useMapSession } from "@/stores/map-session";
import type { SheetSnap } from "@/types";

const HEIGHT: Record<SheetSnap, string> = {
  peek: "h-[168px]",
  half: "h-[52vh]",
  full: "h-[88vh]",
};

export function BottomSheet() {
  const snap = useMapSession((s) => s.mobileSheet);
  const setMobileSheet = useMapSession((s) => s.setMobileSheet);
  const activePanel = useMapSession((s) => s.activePanel);
  const tier = useMapSession((s) => s.tier);
  const requestUnlock = useMapSession((s) => s.requestUnlock);

  function cycle(): void {
    const next: SheetSnap =
      snap === "peek" ? "half" : snap === "half" ? "full" : "peek";
    setMobileSheet(next);
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 md:hidden">
      <GlassPanel
        className={cn(
          "pointer-events-auto rounded-t-[28px] rounded-b-none border-b-0 transition-[height] duration-300",
          HEIGHT[snap],
        )}
      >
        <div className="flex h-full flex-col">
          <button
            type="button"
            className="flex w-full flex-col items-center pt-2"
            onClick={cycle}
            aria-label="Resize sheet"
          >
            <span className="h-1 w-10 rounded-full bg-white/25" />
          </button>
          <div className="flex items-center justify-between px-4 py-2">
            <BrandMark />
            {tier !== "premium" ? (
              <button
                type="button"
                onClick={requestUnlock}
                className="flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-[11px] font-medium text-white"
              >
                <Ticket className="h-3 w-3" />
                Pass
              </button>
            ) : (
              <span className="text-[11px] text-accent">Premium</span>
            )}
          </div>
          <div className="space-y-2 px-3 pb-2">
            <PanelTabs />
            {activePanel === "spots" && snap !== "peek" ? (
              <>
                <SearchField />
                <FilterBar />
              </>
            ) : null}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
            {snap === "peek" ? (
              <p className="px-3 text-[12px] text-white/45">
                Drag up for the full list, taxi estimates, and subway hacks.
              </p>
            ) : (
              <>
                {activePanel === "spots" ? <SpotList /> : null}
                {activePanel === "taxi" ? <TaxiCard /> : null}
                {activePanel === "transit" ? <TransitHackPanel /> : null}
              </>
            )}
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
