"use client";

import { useState, useCallback } from "react";
import {
  Copy,
  Check,
  FileDown,
  FileText,
  BookOpen,
  FileJson,
} from "lucide-react";
import { exportJson } from "@/lib/utils/export-json";
import { exportPdf } from "@/lib/utils/export-pdf";
import { exportDocx } from "@/lib/utils/export-docx";
import { cn } from "@/lib/utils/cn";
import type { StoryPackage } from "@/types";
import { BookPreviewModal } from "@/components/export/BookPreviewModal";
import {
  ExportProgressBar,
  INITIAL_PROGRESS,
  type ExportProgressState,
  type ExportFormat,
} from "@/components/export/ExportProgressBar";

interface ExportBarProps {
  pkg: StoryPackage;
}

export function ExportBar({ pkg }: ExportBarProps) {
  const [copiedAll, setCopiedAll] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [progress, setProgress] = useState<ExportProgressState>(INITIAL_PROGRESS);

  // ── Build full plain-text copy ────────────────────────
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
      [
        ...(pkg.hashtags?.uzbek || []),
        ...(pkg.hashtags?.english || []),
      ].join(" "),
    ];
    return lines.join("\n");
  }

  async function handleCopyAll() {
    await navigator.clipboard.writeText(buildFullText()).catch(() => {});
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  }

  // ── Progress helper ───────────────────────────────────
  function makeProgressCallback(format: ExportFormat) {
    return (step: string, percent: number) => {
      setProgress({
        active: percent < 100,
        format,
        step,
        percent,
        done: percent >= 100,
        error: null,
      });
    };
  }

  // ── PDF export ────────────────────────────────────────
  const handleExportPdf = useCallback(async () => {
    setProgress({ active: true, format: "pdf", step: "Tayyorlanmoqda…", percent: 2, done: false, error: null });
    setPreviewOpen(false);
    try {
      await exportPdf(pkg, makeProgressCallback("pdf"));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "PDF yaratishda xatolik";
      setProgress((p) => ({ ...p, active: false, done: true, error: msg }));
    }
  }, [pkg]);

  // ── DOCX export ───────────────────────────────────────
  const handleExportDocx = useCallback(async () => {
    setProgress({ active: true, format: "docx", step: "Tayyorlanmoqda…", percent: 2, done: false, error: null });
    setPreviewOpen(false);
    try {
      await exportDocx(pkg, makeProgressCallback("docx"));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "DOCX yaratishda xatolik";
      setProgress((p) => ({ ...p, active: false, done: true, error: msg }));
    }
  }, [pkg]);

  const isExporting = progress.active && !progress.done;

  const dismissProgress = useCallback(() => {
    setProgress(INITIAL_PROGRESS);
  }, []);

  return (
    <>
      {/* Progress toast */}
      <ExportProgressBar progress={progress} onDismiss={dismissProgress} />

      {/* Book preview modal */}
      <BookPreviewModal
        pkg={pkg}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onExportPdf={handleExportPdf}
        onExportDocx={handleExportDocx}
        exporting={isExporting}
      />

      {/* Export bar card */}
      <div className="card p-5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 border-amber-200 dark:border-gray-700">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-bold text-sm text-gray-700 dark:text-gray-200">
              📤 Saqlash va eksport
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {pkg.metadata?.wordCount} so&apos;z ·{" "}
              {pkg.metadata?.readingTimeMinutes} daqiqa ·{" "}
              {pkg.characters?.length ?? 0} qahramon
            </p>
          </div>

          {/* Book preview button */}
          <button
            onClick={() => setPreviewOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-all"
          >
            <BookOpen size={13} />
            Kitob ko&apos;rish
          </button>
        </div>

        {/* Action buttons grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Copy all */}
          <button
            onClick={handleCopyAll}
            className={cn(
              "col-span-2 sm:col-span-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200",
              copiedAll
                ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400"
                : "bg-white dark:bg-gray-800 border-amber-200 dark:border-gray-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-gray-700"
            )}
          >
            {copiedAll ? <Check size={15} /> : <Copy size={15} />}
            {copiedAll ? "Nusxalandi!" : "Nusxalash"}
          </button>

          {/* PDF download */}
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileDown size={15} />
            PDF
          </button>

          {/* DOCX download */}
          <button
            onClick={handleExportDocx}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText size={15} />
            DOCX
          </button>

          {/* JSON download */}
          <button
            onClick={() => exportJson(pkg)}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 bg-white dark:bg-gray-800 border-amber-200 dark:border-gray-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-gray-700"
          >
            <FileJson size={15} />
            JSON
          </button>
        </div>

        {/* Format descriptions */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { icon: "📄", label: "PDF", desc: "Bosib chiqarish uchun" },
            { icon: "📝", label: "DOCX", desc: "Word'da tahrirlash" },
            { icon: "🔧", label: "JSON", desc: "Dasturchilar uchun" },
          ].map(({ icon, label, desc }) => (
            <div key={label} className="text-center">
              <span className="text-sm">{icon}</span>
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-500">{label}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
