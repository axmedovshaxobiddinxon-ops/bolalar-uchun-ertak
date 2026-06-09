"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface CopyButtonProps {
  text: string;
  className?: string;
  size?: "sm" | "md";
}

export function CopyButton({ text, className, size = "sm" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const iconSize = size === "sm" ? 14 : 16;
  const padding = size === "sm" ? "px-2.5 py-1.5" : "px-3 py-2";

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? "Nusxalandi!" : "Nusxalash"}
      title={copied ? "Nusxalandi!" : "Nusxalash"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg font-semibold text-xs",
        "transition-all duration-200",
        padding,
        copied
          ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800"
          : "bg-amber-50 dark:bg-gray-800 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-gray-700 hover:bg-amber-100 dark:hover:bg-gray-700",
        "focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-1",
        className
      )}
    >
      {copied ? (
        <>
          <Check size={iconSize} />
          Nusxalandi
        </>
      ) : (
        <>
          <Copy size={iconSize} />
          Nusxalash
        </>
      )}
    </button>
  );
}
