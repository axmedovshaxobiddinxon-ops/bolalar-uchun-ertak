"use client";

import { cn } from "@/lib/utils/cn";
import type { AgeCategory, StoryLength } from "@/types";
import { useOfflineEditor } from "../context/OfflineEditorContext";

const AGE_OPTIONS: { value: AgeCategory; label: string; emoji: string }[] = [
  { value: "4-6",   label: "4–6 yosh",   emoji: "🧸" },
  { value: "7-9",   label: "7–9 yosh",   emoji: "📚" },
  { value: "10-12", label: "10–12 yosh", emoji: "🌟" },
];

const LENGTH_OPTIONS: { value: StoryLength; label: string; words: string; emoji: string }[] = [
  { value: "short",  label: "Qisqa",  words: "300–500",  emoji: "⚡" },
  { value: "medium", label: "O'rta",  words: "500–900",  emoji: "📖" },
  { value: "long",   label: "Uzun",   words: "900–1400", emoji: "📚" },
];

const PILL =
  "flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-2xl border-2 text-xs font-bold cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-1";

const ACTIVE = "bg-amber-400 border-amber-400 text-white shadow-warm scale-[1.03]";
const INACTIVE =
  "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-300 dark:hover:border-amber-700 hover:text-amber-600";

export function AgeLengthRow() {
  const { state, setAge, setLength } = useOfflineEditor();

  return (
    <div className="card p-5 sm:p-6 space-y-5">
      {/* Age category */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          👶 Yosh toifasi
        </p>
        <div className="grid grid-cols-3 gap-2">
          {AGE_OPTIONS.map(({ value, label, emoji }) => (
            <button
              key={value}
              type="button"
              onClick={() => setAge(value)}
              aria-pressed={state.ageCategory === value}
              className={cn(PILL, state.ageCategory === value ? ACTIVE : INACTIVE)}
            >
              <span className="text-lg">{emoji}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Story length */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          📏 Ertak uzunligi
        </p>
        <div className="grid grid-cols-3 gap-2">
          {LENGTH_OPTIONS.map(({ value, label, words, emoji }) => (
            <button
              key={value}
              type="button"
              onClick={() => setLength(value)}
              aria-pressed={state.storyLength === value}
              className={cn(PILL, state.storyLength === value ? ACTIVE : INACTIVE)}
            >
              <span className="text-lg">{emoji}</span>
              <span>{label}</span>
              <span
                className={cn(
                  "text-[9px] font-medium",
                  state.storyLength === value ? "text-amber-100" : "text-gray-400 dark:text-gray-600"
                )}
              >
                {words}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
