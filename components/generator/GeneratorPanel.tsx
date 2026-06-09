"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { TopicInput } from "./TopicInput";
import { AgeSelector } from "./AgeSelector";
import { StoryLengthSelector } from "./StoryLengthSelector";
import { ValuesPicker } from "./ValuesPicker";
import { GenerateButton } from "./GenerateButton";
import { useApp } from "@/app/context/AppContext";

interface GeneratorPanelProps {
  onGenerate: () => void;
}

export function GeneratorPanel({ onGenerate }: GeneratorPanelProps) {
  const { state, clearOutput } = useApp();
  const isLoading = state.status === "loading";
  const hasError = state.status === "error";
  const hasResult = state.status === "success";

  const canGenerate = state.topic.trim().length >= 2 && !isLoading;

  return (
    <section className="card p-6 sm:p-8 space-y-6">
      {/* Error banner */}
      {hasError && state.errorMessage && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">Xatolik</p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">{state.errorMessage}</p>
          </div>
          <button
            onClick={clearOutput}
            className="text-red-400 hover:text-red-600 transition-colors"
            aria-label="Xatolikni yopish"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      )}

      <TopicInput disabled={isLoading} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <AgeSelector disabled={isLoading} />
        <StoryLengthSelector disabled={isLoading} />
      </div>

      <ValuesPicker disabled={isLoading} />

      <GenerateButton
        onClick={onGenerate}
        loading={isLoading}
        disabled={!canGenerate}
      />

      {hasResult && (
        <p className="text-center text-xs text-gray-400 dark:text-gray-600">
          Yangi ertak yaratish uchun yuqoridagi maydonni o&apos;zgartiring
        </p>
      )}
    </section>
  );
}
