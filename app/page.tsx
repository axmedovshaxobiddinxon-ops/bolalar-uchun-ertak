"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { GeneratorPanel } from "@/components/generator/GeneratorPanel";
import { StoryOutput } from "@/components/output/StoryOutput";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { HistoryDrawer } from "@/components/ui/HistoryDrawer";
import { useApp } from "@/app/context/AppContext";
import { saveStory } from "@/lib/utils/local-storage";
import type { GenerateRequest, GenerateResponse } from "@/types";
import { BookOpen, Sparkles, Shield, Wand2 } from "lucide-react";

const FEATURE_CARDS = [
  {
    icon: "📖",
    title: "Original ertaklar",
    desc: "Har bir ertak noyob va original. Takrorlanmas sarguzashtlar.",
  },
  {
    icon: "🛡️",
    title: "Xavfsiz kontent",
    desc: "Barcha ertaklar bolalar uchun xavfsiz. Zo'ravonlik yo'q, yomon tugash yo'q.",
  },
  {
    icon: "🎨",
    title: "Rasm tavsiflar",
    desc: "Har bir sahna uchun AI rasm yaratish uchun professional tavsiflar.",
  },
  {
    icon: "🎬",
    title: "Video sahnalar",
    desc: "Video yaratish uchun sahna tavsiflar va o'zbek tili naratsiyasi.",
  },
];

export default function HomePage() {
  const { state, dispatch } = useApp();
  const [historyOpen, setHistoryOpen] = useState(false);

  async function handleGenerate() {
    if (!state.topic.trim() || state.status === "loading") return;

    dispatch({ type: "GENERATE_START" });

    const request: GenerateRequest = {
      topic: state.topic.trim(),
      ageOverride: state.ageOverride ?? undefined,
      storyLength: state.storyLength,
      emphasizedValues:
        state.emphasizedValues.length > 0 ? state.emphasizedValues : undefined,
      language: "uz-latn",
    };

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      const data: GenerateResponse = await res.json();

      if (!res.ok || !data.success || !data.data) {
        dispatch({
          type: "GENERATE_ERROR",
          payload:
            data.error ||
            "Ertak yaratishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.",
        });
        return;
      }

      // Success
      dispatch({ type: "GENERATE_SUCCESS", payload: data.data });
      dispatch({ type: "ADD_TO_HISTORY", payload: data.data });
      saveStory(data.data);

      // Smooth scroll to output
      setTimeout(() => {
        document.getElementById("story-output")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 200);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Tarmoq xatosi. Internet aloqangizni tekshiring.";
      dispatch({ type: "GENERATE_ERROR", payload: message });
    }
  }

  const showHero = state.status === "idle" && !state.storyPackage;
  const showOutput = state.status === "success" && state.storyPackage;

  return (
    <>
      <LoadingOverlay visible={state.status === "loading"} />
      <HistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} />

      <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50 via-white to-amber-50/40 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <Header onHistoryClick={() => setHistoryOpen(true)} />

        <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* ── Hero section ─── */}
          {showHero && (
            <section className="text-center mb-10">
              {/* Floating icon */}
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-warm mx-auto animate-float">
                  <BookOpen size={36} className="text-white" />
                </div>
                <Sparkles
                  size={20}
                  className="absolute -top-1 -right-1 text-amber-400 animate-spin-slow"
                />
              </div>

              <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-gray-900 dark:text-white mb-3 leading-tight">
                Bolalar uchun{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-400">
                  sehrli ertaklar
                </span>
              </h1>

              <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
                Mavzu bering — biz to&apos;liq ertak, rasm tavsiflar, video sahnalar va
                xeshteglar yaratamiz.{" "}
                <span className="text-amber-500 font-semibold">O&apos;zbek tilida.</span>
              </p>

              {/* Feature cards */}
              <div className="grid grid-cols-2 gap-3 mb-10 text-left">
                {FEATURE_CARDS.map((card) => (
                  <div
                    key={card.title}
                    className="card p-4 hover:border-amber-300 dark:hover:border-amber-700 transition-colors duration-200"
                  >
                    <div className="text-2xl mb-2">{card.icon}</div>
                    <h3 className="font-bold text-sm text-gray-800 dark:text-gray-100 mb-1">
                      {card.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Generator panel ─── */}
          <section className="mb-8">
            <GeneratorPanel onGenerate={handleGenerate} />
          </section>

          {/* ── Output ─── */}
          {showOutput && state.storyPackage && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-amber-200 dark:bg-gray-700" />
                <span className="flex items-center gap-2 text-sm font-bold text-amber-500">
                  <Wand2 size={14} />
                  Ertak tayyor!
                </span>
                <div className="h-px flex-1 bg-amber-200 dark:bg-gray-700" />
              </div>
              <StoryOutput pkg={state.storyPackage} />
            </section>
          )}

          {/* ── Trust/safety note ─── */}
          {showHero && (
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-600">
              <Shield size={13} />
              <span>
                Barcha ertaklar bolalar xavfsizligi tekshiruvidan o&apos;tadi
              </span>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
