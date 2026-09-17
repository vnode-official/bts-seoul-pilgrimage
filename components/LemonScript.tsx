"use client";

import { useEffect } from "react";
import Script from "next/script";
import { publicLemonConfigured } from "@/lib/lemon-public";

export function LemonScript() {
  const enabled = publicLemonConfigured();

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }
    window.createLemonSqueezy?.();
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  return (
    <Script
      src="https://app.lemonsqueezy.com/js/lemon.js"
      strategy="afterInteractive"
      onLoad={() => {
        window.createLemonSqueezy?.();
      }}
    />
  );
}
