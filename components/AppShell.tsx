"use client";

import dynamic from "next/dynamic";
import { BottomSheet } from "@/components/BottomSheet";
import { LiveTransitSync } from "@/components/LiveTransitSync";
import { NaverWalkSync } from "@/components/NaverWalkSync";
import { Paywall } from "@/components/Paywall";
import { Sidebar } from "@/components/Sidebar";
import { ShareBootstrap } from "@/components/ShareBootstrap";
import { SpotModal } from "@/components/SpotModal";
import { INDEPENDENT_DISCLAIMER } from "@/data/spots";

const MapCanvas = dynamic(
  () => import("@/components/MapCanvas").then((mod) => mod.MapCanvas),
  { ssr: false },
);

export function AppShell() {
  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-ink">
      <ShareBootstrap />
      <LiveTransitSync />
      <NaverWalkSync />
      <MapCanvas />
      <Sidebar />
      <BottomSheet />
      <SpotModal />
      <Paywall />
      <p className="pointer-events-none absolute bottom-3 right-4 hidden max-w-sm text-right text-[10px] leading-4 text-white/25 md:block">
        {INDEPENDENT_DISCLAIMER}
      </p>
    </main>
  );
}
