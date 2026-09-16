"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { spotShareText, spotShareUrl } from "@/lib/share";
import type { Spot } from "@/types";

type ShareSpot = Pick<Spot, "nameEn" | "nameKr" | "slug">;

async function copyShareText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }
}

export function ShareSpotButton({
  spot,
  variant = "primary",
}: {
  spot: ShareSpot;
  variant?: "primary" | "compact";
}) {
  const [copied, setCopied] = useState(false);

  async function share(): Promise<void> {
    const text = spotShareText(spot);
    const url = spotShareUrl(spot.slug);
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: spot.nameEn,
          text,
          url,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }
    const ok = await copyShareText(text);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  }

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          void share();
        }}
        className="shrink-0 rounded-full border border-white/15 px-2 py-1 text-[10px] text-white/80 hover:bg-white/10"
        aria-label={copied ? "Copied share text" : `Share ${spot.nameEn}`}
      >
        {copied ? "Copied" : "Share"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void share()}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 px-4 py-2.5 text-[13px] text-white/90 hover:bg-white/5",
      )}
    >
      {copied ? (
        <Check className="h-4 w-4 text-accent" />
      ) : (
        <Share2 className="h-4 w-4" />
      )}
      {copied ? "Copied link + text" : "Share / Copy link"}
    </button>
  );
}
