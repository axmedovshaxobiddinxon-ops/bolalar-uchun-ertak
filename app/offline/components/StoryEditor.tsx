"use client";

import { useRef, useCallback } from "react";
import { AlignLeft, Bold, Quote, RotateCcw } from "lucide-react";
import { useOfflineEditor } from "../context/OfflineEditorContext";

// ── Toolbar actions ────────────────────────────────────────

interface ToolbarAction {
  icon: React.ReactNode;
  label: string;
  apply: (selected: string, before: string) => string;
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  {
    icon: <Bold size={13} />,
    label: "Qalin matn (Ctrl+B)",
    apply: (sel) => sel ? `**${sel}**` : "**matn**",
  },
  {
    icon: <Quote size={13} />,
    label: "Iqtibos",
    apply: (sel) => `\n> ${sel || "iqtibos matni"}\n`,
  },
  {
    icon: <AlignLeft size={13} />,
    label: "Yangi paragraf",
    apply: () => "\n\n",
  },
];

// ── Word / char count strip ────────────────────────────────

function CountStrip({ text }: { text: string }) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const chars = text.length;
  const paras = text.split(/\n{2,}/).filter((p) => p.trim()).length;
  const mins = Math.max(1, Math.ceil(words / 150));

  return (
    <div className="flex flex-wrap gap-3 text-[11px] text-gray-400 dark:text-gray-500 font-medium">
      <span>{words} so&apos;z</span>
      <span>·</span>
      <span>{chars} belgi</span>
      <span>·</span>
      <span>{paras} paragraf</span>
      <span>·</span>
      <span>~{mins} daq o&apos;qish</span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────

export function StoryEditor() {
  const { state, setStory } = useOfflineEditor();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormat = useCallback((action: ToolbarAction) => {
    const ta = textareaRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = state.story.slice(0, start);
    const selected = state.story.slice(start, end);
    const after = state.story.slice(end);

    const inserted = action.apply(selected, before);
    const newVal = before + inserted + after;
    setStory(newVal);

    // Restore cursor
    requestAnimationFrame(() => {
      ta.focus();
      const newCursor = start + inserted.length;
      ta.setSelectionRange(newCursor, newCursor);
    });
  }, [state.story, setStory]);

  // Keyboard shortcut: Ctrl+B for bold
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        applyFormat(TOOLBAR_ACTIONS[0]);
      }
    },
    [applyFormat]
  );

  const isEmpty = state.story.trim().length === 0;

  return (
    <div className="card p-5 sm:p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📚</span>
          <h2 className="font-display font-bold text-gray-800 dark:text-white text-sm">
            Ertak matni <span className="text-red-400">*</span>
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setStory("")}
          disabled={isEmpty}
          className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Tozalash"
        >
          <RotateCcw size={11} />
          Tozalash
        </button>
      </div>

      {/* Format toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 dark:bg-gray-800/80 rounded-xl border border-gray-100 dark:border-gray-700">
        {TOOLBAR_ACTIONS.map((action) => (
          <button
            key={action.label}
            type="button"
            title={action.label}
            onClick={() => applyFormat(action)}
            className="
              w-7 h-7 rounded-lg flex items-center justify-center
              text-gray-500 dark:text-gray-400
              hover:bg-white dark:hover:bg-gray-700
              hover:text-amber-600 dark:hover:text-amber-400
              transition-all duration-150
            "
          >
            {action.icon}
          </button>
        ))}
        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
        <span className="text-[10px] text-gray-400 dark:text-gray-600 px-1">
          Ctrl+B — qalin
        </span>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        id="offline-story"
        value={state.story}
        onChange={(e) => setStory(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`Ertakni yozing...

Masalan:
Bir bor, bir yo'q, Qo'shtepa qishlog'ida Olimjon degan mehnatsevar bola yashardi. Har kuni erta turgandan kech yotguncha u otasiga yordam berardi...

Paragraflar orasiga bo'sh qator qo'yish orqali bo'limlarga ajrating.`}
        rows={18}
        spellCheck={false}
        className={`
          w-full px-4 py-3 rounded-xl border-2 text-[15px] leading-relaxed resize-y
          font-sans
          bg-white dark:bg-gray-800
          text-gray-800 dark:text-gray-100
          placeholder-gray-300 dark:placeholder-gray-600
          transition-colors duration-150
          focus:outline-none
          min-h-[320px]
          ${!isEmpty
            ? "border-amber-300 dark:border-amber-700"
            : "border-gray-200 dark:border-gray-700 focus:border-amber-300 dark:focus:border-amber-700"
          }
        `}
      />

      {/* Stats */}
      <CountStrip text={state.story} />

      {/* Hint */}
      {isEmpty && (
        <p className="text-xs text-red-400 font-medium flex items-center gap-1.5">
          <span>⚠</span> Ertak matni kiritilishi shart
        </p>
      )}
    </div>
  );
}
