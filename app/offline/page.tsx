"use client";

import { useState } from "react";
import Link from "next/link";
import { WifiOff, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

import { OfflineEditorProvider } from "./context/OfflineEditorContext";
import { TitleEditor }        from "./components/TitleEditor";
import { AgeLengthRow }       from "./components/AgeLengthRow";
import { StoryEditor }        from "./components/StoryEditor";
import { SummaryEditor, MoralEditor, HashtagsEditor } from "./components/MetaEditors";
import { ValuesSelector }     from "./components/ValuesSelector";
import { CharactersEditor }   from "./components/CharactersEditor";
import { ImageUploader }      from "./components/ImageUploader";
import { OfflineExportBar }   from "./components/OfflineExportBar";
import { OfflinePreviewPanel } from "./components/OfflinePreviewPanel";
import { ThemeToggle }        from "@/components/ui/ThemeToggle";
import { useApp }             from "@/app/context/AppContext";

// ── Collapsible section wrapper ────────────────────────────

function Section({
  id,
  title,
  children,
  defaultOpen = true,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div id={id}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-2 text-left focus:outline-none group"
        aria-expanded={open}
      >
        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest group-hover:text-amber-500 transition-colors">
          {title}
        </h3>
        {open
          ? <ChevronUp size={14} className="text-gray-300 dark:text-gray-600" />
          : <ChevronDown size={14} className="text-gray-300 dark:text-gray-600" />
        }
      </button>
      {open && <div className="space-y-4">{children}</div>}
    </div>
  );
}

// ── Inner page — needs context ─────────────────────────────

function OfflinePageInner() {
  const { toggleTheme, state: appState } = useApp();
  void toggleTheme; // available if needed

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/40 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* ── Offline header ── */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Branding */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 dark:from-slate-600 dark:to-slate-800 flex items-center justify-center shadow-sm flex-shrink-0">
              <WifiOff size={14} className="text-white" />
            </div>
            <div className="leading-tight">
              <p className="font-display font-bold text-sm text-gray-900 dark:text-white leading-none">
                Offline Rejim
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 leading-none mt-0.5">
                AI talab qilinmaydi · Qo&apos;lda kiritish
              </p>
            </div>
          </div>

          {/* Nav */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-all"
            >
              <Sparkles size={12} />
              AI rejim
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Hero banner ── */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 dark:from-gray-900 dark:to-gray-950 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <WifiOff size={18} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Offline Rejim
                </span>
              </div>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl leading-tight mb-2">
                Qo&apos;lda Ertak Kiritish
              </h1>
              <p className="text-slate-300 text-sm leading-relaxed max-w-lg">
                OpenAI API kalit talab qilmaydi. Ertak matnini, sarlavhani, rasmlarni qo&apos;lda kiriting
                va professional bolalar kitobiga aylantiring — PDF yoki Word formatida yuklab oling.
              </p>
            </div>

            {/* Feature chips */}
            <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
              {[
                "✍️  Qo'lda kiritish",
                "🖼️  Rasm yuklash",
                "📄  PDF eksport",
                "📝  DOCX eksport",
                "📚  Kitob ko'rinishi",
              ].map((f) => (
                <span
                  key={f}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 whitespace-nowrap"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 lg:gap-8 items-start">

          {/* ── Left: editor column ── */}
          <div className="space-y-6 min-w-0">

            {/* 1 · Sarlavha va mavzu */}
            <Section id="sec-title" title="1 · Sarlavha va mavzu">
              <TitleEditor />
            </Section>

            {/* 2 · Yosh va uzunlik */}
            <Section id="sec-age" title="2 · Yosh toifasi va uzunlik">
              <AgeLengthRow />
            </Section>

            {/* 3 · Ertak matni */}
            <Section id="sec-story" title="3 · Ertak matni">
              <StoryEditor />
            </Section>

            {/* 4 · Qisqa mazmun */}
            <Section id="sec-summary" title="4 · Qisqa mazmun" defaultOpen={false}>
              <SummaryEditor />
            </Section>

            {/* 5 · Saboq */}
            <Section id="sec-moral" title="5 · Saboq va ota-onalar uchun izoh" defaultOpen={false}>
              <MoralEditor />
            </Section>

            {/* 6 · Ta'lim qiymatlari */}
            <Section id="sec-values" title="6 · Ta'lim qiymatlari" defaultOpen={false}>
              <ValuesSelector />
            </Section>

            {/* 7 · Qahramonlar */}
            <Section id="sec-characters" title="7 · Qahramonlar" defaultOpen={false}>
              <CharactersEditor />
            </Section>

            {/* 8 · Rasmlar */}
            <Section id="sec-images" title="8 · Rasmlar (ixtiyoriy)" defaultOpen={false}>
              <ImageUploader />
            </Section>

            {/* 9 · Xeshteglar */}
            <Section id="sec-hashtags" title="9 · Xeshteglar (ixtiyoriy)" defaultOpen={false}>
              <HashtagsEditor />
            </Section>

            {/* 10 · Eksport */}
            <Section id="sec-export" title="10 · Eksport">
              <OfflineExportBar />
            </Section>
          </div>

          {/* ── Right: sticky preview ── */}
          <aside className="lg:sticky lg:top-20 space-y-4">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">
              Kitob ko&apos;rinishi
            </p>
            <OfflinePreviewPanel />
          </aside>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="mt-12 border-t border-slate-200 dark:border-gray-800 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            Bolalar Uchun Ertak ·{" "}
            <Link href="/" className="text-amber-500 hover:underline">
              AI rejimga o&apos;tish
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

// ── Exported page component ────────────────────────────────

export default function OfflinePage() {
  return (
    <OfflineEditorProvider>
      <OfflinePageInner />
    </OfflineEditorProvider>
  );
}
