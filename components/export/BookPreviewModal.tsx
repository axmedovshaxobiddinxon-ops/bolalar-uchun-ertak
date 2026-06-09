"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  FileDown,
  FileText,
  BookOpen,
  Users,
  Star,
  Image as ImageIcon,
  Hash,
  ArrowLeft,
  List,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { generateBook, type Book, type BookPage, type PageType } from "@/lib/utils/book-generator";
import type { StoryPackage } from "@/types";

// ── Page type meta ────────────────────────────────────────

const PAGE_META: Record<PageType, { icon: React.ElementType; label: string; bg: string; accent: string }> = {
  cover:          { icon: BookOpen,  label: "Muqova",           bg: "from-amber-400 to-orange-500",  accent: "text-amber-700" },
  author:         { icon: FileText,  label: "Muallif",          bg: "from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700", accent: "text-gray-600 dark:text-gray-300" },
  toc:            { icon: List,      label: "Mundarija",        bg: "from-amber-50 to-yellow-50 dark:from-gray-800 dark:to-gray-750", accent: "text-amber-600" },
  dedication:     { icon: BookOpen,  label: "Qisqa mazmun",     bg: "from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700", accent: "text-amber-700" },
  "story-opening":{ icon: BookOpen,  label: "Boshlanish",       bg: "from-sky-50 to-blue-50 dark:from-gray-800 dark:to-gray-700",   accent: "text-sky-600"  },
  "story-body":   { icon: FileText,  label: "Ertak",            bg: "from-white to-gray-50 dark:from-gray-900 dark:to-gray-800",    accent: "text-gray-700 dark:text-gray-200" },
  "story-closing":{ icon: Star,      label: "Yakun",            bg: "from-amber-50 to-yellow-50 dark:from-gray-800 dark:to-gray-700", accent: "text-amber-700" },
  moral:          { icon: Star,      label: "Saboq",            bg: "from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700", accent: "text-green-600" },
  characters:     { icon: Users,     label: "Qahramonlar",      bg: "from-sky-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700",   accent: "text-sky-600"  },
  "image-prompts":{ icon: ImageIcon, label: "Rasm tavsiflar",   bg: "from-purple-50 to-violet-50 dark:from-gray-800 dark:to-gray-700", accent: "text-purple-600" },
  hashtags:       { icon: Hash,      label: "Xeshteglar",       bg: "from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-700", accent: "text-orange-600" },
  "back-cover":   { icon: BookOpen,  label: "Orqa muqova",      bg: "from-amber-400 to-orange-500",  accent: "text-amber-700" },
};

// ── Individual page renderers ─────────────────────────────

function CoverPageView({ page, book }: { page: BookPage; book: Book }) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-amber-400 to-orange-500 text-white p-8 text-center">
      <div className="text-6xl mb-4">📚</div>
      <h1 className="font-display font-extrabold text-2xl sm:text-3xl leading-tight mb-3 drop-shadow">
        {book.title}
      </h1>
      <div className="bg-white/20 rounded-full px-4 py-1.5 text-sm font-bold mb-6">
        {book.ageCategory} yosh uchun ertak
      </div>
      <div className="max-w-xs bg-white/15 backdrop-blur rounded-2xl p-4 text-sm leading-relaxed italic">
        {page.content}
      </div>
      <div className="mt-8 text-xs opacity-70 font-semibold">
        Bolalar Uchun Ertak · AI Ertak Yaratuvchi
      </div>
    </div>
  );
}

function AuthorPageView({ page }: { page: BookPage }) {
  const lines = page.content.split("\n").filter(Boolean);
  return (
    <div className="p-6 sm:p-8 space-y-3 h-full overflow-y-auto">
      <h2 className="font-display font-bold text-xl text-amber-700 dark:text-amber-400 mb-4 flex items-center gap-2">
        <FileText size={18} /> Muallif sahifasi
      </h2>
      <div className="space-y-2">
        {lines.map((line, i) => {
          const colonIdx = line.indexOf(":");
          if (colonIdx > 0) {
            const label = line.slice(0, colonIdx);
            const value = line.slice(colonIdx + 1).trim();
            return (
              <div key={i} className="flex gap-2 bg-amber-50 dark:bg-gray-800 rounded-xl px-3 py-2">
                <span className="font-bold text-amber-700 dark:text-amber-400 text-sm whitespace-nowrap min-w-[140px]">
                  {label}:
                </span>
                <span className="text-gray-700 dark:text-gray-300 text-sm">{value}</span>
              </div>
            );
          }
          return (
            <p key={i} className="text-xs text-gray-400 dark:text-gray-500 italic text-center mt-4">
              {line}
            </p>
          );
        })}
      </div>
    </div>
  );
}

