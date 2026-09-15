"use client";

import { Minus, Plus, LocateFixed } from "lucide-react";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onRecenter,
}: MapControlsProps) {
  return (
    <div className="pointer-events-auto absolute right-4 top-4 z-10 hidden flex-col gap-1.5 md:flex">
      <button
        type="button"
        onClick={onZoomIn}
        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[#0F0F12]/70 text-white backdrop-blur-md"
        aria-label="Zoom in"
      >
        <Plus className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onZoomOut}
        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[#0F0F12]/70 text-white backdrop-blur-md"
        aria-label="Zoom out"
      >
        <Minus className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onRecenter}
        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[#0F0F12]/70 text-white backdrop-blur-md"
        aria-label="Recenter Seoul"
      >
        <LocateFixed className="h-4 w-4" />
      </button>
    </div>
  );
}
