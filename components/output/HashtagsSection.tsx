"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { OutputSection } from "./OutputSection";
import type { StoryPackage } from "@/types";

interface HashtagsSectionProps {
  hashtags: StoryPackage["hashtags"];
}

function HashtagChip({ tag }: { tag: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(tag).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={handleCopy}
      title={copied ? "Nusxalandi!" : "Nusxalash"}
      className={`
        inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm font-semibold
        transition-all duration-200
        ${copied
          ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400"
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-300 hover:text-amber-600 dark:hover:border-amber-700 dark:hover:text-amber-400"
        }
      `}
    >
      {copied ? <Check size={12} /> : <Copy size={12} className="opacity-50" />}
      {tag}
    </button>
  );
}

export function HashtagsSection({ hashtags }: HashtagsSectionProps) {
  if (!hashtags) return null;

  const allTags = [...(hashtags.uzbek || []), ...(hashtags.english || [])].join(" ");

  return (
    <OutputSection
      id="hashtags"
      title="Xeshteglar"
      icon="📣"
      copyText={allTags}
    >
      <div className="space-y-4">
        {/* Uzbek hashtags */}
        {hashtags.uzbek?.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
              🇺🇿 O&apos;zbek
            </p>
            <div className="flex flex-wrap gap-2">
              {hashtags.uzbek.map((tag) => (
                <HashtagChip key={tag} tag={tag} />
              ))}
            </div>
          </div>
        )}

        {/* English hashtags */}
        {hashtags.english?.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
              🌐 English
            </p>
            <div className="flex flex-wrap gap-2">
              {hashtags.english.map((tag) => (
                <HashtagChip key={tag} tag={tag} />
              ))}
            </div>
          </div>
        )}

        {/* Copy all hint */}
        <p className="text-xs text-gray-300 dark:text-gray-600">
          💡 Har bir xeshtegni bosib nusxalash mumkin, yoki yuqoridagi &quot;Nusxalash&quot; tugmasi bilan hammasini nusxalang
        </p>
      </div>
    </OutputSection>
  );
}
