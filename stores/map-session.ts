import { create } from "zustand";
import type {
  AccessTier,
  MapFilter,
  PublicSession,
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
  search: string;
  paywallOpen: boolean;
  hydrate: () => Promise<void>;
  setSelectedSpotId: (id: string | null) => void;
  toggleSidebar: () => void;
  setMobileSheet: (snap: SheetSnap) => void;
  setActivePanel: (panel: SidePanel) => void;
  setCategoryFilter: (filter: MapFilter) => void;
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
  setSearch: (value) => set({ search: value }),
  setPaywallOpen: (open) => set({ paywallOpen: open }),
  requestUnlock: () => set({ paywallOpen: true }),
}));
