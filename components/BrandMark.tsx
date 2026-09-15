import { MapPinned } from "lucide-react";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-accent/20 ring-1 ring-accent/40">
        <MapPinned className="h-4 w-4 text-accent" strokeWidth={1.75} />
      </div>
      {!compact ? (
        <div className="min-w-0">
          <p className="font-display text-[13px] font-semibold tracking-tight text-white">
            Seoul Pilgrimage Pass
          </p>
          <p className="truncate text-[11px] text-white/45">
            Independent BTS-era map &amp; transit
          </p>
        </div>
      ) : null}
    </div>
  );
}
