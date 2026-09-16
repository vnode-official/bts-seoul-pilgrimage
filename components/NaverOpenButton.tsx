"use client";

import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/cn";
import { openNaverPlace, type NaverPlaceTarget } from "@/lib/naver-place";

export function NaverOpenButton({
  target,
  variant = "primary",
  label = "Open in Naver Map",
}: {
  target: NaverPlaceTarget;
  variant?: "primary" | "compact";
  label?: string;
}) {
  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          openNaverPlace(target);
        }}
        className="shrink-0 rounded-full border border-white/15 px-2 py-1 text-[10px] text-white/80 hover:bg-white/10"
        aria-label={`${label}: ${target.nameEn}`}
      >
        Naver
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => openNaverPlace(target)}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-[13px] font-medium text-black",
      )}
    >
      {label}
      <ExternalLink className="h-3.5 w-3.5" />
    </button>
  );
}
