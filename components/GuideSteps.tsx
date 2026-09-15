"use client";

import { Footprints, Plane, Repeat, TrainFront } from "lucide-react";
import type { GuideStep } from "@/lib/transit-guide";

const ICONS = {
  airport: Plane,
  rail: TrainFront,
  transfer: Repeat,
  walk: Footprints,
} as const;

export function GuideSteps({
  steps,
  stationLabel,
}: {
  steps: GuideStep[];
  stationLabel?: string;
}) {
  return (
    <ol className="space-y-1.5">
      {steps.map((step, index) => {
        const Icon = ICONS[step.kind];
        return (
          <li
            key={step.id}
            className="flex gap-2 rounded-2xl border border-white/10 bg-black/25 px-3 py-2"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-[10px] text-accent">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[13px] font-medium text-white">
                <Icon className="h-3.5 w-3.5 text-accent" />
                {step.title}
              </p>
              <p className="mt-0.5 text-[12px] leading-4 text-white/55">{step.detail}</p>
              {step.lineLabel ? (
                <span className="mt-1 inline-block rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-white/50">
                  {step.lineLabel}
                </span>
              ) : null}
            </div>
          </li>
        );
      })}
      {stationLabel ? (
        <p className="px-1 text-[11px] text-white/35">Nearest catalog station · {stationLabel}</p>
      ) : null}
    </ol>
  );
}
