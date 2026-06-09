"use client";

import { BookOpen } from "lucide-react";
import { useOfflineEditor } from "../context/OfflineEditorContext";

export function TitleEditor() {
  const { state, setTitle, setTopic } = useOfflineEditor();

  return (
    <div className="card p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <BookOpen size={14} className="text-amber-600 dark:text-amber-400" />
        </div>
        <h2 className="font-display font-bold text-gray-800 dark:text-white text-sm">
          Sarlavha va mavzu
        </h2>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <label
          htmlFor="offline-title"
          className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
        >
          Kitob sarlavhasi <span className="text-red-400">*</span>
        </label>
        <input
          id="offline-title"
          type="text"
          value={state.title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Masalan: Mehnatsevar Olimjon va sehrli bog'"
          maxLength={120}
          className={`
            w-full px-4 py-2.5 rounded-xl border-2 text-base font-semibold
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-white
            placeholder-gray-400 dark:placeholder-gray-500
            transition-colors duration-150
            focus:outline-none
            ${state.title.trim()
              ? "border-amber-300 dark:border-amber-600 focus:border-amber-400"
              : "border-gray-200 dark:border-gray-700 focus:border-amber-300 dark:focus:border-amber-700"
            }
          `}
        />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-400 dark:text-gray-600">
            Kitobning asosiy sarlavhasi
          </span>
          <span className={`text-[10px] font-semibold ${state.title.length > 100 ? "text-red-400" : "text-gray-300 dark:text-gray-600"}`}>
            {state.title.length}/120
          </span>
        </div>
      </div>

      {/* Topic / description */}
      <div className="space-y-1.5">
        <label
          htmlFor="offline-topic"
          className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
        >
          Mavzu / tavsif
          <span className="text-gray-400 dark:text-gray-600 font-normal ml-1">(ixtiyoriy)</span>
        </label>
        <input
          id="offline-topic"
          type="text"
          value={state.topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Masalan: Do'stlik va mehnat haqida ertak"
          maxLength={200}
          className="
            w-full px-4 py-2.5 rounded-xl border-2 text-sm
            bg-white dark:bg-gray-800
            border-gray-200 dark:border-gray-700
            text-gray-700 dark:text-gray-200
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:border-amber-300 dark:focus:border-amber-700
            transition-colors duration-150
          "
        />
      </div>
    </div>
  );
}
