"use client";

import {
  Sparkles,
  Square,
  Loader2,
  AlertCircle,
  StopCircle,
} from "lucide-react";
import { useCallback } from "react";
import { OutputSection } from "./OutputSection";
import { ImageGallery } from "./ImageGallery";
import { CopyButton } from "@/components/ui/CopyButton";
import { useApp } from "@/app/context/AppContext";
import { cn } from "@/lib/utils/cn";
import type { ImagePrompt, StoryPackage } from "@/types";

interface ImagePromptsSectionProps {
  imagePrompts: ImagePrompt[];
  pkg: StoryPackage;
}

// ── Progress bar ──────────────────────────────────────────

function GenerationProgressBar({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span className="font-semibold">
          {completed} / {total} rasm
        </span>
        <span>{pct}%</span>
      </div>
      <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Generate button panel ─────────────────────────────────

function GeneratePanel({
  pkg,
  disabled,
}: {
  pkg: StoryPackage;
  disabled: boolean;
}) {
  const { generateImages, cancelImageGeneration, imageGenerating, state } = useApp();
  const imageState = state.imageState;
  const hasAnyImages = Object.keys(imageState.images).length > 0;
  const isGenerating = imageState.status === "generating";
  const isDone = imageState.status === "done";
  const isPartial = imageState.status === "partial";
  const isError = imageState.status === "error";

  const handleGenerate = useCallback(() => {
    generateImages(pkg);
  }, [generateImages, pkg]);

  const handleRegenerateAll = useCallback(() => {
    generateImages(pkg);
  }, [generateImages, pkg]);

  return (
    <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4 space-y-3">
      {/* Status / info row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-sm text-gray-800 dark:text-gray-100">
            🎨 AI rasm generatsiyasi
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Disney Pixar 3D uslubida · Qahramonlar izchilligi · gpt-image-1
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isDone && (
            <span className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
              ✓ Tayyor
            </span>
          )}
          {isPartial && (
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <AlertCircle size={12} /> Qisman
            </span>
          )}
          {isError && (
            <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle size={12} /> Xatolik
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {isGenerating && (
        <GenerationProgressBar
          completed={imageState.completed}
          total={imageState.total}
        />
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Generate / Re-generate all */}
        {!isGenerating ? (
          <button
            onClick={hasAnyImages ? handleRegenerateAll : handleGenerate}
            disabled={disabled}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all",
              "focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2",
              disabled
                ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white shadow-warm hover:shadow-lg"
            )}
          >
            <Sparkles size={15} />
            {hasAnyImages ? "Barcha rasmlarni qayta yaratish" : `${pkg.imagePrompts.length} ta rasm yaratish`}
          </button>
        ) : (
          <button
            onClick={cancelImageGeneration}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
          >
            <StopCircle size={15} />
            To&apos;xtatish
          </button>
        )}
      </div>

      {/* Disabled explanation */}
      {disabled && !imageGenerating && (
        <p className="text-xs text-gray-400 dark:text-gray-600 flex items-center gap-1">
          <AlertCircle size={11} />
          IMAGE_AI_PROVIDER sozlanmagan. .env.local faylida IMAGE_AI_PROVIDER=openai qo&apos;ying.
        </p>
      )}
    </div>
  );
}

// ── Prompt details (collapsible) ──────────────────────────

function PromptDetails({ imagePrompts }: { imagePrompts: ImagePrompt[] }) {
  const allPromptsText = imagePrompts
    .map((p) => `Scene ${p.scene}: ${p.prompt}`)
    .join("\n\n");

  return (
    <details className="group">
      <summary className="cursor-pointer text-xs font-semibold text-gray-400 dark:text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors select-none list-none flex items-center gap-1.5 py-1">
        <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
        Prompt matnlarini ko&apos;rish ({imagePrompts.length} ta)
        <CopyButton text={allPromptsText} size="sm" className="ml-auto" />
      </summary>
      <div className="mt-3 space-y-3">
        {imagePrompts.map((prompt) => (
          <div
            key={prompt.scene}
            className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
          >
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                Sahna {prompt.scene} — {prompt.storyReference}
              </span>
              <CopyButton text={prompt.prompt} size="sm" />
            </div>
            <p className="px-3 py-2.5 text-xs font-mono text-gray-600 dark:text-gray-400 leading-relaxed bg-white dark:bg-gray-900">
              {prompt.prompt}
            </p>
          </div>
        ))}
      </div>
    </details>
  );
}

// ── Main section ──────────────────────────────────────────

export function ImagePromptsSection({ imagePrompts, pkg }: ImagePromptsSectionProps) {
  if (!imagePrompts?.length) return null;

  const { state, generateImages, imageGenerating } = useApp();
  const imageState = state.imageState;

  // Detect whether image generation is configured server-side
  // We can't know for sure client-side, so we optimistically allow the button.
  // The API will return 503 if not configured; the error surfaces in imageState.
  const imageGenEnabled = true; // always show the button; 503 handled gracefully

  const handleRegenerateScene = useCallback(
    (sceneIndex: number) => {
      generateImages(pkg, [sceneIndex]);
    },
    [generateImages, pkg]
  );

  const doneCount = Object.keys(imageState.images).length;
  const badge =
    doneCount > 0
      ? `${doneCount}/${imagePrompts.length} rasm`
      : `${imagePrompts.length} ta sahna`;

  return (
    <OutputSection
      id="image-prompts"
      title="Rasmlar"
      icon="🖼️"
      badge={badge}
      defaultOpen={true}
    >
      <div className="space-y-5">
        {/* Generate panel */}
        <GeneratePanel pkg={pkg} disabled={!imageGenEnabled || imageGenerating} />

        {/* Gallery — show as soon as any scene has started */}
        {(imageState.status !== "idle" || doneCount > 0) && (
          <ImageGallery
            imagePrompts={imagePrompts}
            imageState={imageState}
            onRegenerateScene={handleRegenerateScene}
          />
        )}

        {/* Prompt details (collapsed by default) */}
        <PromptDetails imagePrompts={imagePrompts} />
      </div>
    </OutputSection>
  );
}