function TocPageView({ book }: { book: Book }) {
  const typeIcons: Record<string, string> = {
    dedication: "📝",
    "story-opening": "📖",
    "story-body": "📄",
    "story-closing": "🌅",
    moral: "🌟",
    characters: "👥",
    "image-prompts": "🖼️",
    hashtags: "📣",
  };

  return (
    <div className="p-6 sm:p-8 h-full overflow-y-auto">
      <h2 className="font-display font-bold text-xl text-amber-700 dark:text-amber-400 mb-5 flex items-center gap-2">
        <List size={18} /> Mundarija
      </h2>
      <div className="space-y-1">
        {book.toc.map((entry, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-xl",
              i % 2 === 0
                ? "bg-amber-50 dark:bg-gray-800"
                : "bg-transparent"
            )}
          >
            <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <span>{typeIcons[entry.type] ?? "•"}</span>
              <span>{entry.title}</span>
            </span>
            <span className="font-bold text-amber-600 dark:text-amber-400 text-sm ml-4 tabular-nums">
              {entry.pageNumber}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StoryPageView({ page, imageMap = {} }: { page: BookPage; imageMap?: Record<number, string> }) {
  const meta = PAGE_META[page.type];
  const Icon = meta.icon;

  const paragraphs = page.content
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  // Pick an illustration for this story page type
  const sceneKeys = Object.keys(imageMap).map(Number).sort((a, b) => a - b);
  let illustrationUrl: string | null = null;
  if (sceneKeys.length > 0) {
    if (page.type === "story-opening") {
      illustrationUrl = imageMap[sceneKeys[0]] ?? null;
    } else if (page.type === "story-closing") {
      illustrationUrl = imageMap[sceneKeys[sceneKeys.length - 1]] ?? null;
    } else if (page.type === "story-body") {
      const midScenes = sceneKeys.slice(1, -1);
      if (midScenes.length > 0) {
        illustrationUrl = imageMap[midScenes[0]] ?? null;
      }
    }
  }

  return (
    <div className="p-6 sm:p-8 h-full overflow-y-auto">
      {/* Chapter label */}
      {(page.type === "story-opening" || page.type === "story-closing") && (
        <div className={cn("flex items-center gap-2 mb-3", meta.accent)}>
          <Icon size={16} />
          <span className="font-bold text-sm uppercase tracking-wide">{meta.label}</span>
        </div>
      )}
      {/* Story title on opening page */}
      {page.type === "story-opening" && page.subtitle && (
        <h2 className="font-display font-extrabold text-xl sm:text-2xl text-gray-900 dark:text-white mb-4 leading-tight border-b border-amber-200 dark:border-gray-700 pb-3">
          {page.subtitle}
        </h2>
      )}

      {/* Inline illustration */}
      {illustrationUrl && (
        <div className="float-right ml-4 mb-3 w-2/5 rounded-2xl overflow-hidden shadow-md border border-amber-100 dark:border-gray-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={illustrationUrl}
            alt="Sahna rasmi"
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {/* Body text */}
      <div className="prose prose-sm dark:prose-invert max-w-none">
        {paragraphs.map((para, i) => (
          <p
            key={i}
            className="text-gray-700 dark:text-gray-200 leading-[1.85] mb-4 text-[15px] indent-6"
          >
            {para}
          </p>
        ))}
      </div>
      <div className="clear-both" />
    </div>
  );
}

function MoralPageView({ page }: { page: BookPage }) {
  return (
    <div className="p-6 sm:p-8 h-full overflow-y-auto space-y-5">
      <div className="text-center text-4xl">🌟</div>
      <h2 className="font-display font-bold text-xl text-green-700 dark:text-green-400 text-center">
        Saboq va Xulosa
      </h2>
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-5 text-center">
        <p className="text-gray-800 dark:text-gray-100 font-bold text-[15px] leading-relaxed">
          {page.content}
        </p>
      </div>
      {page.subtitle && (
        <>
          <h3 className="font-bold text-sm text-sky-600 dark:text-sky-400 flex items-center gap-2">
            <span>👨‍👩‍👧</span> Ota-onalar uchun izoh
          </h3>
          <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-2xl p-4">
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed italic">
              {page.subtitle}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function CharactersPageView({ page }: { page: BookPage }) {
  const blocks = page.content.split(/\n{2,}/).filter(Boolean);
  return (
    <div className="p-6 sm:p-8 h-full overflow-y-auto">
      <h2 className="font-display font-bold text-xl text-sky-700 dark:text-sky-400 mb-5 flex items-center gap-2">
        <Users size={18} /> Qahramonlar
      </h2>
      <div className="space-y-3">
        {blocks.map((block, i) => {
          const [nameLine, ...descLines] = block.split("\n");
          const [nameRaw, roleRaw] = nameLine.split("(");
          const name = nameRaw?.trim() ?? "";
          const role = roleRaw?.replace(")", "").replace(":", "").trim() ?? "";
          const desc = descLines.join(" ").trim();
          return (
            <div
              key={i}
              className={cn(
                "rounded-2xl p-4",
                i % 2 === 0
                  ? "bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-900"
                  : "bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900"
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {name[0]}
                </div>
                <span className="font-bold text-gray-800 dark:text-gray-100">{name}</span>
                {role && (
                  <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                    {role}
                  </span>
                )}
              </div>
              {desc && (
                <p className="text-xs text-gray-500 dark:text-gray-400 italic pl-11">
                  {desc}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ImagePromptsPageView({ page, imageMap = {} }: { page: BookPage; imageMap?: Record<number, string> }) {
  const sceneKeys = Object.keys(imageMap).map(Number).sort((a, b) => a - b);
  const hasImages = sceneKeys.length > 0;

  if (hasImages) {
    return (
      <div className="p-6 sm:p-8 h-full overflow-y-auto">
        <h2 className="font-display font-bold text-xl text-purple-700 dark:text-purple-400 mb-5 flex items-center gap-2">
          <ImageIcon size={18} /> Rasm Galereyasi
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {sceneKeys.map((sceneIndex) => {
            const url = imageMap[sceneIndex];
            return (
              <div key={sceneIndex} className="rounded-2xl overflow-hidden border border-purple-100 dark:border-purple-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Sahna ${sceneIndex}`}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
                <div className="bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5">
                  <p className="text-xs font-bold text-purple-700 dark:text-purple-400">
                    Sahna {sceneIndex}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const blocks = page.content.split(/\n{2,}/).filter(Boolean);
  return (
    <div className="p-6 sm:p-8 h-full overflow-y-auto">
      <h2 className="font-display font-bold text-xl text-purple-700 dark:text-purple-400 mb-5 flex items-center gap-2">
        <ImageIcon size={18} /> Rasm Tavsiflar
      </h2>
      <div className="space-y-4">
        {blocks.map((block, i) => {
          const [sceneLine, ...promptLines] = block.split("\n");
          const prompt = promptLines.join(" ").trim();
          return (
            <div key={i} className="rounded-2xl border border-purple-100 dark:border-purple-900 overflow-hidden">
              <div className="bg-purple-50 dark:bg-purple-900/20 px-4 py-2">
                <p className="text-xs font-bold text-purple-700 dark:text-purple-400">{sceneLine}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-mono leading-relaxed">
                  {prompt}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HashtagsPageView({ page }: { page: BookPage }) {
  const tags = page.content.split(/\s+/).filter((t) => t.startsWith("#"));
  return (
    <div className="p-6 sm:p-8 h-full overflow-y-auto">
      <h2 className="font-display font-bold text-xl text-orange-700 dark:text-orange-400 mb-5 flex items-center gap-2">
        <Hash size={18} /> Xeshteglar
      </h2>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-bold border border-amber-200 dark:border-amber-800"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function BackCoverView({ page, book }: { page: BookPage; book: Book }) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-amber-400 to-orange-500 text-white p-8 text-center">
      <div className="text-5xl mb-4">🌟</div>
      <h3 className="font-display font-bold text-lg mb-4">Saboq</h3>
      <div className="max-w-xs bg-white/20 backdrop-blur rounded-2xl p-5 text-sm leading-relaxed italic mb-8">
        {page.content}
      </div>
      <div className="border-t border-white/30 pt-5 w-full max-w-xs">
        <p className="font-display font-bold text-sm mb-1">{book.title}</p>
        <p className="text-xs opacity-70">{book.ageCategory} yosh uchun</p>
      </div>
    </div>
  );
}

function GenericPageView({ page }: { page: BookPage }) {
  const paragraphs = page.content
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <div className="p-6 sm:p-8 h-full overflow-y-auto">
      {paragraphs.map((para, i) => (
        <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3 text-sm">
          {para}
        </p>
      ))}
    </div>
  );
}

// ── Page view dispatcher ──────────────────────────────────

function PageView({ page, book, imageMap = {} }: { page: BookPage; book: Book; imageMap?: Record<number, string> }) {
  switch (page.type) {
    case "cover":          return <CoverPageView page={page} book={book} />;
    case "author":         return <AuthorPageView page={page} />;
    case "toc":            return <TocPageView book={book} />;
    case "dedication":     return <GenericPageView page={page} />;
    case "story-opening":
    case "story-body":
    case "story-closing":  return <StoryPageView page={page} imageMap={imageMap} />;
    case "moral":          return <MoralPageView page={page} />;
    case "characters":     return <CharactersPageView page={page} />;
    case "image-prompts":  return <ImagePromptsPageView page={page} imageMap={imageMap} />;
    case "hashtags":       return <HashtagsPageView page={page} />;
    case "back-cover":     return <BackCoverView page={page} book={book} />;
    default:               return <GenericPageView page={page} />;
  }
}

// ── Main modal ────────────────────────────────────────────

interface BookPreviewModalProps {
  pkg: StoryPackage | null;
  open: boolean;
  onClose: () => void;
  onExportPdf: () => void;
  onExportDocx: () => void;
  exporting: boolean;
  /** Optional map sceneIndex → dataUrl for showing images inline */
  imageMap?: Record<number, string>;
}

export function BookPreviewModal({
  pkg,
  open,
  onClose,
  onExportPdf,
  onExportDocx,
  exporting,
  imageMap = {},
}: BookPreviewModalProps) {
  const [book, setBook] = useState<Book | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showThumbs, setShowThumbs] = useState(false);

  // Build book when pkg changes or modal opens
  useEffect(() => {
    if (pkg && open) {
      const b = generateBook(pkg);
      setBook(b);
      setCurrentIdx(0);
    }
  }, [pkg, open]);

  const totalPages = book?.pages.length ?? 0;
  const currentPage = book?.pages[currentIdx] ?? null;

  const goTo = useCallback((idx: number) => {
    setCurrentIdx(Math.max(0, Math.min(idx, totalPages - 1)));
  }, [totalPages]);

  const goPrev = useCallback(() => goTo(currentIdx - 1), [currentIdx, goTo]);
  const goNext = useCallback(() => goTo(currentIdx + 1), [currentIdx, goTo]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft")  goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "Escape")     onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, goPrev, goNext, onClose]);

  if (!open || !book || !currentPage) return null;

  const meta = PAGE_META[currentPage.type];

  const isFirstPage = currentIdx === 0;
  const isLastPage = currentIdx === totalPages - 1;

  const isCoverOrBack =
    currentPage.type === "cover" || currentPage.type === "back-cover";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: "calc(100vh - 48px)" }}
          role="dialog"
          aria-modal="true"
          aria-label="Kitob ko'rish"
        >
          {/* ── Toolbar ── */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
            {/* Left: back + title */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex-shrink-0"
                aria-label="Yopish"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="min-w-0">
                <p className="font-display font-bold text-gray-900 dark:text-white text-sm truncate">
                  {book.title}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {book.totalPages} sahifa · {book.totalWords} so&apos;z
                  {Object.keys(imageMap).length > 0 && (
                    <span className="ml-2 text-amber-500 font-semibold">
                      · 🖼️ {Object.keys(imageMap).length} rasm
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Right: export + thumbnail toggle + close */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowThumbs((v) => !v)}
                aria-label="Sahifalar ro'yxati"
                className={cn(
                  "hidden sm:flex w-8 h-8 rounded-xl items-center justify-center transition-all",
                  showThumbs
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                    : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600"
                )}
              >
                <List size={16} />
              </button>
              <button
                onClick={onExportDocx}
                disabled={exporting}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 disabled:opacity-50 transition-all"
              >
                <FileText size={13} />
                DOCX
              </button>
              <button
                onClick={onExportPdf}
                disabled={exporting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50 transition-all"
              >
                <FileDown size={13} />
                PDF
              </button>
              <button
                onClick={onClose}
                aria-label="Yopish"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ── Main content area ── */}
          <div className="flex flex-1 min-h-0">
            {/* Thumbnail sidebar */}
            {showThumbs && (
              <aside className="w-32 border-r border-gray-100 dark:border-gray-800 flex flex-col overflow-y-auto flex-shrink-0">
                {book.pages.map((p, idx) => {
                  const m = PAGE_META[p.type];
                  const Icon = m.icon;
                  const isActive = idx === currentIdx;
                  return (
                    <button
                      key={idx}
                      onClick={() => goTo(idx)}
                      className={cn(
                        "flex flex-col items-center gap-1 p-2 border-b border-gray-50 dark:border-gray-800 transition-colors text-left",
                        isActive
                          ? "bg-amber-50 dark:bg-amber-900/20"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                    >
                      <div
                        className={cn(
                          "w-full aspect-[3/4] rounded-lg flex items-center justify-center",
                          `bg-gradient-to-br ${m.bg}`,
                          isActive && "ring-2 ring-amber-400"
                        )}
                      >
                        <Icon size={16} className={m.accent} />
                      </div>
                      <span
                        className={cn(
                          "text-[10px] font-semibold text-center leading-tight line-clamp-2",
                          isActive
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-gray-500 dark:text-gray-400"
                        )}
                      >
                        {p.pageNumber > 0 ? `${p.pageNumber}. ` : ""}{p.title}
                      </span>
                    </button>
                  );
                })}
              </aside>
            )}

            {/* Page view */}
            <div
              className={cn(
                "flex-1 min-h-0 overflow-hidden relative",
                `bg-gradient-to-br ${meta.bg}`
              )}
            >
              {/* Page label chip */}
              {!isCoverOrBack && (
                <div className="absolute top-3 left-3 z-10">
                  <span className={cn("text-xs font-bold px-2 py-1 rounded-full bg-white/70 dark:bg-black/40 backdrop-blur-sm", meta.accent)}>
                    {currentPage.pageNumber > 0 ? `Sahifa ${currentPage.pageNumber}` : ""} — {meta.label}
                  </span>
                </div>
              )}
              <div className="h-full overflow-y-auto">
                <PageView page={currentPage} book={book} imageMap={imageMap} />
              </div>
            </div>
          </div>

          {/* ── Navigation bar ── */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm flex-shrink-0">
            <button
              onClick={goPrev}
              disabled={isFirstPage}
              aria-label="Oldingi sahifa"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Oldingi</span>
            </button>

            {/* Page indicator / dots */}
            <div className="flex items-center gap-1">
              {totalPages <= 12 ? (
                book.pages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goTo(idx)}
                    aria-label={`Sahifa ${idx + 1}`}
                    className={cn(
                      "rounded-full transition-all duration-200",
                      idx === currentIdx
                        ? "w-5 h-2 bg-amber-400"
                        : "w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-amber-300"
                    )}
                  />
                ))
              ) : (
                <span className="text-sm font-bold text-gray-600 dark:text-gray-400 tabular-nums">
                  {currentIdx + 1} / {totalPages}
                </span>
              )}
            </div>

            <button
              onClick={goNext}
              disabled={isLastPage}
              aria-label="Keyingi sahifa"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <span className="hidden sm:inline">Keyingi</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
