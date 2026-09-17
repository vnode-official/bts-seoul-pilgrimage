"use client";

import { useEffect } from "react";
import { LemonScript } from "@/components/LemonScript";
import { useMapSession } from "@/stores/map-session";

export function Providers({ children }: { children: React.ReactNode }) {
  const hydrate = useMapSession((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <>
      <LemonScript />
      {children}
    </>
  );
}
