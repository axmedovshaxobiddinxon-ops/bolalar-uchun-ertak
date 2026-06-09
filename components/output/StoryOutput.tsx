"use client";

import { ChevronUp, Users, BookOpen, Clock } from "lucide-react";
import { OutputSection } from "./OutputSection";
import { ImagePromptsSection } from "./ImagePromptsSection";
import { VideoScenesSection } from "./VideoScenesSection";
import { HashtagsSection } from "./HashtagsSection";
import { ExportBar } from "./ExportBar";
import { VALUE_MAP } from "@/config/educational-values";
import { cn } from "@/lib/utils/cn";
import type { StoryPackage } from "@/types";

const AGE_CONFIG: Record<string, { label: string; color: string }> = {
  "4-6": { label: "4–6 yosh", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  "7-9": { label: "7–9 yosh", color: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400" },
  "10-12": { label: "10–12 yosh", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
};

const LENGTH_LABELS: Record<string, string> = {
  short: "Qisqa ⚡",
  medium: "O'rta 📖",
  long: "Uzun 📚",
};

interface StoryOutputProps {
  pkg: StoryPackage;
}

export function StoryOutput({ pkg }: StoryOutputProps) {
  const ageConfig = AGE_CONFIG[pkg.ageCategory];

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div id="story-output" className="space-y-4">
      {/* ── Hero card: Title + meta ── */}
      <div className="card p-6 sm:p-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 border-amber-200 dark:border-amber-900/50">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* Age badge */}
          <span className={cn("text-sm font-bold px-3 py-1 rounded-full", ageConfig?.color)}>
            {ageConfig?.label}
          </span>
          {/* Length badge */}
          {pkg.storyLength && (
            <span className="text-sm font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              {LENGTH_LABELS[pkg.storyLength] || pkg.storyLength}
            </span>
          )}
        </div>

        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-gray-900 dark:text-white leading-tight mb-4">
          {pkg.title}
        </h2>

        {/* Stats row */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
          {pkg.metadata?.wordCount && (
            <span className="flex items-center gap-1.5">
              <BookOpen size={14} />
              {pkg.metadata.wordCount} so&apos;z
            </span>
          )}
          {pkg.metadata?.readingTimeMinutes && (
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              {pkg.metadata.readingTimeMinutes} daqiqa
            </span>
          )}
          {pkg.characters?.length > 0 && (
            <span className="flex items-center gap-1.5">
              <Users size={14} />
              {pkg.characters.length} qahramon
            </span>
          )}
        </div>

        {/* Educational values */}
        {pkg.educationalValues?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {pkg.educationalValues.map((vId) => {
              const def = VALUE_MAP[vId];
              return def ? (
                <span
                  key={vId}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-white dark:bg-gray-800 border border-amber-200 dark:border-gray-700 text-amber-700 dark:text-amber-400"
                >
                  {def.emoji} {def.uzbekLabel}
                </span>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* ── Summary ── */}
      <OutputSection
        id="summary"
        title="Qisqa mazmun"
        icon="📝"
        copyText={pkg.summary}
      >
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
          {pkg.summary}
        </p>
      </OutputSection>

      {/* ── Full story ── */}
      <OutputSection
        id="story"
        title="Ertak matni"
        icon="📚"
        copyText={pkg.story}
        defaultOpen={true}
      >
        <div className="prose-story whitespace-pre-line">
          {pkg.story.split("\n\n").map((para, i) => (
            <p key={i} className="mb-4 last:mb-0">
              {para}
            </p>
          ))}
        </div>
      </OutputSection>

      {/* ── Moral lesson ── */}
      <OutputSection
        id="moral"
        title="Saboq"
        icon="🌟"
        copyText={pkg.moralLesson}
      >
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <p className="text-gray-800 dark:text-gray-200 font-semibold text-base leading-relaxed">
            ✨ {pkg.moralLesson}
          </p>
        </div>
      </OutputSection>

      {/* ── Characters ── */}
      {pkg.characters?.length > 0 && (
        <OutputSection
          id="characters"
          title="Qahramonlar"
          icon="👥"
          defaultOpen={false}
        >
          <div className="space-y-3">
            {pkg.characters.map((char) => (
              <div
                key={char.name}
                className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/60 dark:bg-gray-800/60 border border-amber-100 dark:border-gray-700"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {char.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-800 dark:text-gray-100">{char.name}</span>
                    <span className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded-full",
                      char.role === "protagonist"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : char.role === "mentor"
                        ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
                        : char.role === "antagonist"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                    )}>
                      {char.role === "protagonist" ? "Asosiy qahramon"
                        : char.role === "mentor" ? "Ustoz"
                        : char.role === "antagonist" ? "Raqib"
                        : "Yordamchi"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                    {char.visualSeed}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </OutputSection>
      )}

      {/* ── Image Prompts ── */}
      <ImagePromptsSection imagePrompts={pkg.imagePrompts} pkg={pkg} />

      {/* ── Video Scenes ── */}
      <VideoScenesSection videoScenes={pkg.videoScenes} />

      {/* ── Hashtags ── */}
      <HashtagsSection hashtags={pkg.hashtags} />

      {/* ── Parent Note ── */}
      {pkg.parentNote && (
        <OutputSection
          id="parent-note"
          title="Ota-onalar uchun izoh"
          icon="👨‍👩‍👧"
          copyText={pkg.parentNote}
          defaultOpen={false}
        >
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
              {pkg.parentNote}
            </p>
          </div>
        </OutputSection>
      )}

      {/* ── Export bar ── */}
      <ExportBar pkg={pkg} />

      {/* Scroll to top */}
      <div className="flex justify-center pt-2 pb-4">
        <button
          onClick={scrollToTop}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors font-medium"
        >
          <ChevronUp size={16} />
          Yuqoriga qaytish
        </button>
      </div>
    </div>
  );
}
