"use client";

import { ChevronLeft, Ticket } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { FilterBar } from "@/components/FilterBar";
import { GlassPanel } from "@/components/GlassPanel";
import { PanelTabs, SearchField } from "@/components/PanelTabs";
import { SpotList } from "@/components/SpotList";
import { TaxiCard } from "@/components/TaxiCard";
import { LiveArrivalsOptional } from "@/components/LiveArrivalsOptional";
import { TransitGuidePanel } from "@/components/TransitGuidePanel";
import { TransitHackPanel } from "@/components/TransitHackPanel";
import { FREE_SPOT_LIMIT } from "@/lib/access";
import { cn } from "@/lib/cn";
import { SPOTS } from "@/data/spots";
import { useMapSession } from "@/stores/map-session";

export function Sidebar() {
  const collapsed = useMapSession((s) => s.sidebarCollapsed);
  const toggleSidebar = useMapSession((s) => s.toggleSidebar);
  const activePanel = useMapSession((s) => s.activePanel);
  const tier = useMapSession((s) => s.tier);
  const requestUnlock = useMapSession((s) => s.requestUnlock);

  return (
    <aside
      className={cn(
        "pointer-events-none absolute bottom-4 left-4 top-4 z-20 hidden md:block",
        collapsed ? "w-[72px]" : "w-[360px]",
      )}
    >
      <GlassPanel className="pointer-events-auto flex h-full flex-col overflow-hidden rounded-[28px]">
        <div className="flex items-center justify-between gap-2 px-3 pb-2 pt-3">
          <BrandMark compact={collapsed} />
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/60 hover:text-white"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              className={cn("h-4 w-4 transition", collapsed && "rotate-180")}
            />
          </button>
        </div>
        {collapsed ? (
          <button
            type="button"
            onClick={requestUnlock}
            className="mx-auto mb-4 mt-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/20 text-accent"
            aria-label="Open pass"
          >
            <Ticket className="h-4 w-4" />
          </button>
        ) : (
          <>
            <div className="space-y-3 px-3 pb-3">
              <PanelTabs />
              {activePanel === "spots" ? (
                <>
                  <SearchField />
                  <FilterBar />
                </>
              ) : null}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
              {activePanel === "spots" ? <SpotList /> : null}
              {activePanel === "taxi" ? <TaxiCard /> : null}
              {activePanel === "transit" ? (
                <>
                  <TransitGuidePanel />
                  <TransitHackPanel />
                  <LiveArrivalsOptional />
                </>
              ) : null}
            </div>
            <div className="border-t border-white/10 p-3">
              {tier === "premium" ? (
                <p className="px-1 text-[11px] text-white/45">
                  Premium Pass active · {SPOTS.length} pins unlocked
                </p>
              ) : (
                <button
                  type="button"
                  onClick={requestUnlock}
                  className="flex w-full items-center justify-between rounded-2xl bg-accent px-3.5 py-2.5 text-left text-[13px] font-medium text-white"
                >
                  <span>Unlock the Pass · $19.99</span>
                  <span className="text-[11px] text-white/80">
                    {FREE_SPOT_LIMIT} free
                  </span>
                </button>
              )}
            </div>
          </>
        )}
      </GlassPanel>
    </aside>
  );
}
