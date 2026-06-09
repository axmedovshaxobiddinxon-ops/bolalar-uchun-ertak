"use client";

import { useApp } from "@/app/context/AppContext";
import { cn } from "@/lib/utils/cn";
import type { AgeCategory } from "@/types";

const AGE_OPTIONS: { value: AgeCategory; label: string; emoji: string; desc: string }[] = [
  { value: "4-6", label: "4–6 yosh", emoji: "🧸", desc: "Kichik bolalar" },
  { value: "7-9", label: "7–9 yosh", emoji: "📚", desc: "Maktab yoshi" },
  { value: "10-12", label: "10–12 yosh", emoji: "🌟", desc: "Katta yoshdagi bolalar" },
];

interface AgeSelectorProps {
  disabled?: boolean;
}

export function AgeSelector({ disabled = false }: AgeSelectorProps) {
  const { state, setAge } = useApp();

  function handleClick(value: AgeCategory) {
    if (disabled) return;
    setAge(state.ageOverride === value ? null : value);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="font-bold text-gray-700 dark:text-gray-200 text-sm">
          👶 Yosh toifasi
        </label>
        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
          (ixtiyoriy — AI aniqlaydi)
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {AGE_OPTIONS.map(({ value, label, emoji, desc }) => {
          const isActive = state.ageOverride === value;
          return (
            <button
              key={value}
              onClick={() => handleClick(value)}
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
              <span className="font-bold text-xs">{label}</span>
              <span className={cn("text-[10px] font-medium", isActive ? "text-amber-100" : "text-gray-400 dark:text-gray-600")}>
                {desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
