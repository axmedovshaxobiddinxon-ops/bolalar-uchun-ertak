"use client";

import { cn } from "@/lib/utils/cn";
import { EDUCATIONAL_VALUES } from "@/config/educational-values";
import type { EducationalValue } from "@/types";
import { useOfflineEditor } from "../context/OfflineEditorContext";

export function ValuesSelector() {
  const { state, toggleValue } = useOfflineEditor();
  const selected = state.educationalValues;

  return (
    <div className="card p-5 sm:p-6 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌱</span>
          <h2 className="font-display font-bold text-gray-800 dark:text-white text-sm">
            Ta&apos;lim qiymatlari
          </h2>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
          {selected.length > 0 ? `${selected.length} tanlangan` : "ixtiyoriy"}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {EDUCATIONAL_VALUES.map((val) => {
          const isActive = selected.includes(val.id as EducationalValue);
          return (
            <button
              key={val.id}
              type="button"
              onClick={() => toggleValue(val.id as EducationalValue)}
              aria-pressed={isActive}
              title={val.description}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-xs font-semibold",
                "transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-1",
                isActive
                  ? "bg-amber-400 border-amber-400 text-white shadow-warm scale-105"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-300 dark:hover:border-amber-700 hover:text-amber-600"
              )}
            >
              <span>{val.emoji}</span>
              <span>{val.uzbekLabel}</span>
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <button
          type="button"
          onClick={() => selected.forEach((v) => toggleValue(v))}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
        >
          Tanlovni bekor qilish
        </button>
      )}
    </div>
  );
}
