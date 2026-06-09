"use client";

import {
  X,
  Trash2,
  BookOpen,
  Clock,
  Search,
  FileDown,
  FileText,
  ChevronDown,
  SlidersHorizontal,
  Star,
  Loader2,
} from "lucide-react";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useApp } from "@/app/context/AppContext";
import { deleteStory, clearHistory, searchHistory, filterHistoryByAge } from "@/lib/utils/local-storage";
import { exportPdf } from "@/lib/utils/export-pdf";
import { exportDocx } from "@/lib/utils/export-docx";
import { cn } from "@/lib/utils/cn";
import type { StoryPackage } from "@/types";

// ── Constants ─────────────────────────────────────────────

const AGE_COLORS: Record<string, string> = {
  "4-6":   "bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400",
  "7-9":   "bg-sky-100    text-sky-700    dark:bg-sky-900/30    dark:text-sky-400",
  "10-12": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

const LENGTH_LABELS: Record<string, string> = {
  short:  "Qisqa",
  medium: "O'rta",
  long:   "Uzun",
};

const AGE_OPTIONS = ["Barchasi", "4-6", "7-9", "10-12"] as const;

// ── Export state per story ────────────────────────────────

type ExportingState = Record<string, "pdf" | "docx" | null>;

// ── Individual story card ─────────────────────────────────

interface StoryCardProps {
  pkg: StoryPackage;
  onLoad: (pkg: StoryPackage) => void;
  onDelete: (id: string) => void;
  exporting: "pdf" | "docx" | null;
  onExportPdf: (pkg: StoryPackage) => void;
  onExportDocx: (pkg: StoryPackage) => void;
}

function StoryCard({
  pkg,
  onLoad,
  onDelete,
  exporting,
  onExportPdf,
  onExportDocx,
}: StoryCardProps) {
  const [expanded, setExpanded] = useState(false);

  const date = new Date(pkg.generatedAt).toLocaleDateString("uz-UZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-200",
        "bg-white dark:bg-gray-900",
        "border-amber-100 dark:border-gray-800",
        "hover:border-amber-300 dark:hover:border-amber-700",
        "shadow-sm hover:shadow-md"
      )}
    >
      {/* Main row */}
      <div className="p-3">
        <div className="flex items-start gap-2">
          {/* Title — click to load */}
          <button
            onClick={() => onLoad(pkg)}
            className="flex-1 text-left group min-w-0"
          >
            <h4 className="font-bold text-sm text-gray-800 dark:text-gray-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug line-clamp-2">
              {pkg.title}
            </h4>
          </button>

          {/* Controls */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Expand toggle */}
            <button
              onClick={() => setExpanded((v) => !v)}
              aria-label="Ko'proq ko'rsatish"
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                "text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20",
                expanded && "text-amber-500 bg-amber-50 dark:bg-amber-900/20"
              )}
            >
              <ChevronDown
                size={13}
                className={cn("transition-transform", expanded && "rotate-180")}
              />
            </button>

            {/* Delete */}
            <button
              onClick={() => onDelete(pkg.id)}
              aria-label="O'chirish"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* Meta chips */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <span
            className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full",
              AGE_COLORS[pkg.ageCategory] ?? ""
            )}
          >
            {pkg.ageCategory} yosh
          </span>
          {pkg.storyLength && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900">
              {LENGTH_LABELS[pkg.storyLength] ?? pkg.storyLength}
            </span>
          )}
          {pkg.metadata?.wordCount && (
            <span className="text-[10px] text-gray-400 dark:text-gray-600 flex items-center gap-0.5">
              <BookOpen size={9} />
              {pkg.metadata.wordCount}
            </span>
          )}
          <span className="text-[10px] text-gray-400 dark:text-gray-600 flex items-center gap-0.5 ml-auto">
            <Clock size={9} />
            {date}
          </span>
        </div>
      </div>

      {/* Expanded section */}
      {expanded && (
        <div className="border-t border-amber-50 dark:border-gray-800 px-3 pb-3 pt-2 space-y-2">
          {/* Summary */}
          {pkg.summary && (
            <p className="text-[11px] text-gray-500 dark:text-gray-500 leading-relaxed line-clamp-3 italic">
              {pkg.summary}
            </p>
          )}

          {/* Educational values */}
          {pkg.educationalValues?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {pkg.educationalValues.slice(0, 4).map((v) => (
                <span
                  key={v}
                  className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-50 dark:bg-yellow-900/10 text-yellow-700 dark:text-yellow-500 border border-yellow-100 dark:border-yellow-900"
                >
                  {v}
                </span>
              ))}
              {pkg.educationalValues.length > 4 && (
                <span className="text-[10px] text-gray-400">
                  +{pkg.educationalValues.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Moral snippet */}
          {pkg.moralLesson && (
            <div className="flex items-start gap-1.5">
              <Star size={10} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-gray-600 dark:text-gray-400 italic line-clamp-2">
                {pkg.moralLesson}
              </p>
            </div>
          )}

          {/* Export buttons */}
          <div className="flex gap-1.5 pt-1">
            <button
              onClick={() => onLoad(pkg)}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-bold bg-amber-400 text-white hover:bg-amber-500 transition-colors"
            >
              <BookOpen size={11} />
              Ochish
            </button>
            <button
              onClick={() => onExportPdf(pkg)}
              disabled={exporting !== null}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900 hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 transition-all"
            >
              {exporting === "pdf" ? (
                <Loader2 size={10} className="animate-spin" />
              ) : (
                <FileDown size={10} />
              )}
              PDF
            </button>
            <button
              onClick={() => onExportDocx(pkg)}
              disabled={exporting !== null}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900 hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-50 transition-all"
            >
              {exporting === "docx" ? (
                <Loader2 size={10} className="animate-spin" />
              ) : (
                <FileText size={10} />
              )}
              DOCX
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main drawer ───────────────────────────────────────────

interface HistoryDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function HistoryDrawer({ open, onClose }: HistoryDrawerProps) {
  const { state, dispatch, loadStory } = useApp();

  // Search + filter state
  const [query, setQuery] = useState("");
  const [ageFilter, setAgeFilter] = useState<string>("Barchasi");
  const [sortBy, setSortBy] = useState<"date" | "words" | "age">("date");
  const [showFilters, setShowFilters] = useState(false);
  const [exporting, setExporting] = useState<ExportingState>({});

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search when drawer opens
  useEffect(() => {
    if (open) {
      setTimeout(() => searchInputRef.current?.focus(), 200);
    } else {
      setQuery("");
      setShowFilters(false);
    }
  }, [open]);

  // ── Derived: filtered + sorted story list ─────────────
  const displayedStories = useMemo(() => {
    let list: StoryPackage[];

    if (query.trim()) {
      list = searchHistory(query);
    } else if (ageFilter !== "Barchasi") {
      list = filterHistoryByAge(ageFilter);
    } else {
      list = state.history;
    }

    // Re-sort
    switch (sortBy) {
      case "words":
        list = [...list].sort(
          (a, b) => (b.metadata?.wordCount ?? 0) - (a.metadata?.wordCount ?? 0)
        );
        break;
      case "age":
        list = [...list].sort((a, b) =>
          (a.ageCategory ?? "").localeCompare(b.ageCategory ?? "")
        );
        break;
      default: // "date" — already in newest-first order from localStorage
        break;
    }

    return list;
  }, [query, ageFilter, sortBy, state.history]);

  // ── Actions ───────────────────────────────────────────

  const handleLoad = useCallback(
    (pkg: StoryPackage) => {
      loadStory(pkg);
      onClose();
      setTimeout(() => {
        document.getElementById("story-output")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    },
    [loadStory, onClose]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteStory(id);
      dispatch({
        type: "LOAD_HISTORY",
        payload: state.history.filter((s) => s.id !== id),
      });
    },
    [dispatch, state.history]
  );

  const handleClearAll = useCallback(() => {
    if (window.confirm("Barcha saqlangan ertaklarni o'chirasizmi?")) {
      clearHistory();
      dispatch({ type: "LOAD_HISTORY", payload: [] });
    }
  }, [dispatch]);

  const handleExportPdf = useCallback(async (pkg: StoryPackage) => {
    setExporting((prev) => ({ ...prev, [pkg.id]: "pdf" }));
    try {
      await exportPdf(pkg);
    } catch (err) {
      console.error("PDF export error:", err);
    } finally {
      setExporting((prev) => ({ ...prev, [pkg.id]: null }));
    }
  }, []);

  const handleExportDocx = useCallback(async (pkg: StoryPackage) => {
    setExporting((prev) => ({ ...prev, [pkg.id]: "docx" }));
    try {
      await exportDocx(pkg);
    } catch (err) {
      console.error("DOCX export error:", err);
    } finally {
      setExporting((prev) => ({ ...prev, [pkg.id]: null }));
    }
  }, []);

  const hasHistory = state.history.length > 0;
  const noResults = hasHistory && displayedStories.length === 0 && (query.trim() || ageFilter !== "Barchasi");

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
          "fixed top-0 right-0 h-full z-50",
          "w-full sm:w-96",
          "bg-white dark:bg-gray-950",
          "border-l border-amber-100 dark:border-gray-800 shadow-2xl",
          "flex flex-col",
          "transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
        aria-label="Ertak tarixi"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-amber-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-amber-500" />
            <div>
              <h2 className="font-display font-bold text-gray-800 dark:text-white leading-none">
                Saqlangan ertaklar
              </h2>
              {hasHistory && (
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                  {state.history.length} ta ertak saqlangan
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Yopish"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Search + Filters ── */}
        {hasHistory && (
          <div className="px-4 pt-3 pb-2 space-y-2 border-b border-amber-50 dark:border-gray-800 flex-shrink-0">
            {/* Search input */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                ref={searchInputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Sarlavha, mavzu yoki saboq izlash…"
                className={cn(
                  "w-full pl-9 pr-3 py-2 rounded-xl text-sm",
                  "bg-gray-50 dark:bg-gray-800",
                  "border border-gray-200 dark:border-gray-700",
                  "text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500",
                  "focus:outline-none focus:border-amber-400 dark:focus:border-amber-600 focus:ring-1 focus:ring-amber-300",
                  "transition-colors"
                )}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 dark:hover:text-gray-300"
                  aria-label="Tozalash"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filter toggle row */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  showFilters
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                <SlidersHorizontal size={12} />
                Filter
              </button>

              {/* Active filters display */}
              {ageFilter !== "Barchasi" && (
                <button
                  onClick={() => setAgeFilter("Barchasi")}
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                >
                  {ageFilter} yosh <X size={9} />
                </button>
              )}
              {sortBy !== "date" && (
                <button
                  onClick={() => setSortBy("date")}
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800"
                >
                  {sortBy === "words" ? "So'z" : "Yosh"} <X size={9} />
                </button>
              )}

              {/* Result count */}
              {(query || ageFilter !== "Barchasi") && (
                <span className="ml-auto text-[10px] text-gray-400 dark:text-gray-600">
                  {displayedStories.length} natija
                </span>
              )}
            </div>

            {/* Expanded filter panel */}
            {showFilters && (
              <div className="space-y-2 pt-1">
                {/* Age filter */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5">
                    Yosh toifasi
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {AGE_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setAgeFilter(opt)}
                        className={cn(
                          "px-3 py-1 rounded-full text-[11px] font-semibold border transition-all",
                          ageFilter === opt
                            ? "bg-amber-400 border-amber-400 text-white"
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-300"
                        )}
                      >
                        {opt === "Barchasi" ? "Barchasi" : `${opt} yosh`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5">
                    Saralash
                  </p>
                  <div className="flex gap-1.5">
                    {(["date", "words", "age"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setSortBy(s)}
                        className={cn(
                          "px-3 py-1 rounded-full text-[11px] font-semibold border transition-all",
                          sortBy === s
                            ? "bg-sky-400 border-sky-400 text-white"
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-sky-300"
                        )}
                      >
                        {s === "date" ? "Sana" : s === "words" ? "So'z soni" : "Yosh"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Top action bar ── */}
        {hasHistory && !query && ageFilter === "Barchasi" && (
          <div className="flex items-center justify-between px-5 py-2 bg-amber-50/60 dark:bg-gray-900/60 border-b border-amber-100 dark:border-gray-800 flex-shrink-0">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {displayedStories.length} ta ertak
            </span>
            <button
              onClick={handleClearAll}
              className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
            >
              Hammasini o&apos;chirish
            </button>
          </div>
        )}

        {/* ── Story list ── */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {/* Empty state */}
          {!hasHistory && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen size={40} className="text-amber-200 dark:text-gray-700 mb-3" />
              <p className="text-sm font-semibold text-gray-400 dark:text-gray-600">
                Hali saqlangan ertaklar yo&apos;q
              </p>
              <p className="text-xs text-gray-300 dark:text-gray-700 mt-1 max-w-[200px]">
                Ertak yaratganingizdan so&apos;ng bu yerda ko&apos;rinadi
              </p>
            </div>
          )}

          {/* No-results state */}
          {noResults && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search size={32} className="text-amber-200 dark:text-gray-700 mb-3" />
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-500">
                &quot;{query || ageFilter}&quot; bo&apos;yicha natija topilmadi
              </p>
              <button
                onClick={() => { setQuery(""); setAgeFilter("Barchasi"); }}
                className="mt-3 text-xs text-amber-500 hover:text-amber-700 font-semibold"
              >
                Barcha ertaklarni ko&apos;rish
              </button>
            </div>
          )}

          {/* Story cards */}
          {displayedStories.map((pkg) => (
            <StoryCard
              key={pkg.id}
              pkg={pkg}
              onLoad={handleLoad}
              onDelete={handleDelete}
              exporting={exporting[pkg.id] ?? null}
              onExportPdf={handleExportPdf}
              onExportDocx={handleExportDocx}
            />
          ))}
        </div>

        {/* ── Footer ── */}
        {hasHistory && (
          <div className="px-4 py-3 border-t border-amber-50 dark:border-gray-800 flex-shrink-0">
            <p className="text-[10px] text-gray-300 dark:text-gray-700 text-center">
              💡 Ertakni bosing — ochish. Kengaytiring — PDF/DOCX yuklash.
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
