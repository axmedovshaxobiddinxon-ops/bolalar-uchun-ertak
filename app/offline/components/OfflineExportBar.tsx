"use client";

import { useState, useCallback } from "react";
import {
  FileDown,
  FileText,
  FileJson,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { exportPdf } from "@/lib/utils/export-pdf";
import { exportDocx } from "@/lib/utils/export-docx";
import { exportJson } from "@/lib/utils/export-json";
import { useOfflineEditor } from "../context/OfflineEditorContext";
import { BookPreviewModal } from "@/components/export/BookPreviewModal";
import {
  ExportProgressBar,
  INITIAL_PROGRESS,
  type ExportProgressState,
  type ExportFormat,
} from "@/components/export/ExportProgressBar";

export function OfflineExportBar() {
  const { storyPackage, imageMap, validation, wordCount, readingMinutes, state, resetEditor } =
    useOfflineEditor();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [progress, setProgress] = useState<ExportProgressState>(INITIAL_PROGRESS);

  const imageCount = Object.keys(imageMap).length;
  const hasImages = imageCount > 0;
  const isExporting = progress.active && !progress.done;

  function makeProgress(format: ExportFormat) {
    return (step: string, percent: number) =>
      setProgress({ active: percent < 100, format, step, percent, done: percent >= 100, error: null });
  }

  const handlePdf = useCallback(async () => {
    setProgress({ active: true, format: "pdf", step: "Tayyorlanmoqda…", percent: 2, done: false, error: null });
    setPreviewOpen(false);
    try {
      await exportPdf(storyPackage, makeProgress("pdf"), hasImages ? imageMap : undefined);
    } catch (e) {
      setProgress((p) => ({ ...p, active: false, done: true, error: e instanceof Error ? e.message : "PDF xatolik" }));
    }
  }, [storyPackage, hasImages, imageMap]);

  const handleDocx = useCallback(async () => {
    setProgress({ active: true, format: "docx", step: "Tayyorlanmoqda…", percent: 2, done: false, error: null });
    setPreviewOpen(false);
    try {
      await exportDocx(storyPackage, makeProgress("docx"));
    } catch (e) {
      setProgress((p) => ({ ...p, active: false, done: true, error: e instanceof Error ? e.message : "DOCX xatolik" }));
    }
  }, [storyPackage]);

  const handleJson = useCallback(() => exportJson(storyPackage), [storyPackage]);

  const disabled = !validation.valid || isExporting;

  return (
    <>
      <ExportProgressBar progress={progress} onDismiss={() => setProgress(INITIAL_PROGRESS)} />

      <BookPreviewModal
        pkg={storyPackage}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onExportPdf={handlePdf}
        onExportDocx={handleDocx}
        exporting={isExporting}
        imageMap={imageMap}
      />

      <div className="card p-5 sm:p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 border-amber-200 dark:border-gray-700 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-sm text-gray-800 dark:text-gray-100">
              📤 Kitob eksport
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>{wordCount} so&apos;z</span>
              <span>·</span>
              <span>{readingMinutes} daq</span>
              <span>·</span>
              <span>{state.characters.length} qahramon</span>
              {hasImages && (
                <>
                  <span>·</span>
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">
                    🖼️ {imageCount} rasm
                  </span>
                </>
              )}
            </p>
          </div>

          <button
            onClick={() => setPreviewOpen(true)}
            disabled={!validation.valid}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <BookOpen size={13} />
            Ko&apos;rish
          </button>
        </div>

        {/* Validation feedback */}
        {validation.errors.length > 0 && (
          <div className="space-y-1">
            {validation.errors.map((e, i) => (
              <p key={i} className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-medium">
                <AlertCircle size={11} className="flex-shrink-0" />
                {e}
              </p>
            ))}
          </div>
        )}

        {validation.valid && validation.warnings.length > 0 && (
          <div className="space-y-1">
            {validation.warnings.map((w, i) => (
              <p key={i} className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                <AlertCircle size={11} className="flex-shrink-0" />
                {w}
              </p>
            ))}
          </div>
        )}

        {validation.valid && (
          <p className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-semibold">
            <CheckCircle2 size={13} />
            Kitob eksport uchun tayyor
          </p>
        )}

        {/* Export buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handlePdf}
            disabled={disabled}
            title={hasImages ? `PDF (${imageCount} rasm bilan)` : "PDF (rasmsiz)"}
            className={cn(
              "flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-bold border transition-all",
              disabled
                ? "opacity-40 cursor-not-allowed bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40"
            )}
          >
            {isExporting && progress.format === "pdf" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FileDown size={16} />
            )}
            <span>PDF</span>
            {hasImages && (
              <span className="text-[9px] font-bold bg-amber-400 text-white rounded-full px-1.5 py-0.5">
                🖼️{imageCount}
              </span>
            )}
          </button>

          <button
            onClick={handleDocx}
            disabled={disabled}
            className={cn(
              "flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-bold border transition-all",
              disabled
                ? "opacity-40 cursor-not-allowed bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400"
                : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
            )}
          >
            {isExporting && progress.format === "docx" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FileText size={16} />
            )}
            <span>DOCX</span>
          </button>

          <button
            onClick={handleJson}
            disabled={disabled}
            className={cn(
              "flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-bold border transition-all",
              disabled
                ? "opacity-40 cursor-not-allowed bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400"
                : "bg-white dark:bg-gray-800 border-amber-200 dark:border-gray-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-gray-700"
            )}
          >
            <FileJson size={16} />
            <span>JSON</span>
          </button>
        </div>

        {/* Format labels */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: "PDF", desc: hasImages ? "Rasmlar bilan" : "Matn" },
            { label: "DOCX", desc: "Word" },
            { label: "JSON", desc: "Ma'lumot" },
          ].map(({ label, desc }) => (
            <div key={label}>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500">{label}</p>
              <p className="text-[10px] text-gray-300 dark:text-gray-700">{desc}</p>
            </div>
          ))}
        </div>

        {/* Reset */}
        <div className="pt-2 border-t border-amber-100 dark:border-gray-700">
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Barcha ma'lumotlarni tozalaysizmi? Bu amalni ortga qaytarib bo'lmaydi.")) {
                resetEditor();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
          >
            <RotateCcw size={11} />
            Hammasini tozalash
          </button>
        </div>
      </div>
    </>
  );
}
