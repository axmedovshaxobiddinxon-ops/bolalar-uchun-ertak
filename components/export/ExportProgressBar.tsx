"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type ExportFormat = "pdf" | "docx";

export interface ExportProgressState {
  active: boolean;
  format: ExportFormat | null;
  step: string;
  percent: number;
  done: boolean;
  error: string | null;
}

export const INITIAL_PROGRESS: ExportProgressState = {
  active: false,
  format: null,
  step: "",
  percent: 0,
  done: false,
  error: null,
};

interface ExportProgressBarProps {
  progress: ExportProgressState;
  onDismiss: () => void;
}

const FORMAT_CONFIG = {
  pdf: {
    label: "PDF Kitob",
    icon: "📄",
    color: "from-red-400 to-red-500",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-800",
    textColor: "text-red-700 dark:text-red-400",
    barColor: "bg-red-400",
  },
  docx: {
    label: "Word Hujjat",
    icon: "📝",
    color: "from-blue-400 to-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    textColor: "text-blue-700 dark:text-blue-400",
    barColor: "bg-blue-400",
  },
} as const;

export function ExportProgressBar({ progress, onDismiss }: ExportProgressBarProps) {
  const [visible, setVisible] = useState(false);

  // Animate in/out
  useEffect(() => {
    if (progress.active) {
      setVisible(true);
    } else if (progress.done) {
      // Stay visible for 2.5s after completion
      const t = setTimeout(() => setVisible(false), 2500);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [progress.active, progress.done]);

  // Auto-dismiss after done
  useEffect(() => {
    if (progress.done && !progress.error) {
      const t = setTimeout(() => onDismiss(), 3000);
      return () => clearTimeout(t);
    }
  }, [progress.done, progress.error, onDismiss]);

  if (!visible || (!progress.active && !progress.done && !progress.error)) {
    return null;
  }

  const fmt = progress.format ? FORMAT_CONFIG[progress.format] : FORMAT_CONFIG.pdf;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-6 right-6 z-50 w-80 rounded-2xl border shadow-2xl",
        "transition-all duration-300",
        fmt.bgColor,
        fmt.borderColor,
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{fmt.icon}</span>
          <div>
            <p className={cn("text-sm font-bold leading-none", fmt.textColor)}>
              {fmt.label} {progress.done && !progress.error ? "tayyor!" : "yaratilmoqda…"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-none">
              {progress.error ?? progress.step}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {progress.done && !progress.error ? (
            <CheckCircle2 size={18} className="text-green-500" />
          ) : progress.error ? (
            <span className="text-xs text-red-500 font-bold">Xato</span>
          ) : (
            <Loader2 size={16} className={cn("animate-spin", fmt.textColor)} />
          )}
          <button
            onClick={onDismiss}
            aria-label="Yopish"
            className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-black/10 transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {!progress.error && (
        <div className="px-4 pb-3">
          <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out",
                progress.done ? "bg-green-400" : fmt.barColor
              )}
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <p className="text-right text-xs text-gray-400 dark:text-gray-500 mt-1">
            {progress.percent}%
          </p>
        </div>
      )}

      {/* Error message */}
      {progress.error && (
        <div className="px-4 pb-3">
          <p className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded-lg p-2">
            {progress.error}
          </p>
        </div>
      )}
    </div>
  );
}
