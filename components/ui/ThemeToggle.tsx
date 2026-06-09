"use client";

import { Sun, Moon } from "lucide-react";
import { useApp } from "@/app/context/AppContext";
import { cn } from "@/lib/utils/cn";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { state, toggleTheme } = useApp();
  const isDark = state.theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Kunduzgi rejimga o'tish" : "Tungi rejimga o'tish"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={cn(
        "relative w-10 h-10 rounded-xl flex items-center justify-center",
        "transition-all duration-200",
        "bg-amber-100 hover:bg-amber-200 dark:bg-gray-800 dark:hover:bg-gray-700",
        "text-amber-600 dark:text-yellow-400",
        "focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2",
        className
      )}
    >
      {isDark ? (
        <Sun size={18} className="transition-transform duration-300 rotate-0" />
      ) : (
        <Moon size={18} className="transition-transform duration-300 rotate-0" />
      )}
    </button>
  );
}
