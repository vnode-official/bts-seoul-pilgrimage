"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { useMapSession } from "@/stores/map-session";
import type { SidePanel } from "@/types";

const TABS: { id: SidePanel; label: string }[] = [
  { id: "spots", label: "Map" },
  { id: "taxi", label: "Taxi" },
  { id: "transit", label: "Transit" },
];

export function PanelTabs() {
  const activePanel = useMapSession((s) => s.activePanel);
  const setActivePanel = useMapSession((s) => s.setActivePanel);

  return (
    <div className="grid grid-cols-3 gap-1 rounded-2xl border border-white/10 bg-black/30 p-1">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => setActivePanel(tab.id)}
          className={cn(
            "rounded-xl py-1.5 text-[12px] font-medium transition",
            activePanel === tab.id
              ? "bg-white/10 text-white"
              : "text-white/50 hover:text-white",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function SearchField() {
  const search = useMapSession((s) => s.search);
  const setSearch = useMapSession((s) => s.setSearch);

  return (
    <label className="relative block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" />
      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search pins, stations, food"
        className="w-full rounded-2xl border border-white/10 bg-black/30 py-2 pl-9 pr-3 text-[13px] text-white outline-none placeholder:text-white/30 focus:border-accent/40"
      />
    </label>
  );
}
