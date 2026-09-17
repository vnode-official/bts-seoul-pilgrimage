import { create } from "zustand";
import { readStoredPassUnlock } from "@/lib/pass-unlock";
import type {
  AccessTier,
  MapFilter,
  PublicSession,
  RegionFilter,
  SessionSource,
  SheetSnap,
  SidePanel,
} from "@/types";

interface MapSessionState {
  tier: AccessTier;
  sessionSource: SessionSource;
  demoUnlockAvailable: boolean;
  lemonConfigured: boolean;
  hydrated: boolean;
  selectedSpotId: string | null;
  sidebarCollapsed: boolean;
  mobileSheet: SheetSnap;
  activePanel: SidePanel;
  categoryFilter: MapFilter;
  regionFilter: RegionFilter;
  search: string;
  paywallOpen: boolean;
  hydrate: () => Promise<void>;
  setSelectedSpotId: (id: string | null) => void;
  toggleSidebar: () => void;
  setMobileSheet: (snap: SheetSnap) => void;
  setActivePanel: (panel: SidePanel) => void;
  setCategoryFilter: (filter: MapFilter) => void;
  setRegionFilter: (filter: RegionFilter) => void;
  setSearch: (value: string) => void;
  setPaywallOpen: (open: boolean) => void;
  requestUnlock: () => void;
}

export const useMapSession = create<MapSessionState>((set, get) => ({
  tier: "free",
  sessionSource: "none",
  demoUnlockAvailable: true,
  lemonConfigured: false,
  hydrated: false,
  selectedSpotId: null,
  sidebarCollapsed: false,
  mobileSheet: "peek",
  activePanel: "spots",
  categoryFilter: "all",
  regionFilter: "all",
  search: "",
  paywallOpen: false,
  hydrate: async () => {
    try {
      const response = await fetch("/api/session", { cache: "no-store" });
      if (!response.ok) {
        set({ hydrated: true });
        return;
      }
      const data = (await response.json()) as PublicSession;
      if (data.tier !== "premium") {
        const stored = readStoredPassUnlock();
        if (stored?.source === "lemon" && stored.orderId) {
          const complete = await fetch("/api/checkout/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: stored.orderId }),
          });
          if (complete.ok) {
            const again = await fetch("/api/session", { cache: "no-store" });
            if (again.ok) {
              const next = (await again.json()) as PublicSession;
              set({
                tier: next.tier,
                sessionSource: next.source,
                demoUnlockAvailable: next.demoUnlockAvailable,
                lemonConfigured: next.lemonConfigured,
                hydrated: true,
              });
              return;
            }
          }
        }
      }
      set({
        tier: data.tier,
        sessionSource: data.source,
        demoUnlockAvailable: data.demoUnlockAvailable,
        lemonConfigured: data.lemonConfigured,
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },
  setSelectedSpotId: (id) => set({ selectedSpotId: id }),
  toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
  setMobileSheet: (snap) => set({ mobileSheet: snap }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setCategoryFilter: (filter) => set({ categoryFilter: filter }),
  setRegionFilter: (filter) => set({ regionFilter: filter }),
  setSearch: (value) => set({ search: value }),
  setPaywallOpen: (open) => set({ paywallOpen: open }),
  requestUnlock: () => set({ paywallOpen: true }),
}));
