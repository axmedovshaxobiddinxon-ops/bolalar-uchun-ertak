"use client";

import {
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Users,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ImageResult, ImageGenerationState, ImagePrompt } from "@/types";

// ── Types ─────────────────────────────────────────────────

interface ImageGalleryProps {
  imagePrompts: ImagePrompt[];
  imageState: ImageGenerationState;
  onRegenerateScene: (sceneIndex: number) => void;
}

// ── Helpers ───────────────────────────────────────────────

function downloadImage(result: ImageResult, title: string) {
  const link = document.createElement("a");
  link.href = result.dataUrl;
  const safeName = title
    .replace(/[^\w\s\u0400-\u04FF]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 30)
    .toLowerCase();
  link.download = `${safeName}-scene-${result.sceneIndex}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function downloadAllImages(
  images: Record<number, ImageResult>,
  title: string
) {
  Object.values(images).forEach((img) => downloadImage(img, title));
}

// ── Scene status indicator ────────────────────────────────

function SceneStatusBadge({
  sceneIndex,
  imageState,
}: {
  sceneIndex: number;
  imageState: ImageGenerationState;
}) {
  const status = imageState.sceneStatus[sceneIndex] ?? "idle";
  const error = imageState.sceneErrors[sceneIndex];

  if (status === "generating") {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
        <Loader2 size={9} className="animate-spin" /> Yaratilmoqda…
      </span>
    );
  }
  if (status === "done") {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
        <CheckCircle2 size={9} /> Tayyor
      </span>
    );
  }
  if (status === "error") {
    return (
      <span
        title={error}
        className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 cursor-help"
      >
        <AlertCircle size={9} /> Xatolik
      </span>
    );
  }
  return null;
}

// ── Skeleton / generating placeholder ─────────────────────

function ImageSkeleton({ sceneIndex, prompt }: { sceneIndex: number; prompt: ImagePrompt }) {
  return (
    <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-750 border-2 border-dashed border-amber-200 dark:border-amber-800 animate-pulse flex flex-col items-center justify-center gap-3">
      <Loader2 size={28} className="text-amber-300 dark:text-amber-600 animate-spin" />
      <div className="text-center px-4">
        <p className="text-xs font-bold text-amber-400 dark:text-amber-600">
          Sahna {sceneIndex} yaratilmoqda…
        </p>
        <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1 line-clamp-2">
          {prompt.storyReference}
        </p>
      </div>
    </div>
  );
}

// ── Empty placeholder ─────────────────────────────────────

function ImagePlaceholder({
  sceneIndex,
  prompt,
  status,
  error,
}: {
  sceneIndex: number;
  prompt: ImagePrompt;
  status: "idle" | "error";
  error?: string;
}) {
  return (
    <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-2 p-4">
      {status === "error" ? (
        <>
          <AlertCircle size={28} className="text-red-400" />
          <p className="text-xs font-bold text-red-500 text-center">
            Xatolik yuz berdi
          </p>
          {error && (
            <p className="text-[10px] text-red-400 text-center line-clamp-3">
              {error}
            </p>
          )}
        </>
      ) : (
        <>
          <Sparkles size={28} className="text-gray-300 dark:text-gray-600" />
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 text-center">
            Sahna {sceneIndex}
          </p>
          <p className="text-[10px] text-gray-300 dark:text-gray-700 text-center line-clamp-2">
            {prompt.storyReference}
          </p>
        </>
      )}
    </div>
  );
}

// ── Single scene card ─────────────────────────────────────

interface SceneCardProps {
  prompt: ImagePrompt;
  result: ImageResult | undefined;
  sceneStatus: "idle" | "generating" | "done" | "error";
  sceneError?: string;
  onOpenLightbox: (sceneIndex: number) => void;
  onDownload: (result: ImageResult) => void;
  onRegenerate: (sceneIndex: number) => void;
  isRegenerating: boolean;
}

function SceneCard({
  prompt,
  result,
  sceneStatus,
  sceneError,
  onOpenLightbox,
  onDownload,
  onRegenerate,
  isRegenerating,
}: SceneCardProps) {
  return (
    <div className="rounded-2xl border border-amber-100 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
      {/* Image area */}
      <div className="relative">
        {sceneStatus === "generating" ? (
          <ImageSkeleton sceneIndex={prompt.scene} prompt={prompt} />
        ) : result ? (
          <button
            onClick={() => onOpenLightbox(prompt.scene)}
            className="relative w-full aspect-square block group"
            aria-label={`Sahna ${prompt.scene} rasmini kattalashtirish`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.dataUrl}
              alt={`Sahna ${prompt.scene}: ${prompt.storyReference}`}
              className="w-full h-full object-cover rounded-t-2xl"
              loading="lazy"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors rounded-t-2xl flex items-center justify-center">
              <ZoomIn
                size={28}
                className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
              />
            </div>
          </button>
        ) : (
          <ImagePlaceholder
            sceneIndex={prompt.scene}
            prompt={prompt}
            status={sceneStatus === "error" ? "error" : "idle"}
            error={sceneError}
          />
        )}
      </div>

      {/* Scene info */}
      <div className="p-3 space-y-2">
        {/* Header row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-5 h-5 rounded-full bg-amber-400 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
              {prompt.scene}
            </span>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">
              {prompt.storyReference}
            </span>
          </div>
          <SceneStatusBadge
            sceneIndex={prompt.scene}
            imageState={{ sceneStatus: { [prompt.scene]: sceneStatus }, sceneErrors: { [prompt.scene]: sceneError ?? "" } } as never}
          />
        </div>

        {/* Characters */}
        {prompt.characters.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            <Users size={10} className="text-gray-400 flex-shrink-0" />
            {prompt.characters.slice(0, 3).map((name) => (
              <span
                key={name}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-900 font-medium"
              >
                {name}
              </span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-1.5 pt-0.5">
          {/* Download */}
          {result && (
            <button
              onClick={() => onDownload(result)}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl text-[11px] font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all"
            >
              <Download size={11} />
              Yuklab olish
            </button>
          )}
          {/* Regenerate */}
          <button
            onClick={() => onRegenerate(prompt.scene)}
            disabled={sceneStatus === "generating" || isRegenerating}
            className={cn(
              "flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl text-[11px] font-semibold border transition-all",
              result ? "flex-none" : "flex-1",
              "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-300 hover:text-amber-600 dark:hover:border-amber-700 dark:hover:text-amber-400",
              (sceneStatus === "generating" || isRegenerating) && "opacity-50 cursor-not-allowed"
            )}
          >
            <RefreshCw
              size={11}
              className={sceneStatus === "generating" ? "animate-spin" : ""}
            />
            {result ? "" : "Qayta yaratish"}
            {result && <span className="sr-only">Qayta yaratish</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Lightbox ──────────────────────────────────────────────

interface LightboxProps {
  images: Record<number, ImageResult>;
  prompts: ImagePrompt[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onDownload: (result: ImageResult) => void;
}

function Lightbox({
  images,
  prompts,
  currentIndex,
  onClose,
  onPrev,
  onNext,
  onDownload,
}: LightboxProps) {
  const result = images[currentIndex];
  const prompt = prompts.find((p) => p.scene === currentIndex);
  const sortedScenes = prompts
    .map((p) => p.scene)
    .filter((s) => images[s])
    .sort((a, b) => a - b);
  const posInGallery = sortedScenes.indexOf(currentIndex);
  const totalWithImages = sortedScenes.length;

  // Keyboard nav
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  if (!result || !prompt) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Lightbox */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: "calc(100vh - 32px)" }}
          role="dialog"
          aria-modal="true"
          aria-label={`Sahna ${currentIndex} rasmi`}
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
            <div className="min-w-0">
              <p className="font-bold text-sm text-gray-800 dark:text-white truncate">
                Sahna {currentIndex}: {prompt.storyReference}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {posInGallery + 1} / {totalWithImages} rasm ·{" "}
                {result.width}×{result.height}px · {result.model}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => onDownload(result)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-all"
              >
                <Download size={13} />
                Yuklab olish
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

          {/* Image */}
          <div className="relative flex-1 min-h-0 bg-gray-50 dark:bg-gray-950 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.dataUrl}
              alt={`Sahna ${currentIndex}: ${prompt.storyReference}`}
              className="w-full h-full object-contain"
            />

            {/* Nav arrows */}
            {posInGallery > 0 && (
              <button
                onClick={onPrev}
                aria-label="Oldingi rasm"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-gray-900 transition-all"
              >
                <ChevronLeft size={20} className="text-gray-700 dark:text-gray-200" />
              </button>
            )}
            {posInGallery < totalWithImages - 1 && (
              <button
                onClick={onNext}
                aria-label="Keyingi rasm"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-gray-900 transition-all"
              >
                <ChevronRight size={20} className="text-gray-700 dark:text-gray-200" />
              </button>
            )}
          </div>

          {/* Characters footer */}
          {prompt.characters.length > 0 && (
            <div className="flex items-center gap-2 px-5 py-2.5 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
              <Users size={13} className="text-gray-400" />
              <div className="flex flex-wrap gap-1.5">
                {prompt.characters.map((name) => (
                  <span
                    key={name}
                    className="text-[11px] px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800 font-semibold"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Main ImageGallery component ───────────────────────────

export function ImageGallery({
  imagePrompts,
  imageState,
  onRegenerateScene,
}: ImageGalleryProps) {
  const [lightboxScene, setLightboxScene] = useState<number | null>(null);

  const sortedPrompts = [...imagePrompts].sort((a, b) => a.scene - b.scene);
  const doneImages = imageState.images;

  // Lightbox navigation — only scenes that have images
  const scenesWithImages = sortedPrompts
    .map((p) => p.scene)
    .filter((s) => doneImages[s]);

  const lightboxPos = lightboxScene !== null ? scenesWithImages.indexOf(lightboxScene) : -1;

  const openLightbox = useCallback((sceneIndex: number) => {
    if (doneImages[sceneIndex]) setLightboxScene(sceneIndex);
  }, [doneImages]);

  const closeLightbox = useCallback(() => setLightboxScene(null), []);

  const prevScene = useCallback(() => {
    if (lightboxPos > 0) setLightboxScene(scenesWithImages[lightboxPos - 1]);
  }, [lightboxPos, scenesWithImages]);

  const nextScene = useCallback(() => {
    if (lightboxPos < scenesWithImages.length - 1)
      setLightboxScene(scenesWithImages[lightboxPos + 1]);
  }, [lightboxPos, scenesWithImages]);

  const handleDownload = useCallback((result: ImageResult) => {
    downloadImage(result, "ertak");
  }, []);

  const doneCount = Object.values(imageState.sceneStatus).filter((s) => s === "done").length;
  const isAnyGenerating = imageState.status === "generating";

  return (
    <>
      {/* Lightbox */}
      {lightboxScene !== null && doneImages[lightboxScene] && (
        <Lightbox
          images={doneImages}
          prompts={sortedPrompts}
          currentIndex={lightboxScene}
          onClose={closeLightbox}
          onPrev={prevScene}
          onNext={nextScene}
          onDownload={handleDownload}
        />
      )}

      {/* Gallery header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
            {doneCount} / {sortedPrompts.length} rasm tayyor
          </span>
          {isAnyGenerating && (
            <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-semibold">
              <Loader2 size={12} className="animate-spin" />
              Yaratilmoqda…
            </span>
          )}
          {imageState.status === "done" && (
            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-semibold">
              <CheckCircle2 size={12} />
              Barcha rasmlar tayyor!
            </span>
          )}
          {imageState.status === "partial" && (
            <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-semibold">
              <AlertCircle size={12} />
              Ba'zi rasmlar xato
            </span>
          )}
        </div>
        {/* Download all */}
        {doneCount > 0 && (
          <button
            onClick={() => downloadAllImages(doneImages, "ertak")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all"
          >
            <Download size={12} />
            Hammasini yuklab olish ({doneCount})
          </button>
        )}
      </div>

      {/* Image grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sortedPrompts.map((prompt) => {
          const sceneStatus = imageState.sceneStatus[prompt.scene] ?? "idle";
          const result = doneImages[prompt.scene];
          const sceneError = imageState.sceneErrors[prompt.scene];

          return (
            <SceneCard
              key={prompt.scene}
              prompt={prompt}
              result={result}
              sceneStatus={sceneStatus}
              sceneError={sceneError}
              onOpenLightbox={openLightbox}
              onDownload={handleDownload}
              onRegenerate={onRegenerateScene}
              isRegenerating={
                sceneStatus === "generating"
              }
            />
          );
        })}
      </div>
    </>
  );
}
