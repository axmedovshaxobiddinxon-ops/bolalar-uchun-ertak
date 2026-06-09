"use client";

import { BookOpen, Clock, Users, Image as ImageIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { VALUE_MAP } from "@/config/educational-values";
import type { EducationalValue } from "@/types";
import { useOfflineEditor } from "../context/OfflineEditorContext";

// ── Mini book cover preview ────────────────────────────────

function MiniCover() {
  const { state, imageMap } = useOfflineEditor();
  const firstImage = Object.values(imageMap)[0];

  return (
    <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-amber-400 to-orange-500 flex flex-col">
      {/* Cover illustration */}
      {firstImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={firstImage}
          alt="Muqova"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <BookOpen size={64} className="text-white" />
        </div>
      )}

      {/* Overlay content */}
      <div className="relative flex flex-col h-full p-4">
        <div className="flex-1" />
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur rounded-xl p-3 space-y-1">
          <p className="font-display font-extrabold text-sm text-gray-900 dark:text-white leading-tight line-clamp-2">
            {state.title || <span className="text-gray-300">Sarlavhasiz ertak</span>}
          </p>
          <p className="text-xs text-amber-600 font-semibold">
            {state.ageCategory} yosh · {state.storyLength === "short" ? "Qisqa" : state.storyLength === "medium" ? "O'rta" : "Uzun"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Completion checklist ───────────────────────────────────

interface CheckItem {
  label: string;
  done: boolean;
  warn?: boolean;
}

function CheckList({ items }: { items: CheckItem[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map(({ label, done, warn }) => (
        <li
          key={label}
          className={cn(
            "flex items-center gap-2 text-xs font-medium",
            done
              ? "text-green-600 dark:text-green-400"
              : warn
              ? "text-amber-500 dark:text-amber-400"
              : "text-gray-400 dark:text-gray-500"
          )}
        >
          <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
            style={{
              background: done ? "#22c55e22" : warn ? "#f59e0b22" : "#6b728022",
              color: done ? "#16a34a" : warn ? "#d97706" : "#9ca3af",
            }}
          >
            {done ? "✓" : warn ? "!" : "○"}
          </span>
          {label}
        </li>
      ))}
    </ul>
  );
}

// ── Main panel ─────────────────────────────────────────────

export function OfflinePreviewPanel() {
  const { state, wordCount, readingMinutes, validation, imageMap } = useOfflineEditor();

  const imageCount = Object.keys(imageMap).length;

  const checklist: CheckItem[] = [
    { label: "Sarlavha",         done: state.title.trim().length > 0 },
    { label: "Ertak matni",      done: state.story.trim().length >= 50 },
    { label: "Qisqa mazmun",     done: state.summary.trim().length > 0,     warn: true },
    { label: "Saboq",            done: state.moralLesson.trim().length > 0, warn: true },
    { label: "Yosh toifasi",     done: true },
    { label: "Ta'lim qiymatlari",done: state.educationalValues.length > 0,  warn: true },
    { label: "Qahramonlar",      done: state.characters.length > 0,         warn: true },
    { label: "Rasmlar",          done: imageCount > 0,                      warn: true },
  ];

  const completedCount = checklist.filter((c) => c.done).length;

  return (
    <div className="space-y-4">
      {/* Mini cover */}
      <MiniCover />

      {/* Stats */}
      <div className="card p-4 space-y-3">
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Statistika
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: <BookOpen size={12} />,  label: `${wordCount} so'z` },
            { icon: <Clock size={12} />,     label: `${readingMinutes} daq` },
            { icon: <Users size={12} />,     label: `${state.characters.length} qahramon` },
            { icon: <ImageIcon size={12} />, label: `${imageCount} rasm` },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 px-2.5 py-2 bg-amber-50 dark:bg-gray-800 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300"
            >
              <span className="text-amber-500">{icon}</span>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Completion */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Jarayon
          </p>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
            {completedCount}/{checklist.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-green-400 rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / checklist.length) * 100}%` }}
          />
        </div>

        <CheckList items={checklist} />
      </div>

      {/* Educational values preview */}
      {state.educationalValues.length > 0 && (
        <div className="card p-4 space-y-2">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Ta&apos;lim qiymatlari
          </p>
          <div className="flex flex-wrap gap-1.5">
            {state.educationalValues.map((vId) => {
              const def = VALUE_MAP[vId as EducationalValue];
              return def ? (
                <span
                  key={vId}
                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                >
                  {def.emoji} {def.uzbekLabel}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Errors if any */}
      {validation.errors.length > 0 && (
        <div className="card p-4 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 space-y-2">
          <p className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wide flex items-center gap-1.5">
            <AlertCircle size={11} /> Majburiy maydonlar
          </p>
          <ul className="space-y-1">
            {validation.errors.map((e, i) => (
              <li key={i} className="text-xs text-red-600 dark:text-red-400">• {e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Image thumbnails strip */}
      {Object.entries(imageMap).length > 0 && (
        <div className="card p-4 space-y-2">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Yuklangan rasmlar
          </p>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(imageMap)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([scene, url]) => (
                <div key={scene} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Sahna ${scene}`}
                    className="w-14 h-14 object-cover rounded-xl border border-amber-100 dark:border-gray-700"
                  />
                  <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-amber-400 text-white text-[9px] font-bold flex items-center justify-center shadow">
                    {scene}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
