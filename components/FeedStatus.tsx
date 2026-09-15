"use client";

import type { TransitConfigResponse, TransitFeedError } from "@/types/transit";
import { cn } from "@/lib/cn";

export function FeedStatus({
  config,
  errors,
  requestError,
}: {
  config: TransitConfigResponse | null;
  errors: TransitFeedError[];
  requestError: string | null;
}) {
  const chips = [
    { on: config?.naverJsConfigured, label: "Naver JS" },
    { on: config?.subwayConfigured, label: "Seoul Metro" },
    { on: config?.busConfigured, label: "TOPIS bus" },
    { on: config?.kakaoRestConfigured, label: "Kakao Navi REST" },
    { on: config?.kakaoJsConfigured, label: "Kakao Map JS" },
  ];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 px-1">
        {chips.map((chip) => (
          <span
            key={chip.label}
            className={cn(
              "rounded-full border px-2 py-0.5 text-[10px]",
              chip.on
                ? "border-accent/30 bg-accent/15 text-accent"
                : "border-white/10 text-white/35",
            )}
          >
            {chip.on ? chip.label : `${chip.label} off`}
          </span>
        ))}
      </div>
      {errors.map((error) => (
        <p
          key={`${error.feed}-${error.code}`}
          className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-[11px] leading-4 text-amber-100/90"
        >
          {error.feed}: {error.message}
        </p>
      ))}
      {requestError ? null : errors.length === 0 && config && !config.subwayConfigured && !config.busConfigured ? (
        <p className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-[11px] leading-4 text-white/45">
          Set SEOUL_OPEN_API_KEY and DATA_GO_KR_SERVICE_KEY on the server to load real arrivals.
        </p>
      ) : null}
    </div>
  );
}
