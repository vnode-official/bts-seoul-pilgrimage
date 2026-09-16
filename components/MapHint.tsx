"use client";

export function MapHint() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-4 z-[5] w-[min(92vw,360px)] -translate-x-1/2 md:left-auto md:right-20 md:w-[280px] md:translate-x-0">
      <p className="rounded-2xl border border-white/10 bg-[#0F0F12]/75 px-3 py-2 text-center text-[11px] leading-4 text-white/55 backdrop-blur-md md:text-right">
        This guide map is for pins. Satellite and street view open in the{" "}
        <span className="text-white/80">Naver Maps app</span> — tap Open in Naver Map
        on any pin.
      </p>
    </div>
  );
}
