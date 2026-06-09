"use client";

import { Image as ImageIcon, Users } from "lucide-react";
import { OutputSection } from "./OutputSection";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn } from "@/lib/utils/cn";
import type { ImagePrompt } from "@/types";

interface ImagePromptsSectionProps {
  imagePrompts: ImagePrompt[];
}

export function ImagePromptsSection({ imagePrompts }: ImagePromptsSectionProps) {
  if (!imagePrompts?.length) return null;

  const allPromptsText = imagePrompts
    .map((p) => `Scene ${p.scene}: ${p.prompt}`)
    .join("\n\n");

  return (
    <OutputSection
      id="image-prompts"
      title="Rasm uchun tavsiflar"
      icon="🖼️"
      copyText={allPromptsText}
      badge={`${imagePrompts.length} ta rasm`}
    >
      <div className="space-y-4">
        {imagePrompts.map((prompt) => (
          <div
            key={prompt.scene}
            className="rounded-xl border border-amber-100 dark:border-gray-700 overflow-hidden"
          >
            {/* Scene header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-amber-50/80 dark:bg-gray-800/80">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-400 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {prompt.scene}
                </span>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 line-clamp-1">
                  {prompt.storyReference}
                </span>
              </div>
              <CopyButton text={prompt.prompt} size="sm" />
            </div>

            {/* Prompt body */}
            <div className="p-4 space-y-3">
              {/* Image placeholder slot — Phase 3 will fill this */}
              <div className="w-full h-28 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-750 border-2 border-dashed border-amber-200 dark:border-gray-700 flex flex-col items-center justify-center gap-1">
                <ImageIcon size={22} className="text-amber-300 dark:text-gray-600" />
                <span className="text-xs text-amber-300 dark:text-gray-600 font-medium">
                  Rasm yaratish — Phase 3
                </span>
              </div>

              {/* English prompt */}
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-mono bg-gray-50 dark:bg-gray-800/60 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                {prompt.prompt}
              </p>

              {/* Characters + style */}
              <div className="flex flex-wrap items-center gap-2">
                {prompt.characters.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Users size={12} className="text-gray-400" />
                    {prompt.characters.map((name) => (
                      <span
                        key={name}
                        className="text-xs px-2 py-0.5 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800 rounded-full font-medium"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                )}
                <span className={cn(
                  "text-[11px] px-2 py-0.5 rounded-full font-medium ml-auto",
                  "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800"
                )}>
                  {prompt.style}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </OutputSection>
  );
}
