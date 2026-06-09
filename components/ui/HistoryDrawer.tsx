"use client";

import { X, Trash2, BookOpen, Clock, Users } from "lucide-react";
import { useApp } from "@/app/context/AppContext";
import { deleteStory, clearHistory } from "@/lib/utils/local-storage";
import { cn } from "@/lib/utils/cn";
import type { StoryPackage } from "@/types";

const AGE_COLORS: Record<string, string> = {
  "4-6": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "7-9": "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  "10-12": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

const LENGTH_LABELS: Record<string, string> = {
  short: "Qisqa",
  medium: "O'rta",
  long: "Uzun",
};

interface HistoryDrawerProps {
  open: boolean;
  onClose: () => void;
}

function StoryCard({ pkg, onLoad, onDelete }: {
  pkg: StoryPackage;
  onLoad: (pkg: StoryPackage) => void;
  onDelete: (id: string) => void;
}) {
  const date = new Date(pkg.generatedAt).toLocaleDateString("uz-UZ", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className="card p-4 hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-200">
      <div className="flex items-start justify-between gap-2 mb-2">
        <button
          onClick={() => onLoad(pkg)}
          className="text-left flex-1 group"
        >
          <h4 className="font-bold text-sm text-gray-800 dark:text-gray-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
            {pkg.title}
          </h4>
        </button>
        <button
          onClick={() => onDelete(pkg.id)}
          aria-label="O'chirish"
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Meta chips */}
      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-full", AGE_COLORS[pkg.ageCategory] || "")}>
          {pkg.ageCategory} yosh
        </span>
        {pkg.storyLength && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
            {LENGTH_LABELS[pkg.storyLength] || pkg.storyLength}
          </span>
        )}
        <span className="text-[11px] text-gray-400 dark:text-gray-600 flex items-center gap-1 ml-auto">
          <Clock size={10} />
          {date}
        </span>
      </div>

      {pkg.metadata?.wordCount && (
        <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-1.5 flex items-center gap-1">
          <BookOpen size={10} />
          {pkg.metadata.wordCount} so&apos;z · {pkg.metadata.readingTimeMinutes} daq o&apos;qish
        </p>
      )}
    </div>
  );
}

export function HistoryDrawer({ open, onClose }: HistoryDrawerProps) {
  const { state, dispatch, loadStory } = useApp();

  function handleLoad(pkg: StoryPackage) {
    loadStory(pkg);
    onClose();
    // Scroll to output
    setTimeout(() => {
      document.getElementById("story-output")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  function handleDelete(id: string) {
    deleteStory(id);
    dispatch({
      type: "LOAD_HISTORY",
      payload: state.history.filter((s) => s.id !== id),
    });
  }

  function handleClearAll() {
    if (window.confirm("Barcha saqlangan ertaklarni o'chirasizmi?")) {
      clearHistory();
      dispatch({ type: "LOAD_HISTORY", payload: [] });
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={cn(
          "fixed top-0 right-0 h-full z-50 w-80 bg-white dark:bg-gray-900",
          "border-l border-amber-100 dark:border-gray-800 shadow-2xl",
          "flex flex-col transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
        aria-label="Tarix"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-amber-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-amber-500" />
            <h2 className="font-display font-bold text-gray-800 dark:text-white">
              Saqlangan ertaklar
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Yopish"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Count + clear */}
        {state.history.length > 0 && (
          <div className="flex items-center justify-between px-5 py-2 bg-amber-50/60 dark:bg-gray-800/60 border-b border-amber-100 dark:border-gray-800">
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Users size={12} />
              {state.history.length} ta ertak
            </span>
            <button
              onClick={handleClearAll}
              className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
            >
              Hammasini o&apos;chirish
            </button>
          </div>
        )}

        {/* Story list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {state.history.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen size={36} className="text-amber-200 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-400 dark:text-gray-600 font-medium">
                Hali saqlangan ertaklar yo&apos;q
              </p>
              <p className="text-xs text-gray-300 dark:text-gray-700 mt-1">
                Ertak yaratganingizdan so&apos;ng bu yerda ko&apos;rinadi
              </p>
            </div>
          ) : (
            state.history.map((pkg) => (
              <StoryCard
                key={pkg.id}
                pkg={pkg}
                onLoad={handleLoad}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </aside>
    </>
  );
}
