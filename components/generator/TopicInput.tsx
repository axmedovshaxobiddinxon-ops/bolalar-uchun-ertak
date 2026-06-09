"use client";

import { Lightbulb } from "lucide-react";
import { useApp } from "@/app/context/AppContext";
import { cn } from "@/lib/utils/cn";

const MAX_LENGTH = 500;

const EXAMPLE_TOPICS = [
  "Rostgo'y bola va sehrli qalam",
  "Mehnatsevar chumoli va dangasa kapalak",
  "Kitob o'qishni sevgan qiz",
  "Do'stlik tufayli baxtli bo'lgan bolalar",
  "Ota-onasiga yordam bergan yigitcha",
];

interface TopicInputProps {
  disabled?: boolean;
}

export function TopicInput({ disabled = false }: TopicInputProps) {
  const { state, setTopic } = useApp();
  const remaining = MAX_LENGTH - state.topic.length;
  const isNearLimit = remaining < 100;

  return (
    <div className="space-y-3">
      <label
        htmlFor="topic-input"
        className="block font-bold text-gray-700 dark:text-gray-200 text-sm"
      >
        📝 Mavzu yoki g&apos;oya
      </label>

      <div className="relative">
        <textarea
          id="topic-input"
          value={state.topic}
          onChange={(e) => setTopic(e.target.value)}
          maxLength={MAX_LENGTH}
          disabled={disabled}
          rows={3}
          placeholder="Mavzu yoki g'oya kiriting... (masalan: Yaxshilik qilgan bola, Mehnatsevar dehqon bolasi)"
          className={cn(
            "w-full rounded-2xl border-2 px-4 py-3 text-base resize-none",
            "bg-white dark:bg-gray-800",
            "text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500",
            "transition-all duration-200",
            "focus:outline-none focus:ring-0",
            state.topic.length > 0
              ? "border-amber-300 dark:border-amber-600 focus:border-amber-400 dark:focus:border-amber-500"
              : "border-gray-200 dark:border-gray-700 focus:border-amber-300 dark:focus:border-amber-700",
            disabled && "opacity-60 cursor-not-allowed"
          )}
          aria-describedby="topic-counter topic-examples"
        />

        {/* Character counter */}
        <div
          id="topic-counter"
          className={cn(
            "absolute bottom-3 right-3 text-xs font-semibold",
            isNearLimit ? "text-red-400" : "text-gray-300 dark:text-gray-600"
          )}
        >
          {remaining}
        </div>
      </div>

      {/* Example topics */}
      <div id="topic-examples" className="flex flex-wrap gap-2">
        <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 font-medium">
          <Lightbulb size={12} />
          Misol:
        </span>
        {EXAMPLE_TOPICS.slice(0, 3).map((example) => (
          <button
            key={example}
            onClick={() => setTopic(example)}
            disabled={disabled}
            className={cn(
              "text-xs px-3 py-1 rounded-full border transition-all duration-150",
              "bg-amber-50 dark:bg-gray-800 border-amber-200 dark:border-gray-700",
              "text-amber-700 dark:text-amber-400 font-medium",
              "hover:bg-amber-100 dark:hover:bg-gray-700 hover:border-amber-300",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
