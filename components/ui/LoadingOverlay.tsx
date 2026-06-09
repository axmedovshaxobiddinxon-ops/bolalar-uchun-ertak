"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const LOADING_MESSAGES = [
  "Ertak yozilmoqda... ✍️",
  "Qahramonlar tanlanmoqda... 🦸",
  "Saboq tayyorlanmoqda... 🌟",
  "Rasmlar uchun tavsiflar yaratilmoqda... 🎨",
  "Video sahnalar tasvirlanmoqda... 🎬",
  "Xeshteglar tayyorlanmoqda... 📣",
  "Ota-onalar uchun izoh yozilmoqda... 👨‍👩‍👧",
  "Deyarli tayyor... ✨",
];

interface LoadingOverlayProps {
  visible: boolean;
}

export function LoadingOverlay({ visible }: LoadingOverlayProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    if (!visible) {
      setMessageIndex(0);
      return;
    }

    const msgInterval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 3000);

    const dotInterval = setInterval(() => {
      setDotCount((d) => (d % 3) + 1);
    }, 500);

    return () => {
      clearInterval(msgInterval);
      clearInterval(dotInterval);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-10 max-w-sm w-full mx-4 text-center border border-amber-100 dark:border-gray-800">
        {/* Animated icon */}
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full bg-amber-100 dark:bg-amber-900/30 animate-ping opacity-40" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-warm">
            <Sparkles size={32} className="text-white animate-pulse" />
          </div>
        </div>

        {/* Message */}
        <h3 className="font-display font-bold text-xl text-gray-800 dark:text-white mb-2">
          Ertak yaratilmoqda
        </h3>
        <p className="text-amber-600 dark:text-amber-400 font-semibold text-sm min-h-[24px] transition-all duration-500">
          {LOADING_MESSAGES[messageIndex]}
        </p>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                n <= dotCount
                  ? "bg-amber-400 scale-110"
                  : "bg-amber-200 dark:bg-gray-700"
              }`}
            />
          ))}
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-600 mt-4">
          Bu 20–30 soniya davom etishi mumkin
        </p>
      </div>
    </div>
  );
}
