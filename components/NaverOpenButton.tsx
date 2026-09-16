"use client";

import type { MouseEvent } from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/cn";
import { tryOpenNaverApp } from "@/lib/naver-directions";
import {
  naverPlaceAppUrl,
  naverPlaceWebUrl,
  type NaverPlaceTarget,
} from "@/lib/naver-place";

export function NaverOpenButton({
  target,
  variant = "primary",
  label = "Open in Naver Map",
}: {
  target: NaverPlaceTarget;
  variant?: "primary" | "compact";
  label?: string;
}) {
  const webUrl = naverPlaceWebUrl(target);
  const appUrl = naverPlaceAppUrl(target);

  function onClick(event: MouseEvent<HTMLAnchorElement>): void {
    event.stopPropagation();
    tryOpenNaverApp(appUrl);
  }

  if (variant === "compact") {
    return (
      <a
        href={webUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className="shrink-0 rounded-full border border-white/15 px-2 py-1 text-[10px] text-white/80 hover:bg-white/10"
        aria-label={`${label}: ${target.nameEn}`}
      >
        Naver
      </a>
    );
  }

  return (
    <a
      href={webUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-[13px] font-medium text-black",
      )}
    >
      {label}
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}
