import { KeyRound } from "lucide-react";
import { GlassPanel } from "@/components/GlassPanel";

export function MapPlaceholder({
  reason,
}: {
  reason: "missing-key" | "load-error";
}) {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,#1c1430,transparent_55%),linear-gradient(180deg,#0F0F12,#16141c)]">
        <div className="seoul-grid absolute inset-0 opacity-35" />
      </div>
      <div className="absolute left-1/2 top-4 z-[5] w-[min(92vw,420px)] -translate-x-1/2 md:left-auto md:right-20 md:translate-x-0">
        <GlassPanel className="rounded-2xl p-4">
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-accent">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-white">
                {reason === "missing-key"
                  ? "Naver Maps client id missing"
                  : "Naver Maps failed to load"}
              </p>
              <p className="mt-1 text-[11px] leading-4 text-white/50">
                Set NEXT_PUBLIC_NAVER_MAP_CLIENT_ID from Naver Cloud Maps.
                Pins, taxi estimates, and Naver subway/bus links still work.
              </p>
            </div>
          </div>
        </GlassPanel>
      </div>
    </>
  );
}
