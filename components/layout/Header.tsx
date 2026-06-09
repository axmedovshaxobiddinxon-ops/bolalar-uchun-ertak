"use client";

import { BookOpen, History } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useApp } from "@/app/context/AppContext";
import { cn } from "@/lib/utils/cn";

interface HeaderProps {
  onHistoryClick: () => void;
}

export function Header({ onHistoryClick }: HeaderProps) {
  const { state } = useApp();
  const historyCount = state.history.length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-amber-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo + Name */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-warm">
            <BookOpen size={18} className="text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display font-bold text-base text-gray-900 dark:text-white leading-none">
              Bolalar Uchun Ertak
            </span>
            <span className="text-xs text-amber-500 font-medium leading-none mt-0.5">
              AI Ertak Yaratuvchi
            </span>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* History button */}
          <button
            onClick={onHistoryClick}
            aria-label="Tarix"
            title="Saqlangan ertaklar"
            className={cn(
              "relative w-10 h-10 rounded-xl flex items-center justify-center",
              "transition-all duration-200",
              "bg-amber-100 hover:bg-amber-200 dark:bg-gray-800 dark:hover:bg-gray-700",
              "text-amber-600 dark:text-amber-400",
              "focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
            )}
          >
            <History size={18} />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {historyCount > 9 ? "9+" : historyCount}
              </span>
            )}
          </button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
