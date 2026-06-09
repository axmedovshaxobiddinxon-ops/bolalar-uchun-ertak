"use client";

import { Download, FileJson, Copy, Check } from "lucide-react";
import { useState } from "react";
import { exportJson } from "@/lib/utils/export-json";
import { cn } from "@/lib/utils/cn";
import type { StoryPackage } from "@/types";

interface ExportBarProps {
  pkg: StoryPackage;
}

export function ExportBar({ pkg }: ExportBarProps) {
  const [copiedAll, setCopiedAll] = useState(false);

  function buildFullText(): string {
    const lines: string[] = [
      `📖 SARLAVHA: ${pkg.title}`,
      `👶 YOSH TOIFASI: ${pkg.ageCategory} yosh`,
      ``,
      `📝 QISQA MAZMUN:`,
      pkg.summary,
      ``,
      `📚 ERTAK:`,
      pkg.story,
      ``,
      `🌟 SABOQ:`,
      pkg.moralLesson,
      ``,
      `👨‍👩‍👧 OTA-ONALAR UCHUN:`,
      pkg.parentNote,
      ``,
      `🖼️ RASM TAVSIFLAR:`,
      ...(pkg.imagePrompts || []).map((p) => `${p.scene}. ${p.prompt}`),
      ``,
      `📣 XESHTEGLAR:`,
      [...(pkg.hashtags?.uzbek || []), ...(pkg.hashtags?.english || [])].join(" "),
    ];
    return lines.join("\n");
  }

  async function handleCopyAll() {
    const text = buildFullText();
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  }

  return (
    <div className="card p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 border-amber-200 dark:border-gray-700">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-bold text-sm text-gray-700 dark:text-gray-200">
            📤 Saqlash va eksport qilish
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {pkg.metadata?.wordCount} so&apos;z · {pkg.metadata?.readingTimeMinutes} daqiqa o&apos;qish
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Copy all */}
          <button
            onClick={handleCopyAll}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200",
              copiedAll
                ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400"
                : "bg-white dark:bg-gray-800 border-amber-200 dark:border-gray-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-gray-700"
            )}
          >
            {copiedAll ? <Check size={15} /> : <Copy size={15} />}
            {copiedAll ? "Nusxalandi!" : "Hammasini nusxalash"}
          </button>

          {/* Download JSON */}
          <button
            onClick={() => exportJson(pkg)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border bg-white dark:bg-gray-800 border-amber-200 dark:border-gray-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-gray-700 transition-all duration-200"
          >
            <FileJson size={15} />
            JSON
          </button>
        </div>
      </div>
    </div>
  );
}
