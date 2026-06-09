"use client";

import { useApp } from "@/app/context/AppContext";
import { cn } from "@/lib/utils/cn";
import type { StoryLength } from "@/types";

const LENGTH_OPTIONS: { value: StoryLength; label: string; uzbekLabel: string; wordRange: string; emoji: string }[] = [
  { value: "short", label: "Short", uzbekLabel: "Qisqa", wordRange: "300–500 so'z", emoji: "⚡" },
  { value: "medium", label: "Medium", uzbekLabel: "O'rta", wordRange: "500–900 so'z", emoji: "📖" },
  { value: "long", label: "Long", uzbekLabel: "Uzun", wordRange: "900–1400 so'z", emoji: "📚" },
];

interface StoryLengthSelectorProps {
  disabled?: boolean;
}

export function StoryLengthSelector({ disabled = false }: StoryLengthSelectorProps) {
  const { state, setStoryLength } = useApp();

  return (
    <div className="space-y-3">
      <label className="block font-bold text-gray-700 dark:text-gray-200 text-sm">
        📏 Ertak uzunligi
      </label>

      <div className="grid grid-cols-3 gap-2">
        {LENGTH_OPTIONS.map(({ value, uzbekLabel, wordRange, emoji }) => {
          const isActive = state.storyLength === value;
          return (
            <button
              key={value}
              onClick={() => !disabled && setStoryLength(value)}
              disabled={disabled}
              aria-pressed={isActive}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-3 rounded-2xl border-2 transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-1",
                isActive
                  ? "bg-amber-400 border-amber-400 text-white shadow-warm scale-[1.02]"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-300 dark:hover:border-amber-700 hover:text-amber-600",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <span className="text-xl">{emoji}</span>
              <span className="font-bold text-xs">{uzbekLabel}</span>
              <span className={cn("text-[10px] font-medium", isActive ? "text-amber-100" : "text-gray-400 dark:text-gray-600")}>
                {wordRange}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
