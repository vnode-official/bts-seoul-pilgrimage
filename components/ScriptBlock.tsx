"use client";

import { Copy } from "lucide-react";
import { useState } from "react";
import type { OrderingScript } from "@/types";

export function ScriptBlock({ script }: { script: OrderingScript }) {
  const [copied, setCopied] = useState(false);

  async function copy(): Promise<void> {
    await navigator.clipboard.writeText(script.kr);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <p className="text-[11px] text-white/40">{script.situation}</p>
      <p className="mt-1 text-[13px] text-white">{script.en}</p>
      <p className="mt-1 text-[15px] text-white">{script.kr}</p>
      <p className="text-[12px] text-white/45">{script.romanization}</p>
      <button
        type="button"
        onClick={() => void copy()}
        className="mt-2 inline-flex items-center gap-1 text-[11px] text-accent"
      >
        <Copy className="h-3 w-3" />
        {copied ? "Copied" : "Copy Korean"}
      </button>
    </div>
  );
}
