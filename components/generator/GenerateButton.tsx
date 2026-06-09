"use client";

import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface GenerateButtonProps {
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
}

export function GenerateButton({ onClick, loading, disabled }: GenerateButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      aria-label="Ertak yaratish"
      className={cn(
        "w-full py-4 px-6 rounded-2xl font-display font-bold text-lg",
        "transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2",
        !disabled && !loading
          ? "bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white shadow-warm hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
          : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
      )}
    >
      <span className="flex items-center justify-center gap-2">
        {loading ? (
          <>
            <Loader2 size={22} className="animate-spin" />
            Yaratilmoqda...
          </>
        ) : (
          <>
            <Sparkles size={22} />
            Ertak Yaratish
          </>
        )}
      </span>
    </button>
  );
}
