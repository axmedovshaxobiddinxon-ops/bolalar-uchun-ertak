"use client";

import { Video, Clock, Camera, Smile } from "lucide-react";
import { OutputSection } from "./OutputSection";
import { CopyButton } from "@/components/ui/CopyButton";
import type { VideoScene } from "@/types";

interface VideoScenesSectionProps {
  videoScenes: VideoScene[];
}

export function VideoScenesSection({ videoScenes }: VideoScenesSectionProps) {
  if (!videoScenes?.length) return null;

  const allScenesText = videoScenes
    .map(
      (s) =>
        `Scene ${s.scene} (${s.duration}):\nDescription: ${s.description}\nNarration: ${s.narration}\nCamera: ${s.cameraMovement}\nMood: ${s.mood}`
    )
    .join("\n\n---\n\n");

  return (
    <OutputSection
      id="video-scenes"
      title="Video sahnalar"
      icon="🎬"
      copyText={allScenesText}
      badge={`${videoScenes.length} ta sahna`}
    >
      <div className="space-y-4">
        {videoScenes.map((scene) => (
          <div
            key={scene.scene}
            className="rounded-xl border border-amber-100 dark:border-gray-700 overflow-hidden"
          >
            {/* Scene header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-amber-50/80 dark:bg-gray-800/80">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-orange-400 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {scene.scene}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  <Clock size={11} />
                  {scene.duration}
                </span>
              </div>
              <CopyButton
                text={`Scene ${scene.scene}:\nDescription: ${scene.description}\nNarration: ${scene.narration}\nCamera: ${scene.cameraMovement}\nMood: ${scene.mood}`}
                size="sm"
              />
            </div>

            {/* Scene details */}
            <div className="p-4 space-y-3">
              {/* Video placeholder — Phase 4 */}
              <div className="w-full h-16 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2">
                <Video size={16} className="text-gray-300 dark:text-gray-600" />
                <span className="text-xs text-gray-300 dark:text-gray-600 font-medium">
                  Video yaratish — Phase 4
                </span>
              </div>

              {/* English description */}
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  Description (English)
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800/60 p-3 rounded-lg font-mono border border-gray-100 dark:border-gray-700">
                  {scene.description}
                </p>
              </div>

              {/* Uzbek narration */}
              <div className="space-y-1">
                <p className="text-xs font-bold text-amber-500 uppercase tracking-wide">
                  Uzbek Narration
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30">
                  {scene.narration}
                </p>
              </div>

              {/* Camera + mood chips */}
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800">
                  <Camera size={11} />
                  {scene.cameraMovement}
                </span>
                <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 border border-rose-100 dark:border-rose-800">
                  <Smile size={11} />
                  {scene.mood}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </OutputSection>
  );
}
