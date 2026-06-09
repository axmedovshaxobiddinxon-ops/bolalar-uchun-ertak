"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn } from "@/lib/utils/cn";

interface OutputSectionProps {
  id: string;
  title: string;
  icon: string;
  copyText?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

export function OutputSection({
  id,
  title,
  icon,
  copyText,
  defaultOpen = true,
  children,
  badge,
  badgeColor = "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
}: OutputSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      id={id}
      className="card overflow-hidden"
    >
      {/* Section header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center justify-between px-5 py-4",
          "hover:bg-amber-50/60 dark:hover:bg-gray-800/60 transition-colors duration-150",
          "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-300"
        )}
        aria-expanded={open}
        aria-controls={`${id}-content`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <span className="font-display font-bold text-gray-800 dark:text-gray-100 text-base">
            {title}
          </span>
          {badge && (
            <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full", badgeColor)}>
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {copyText && open && (
            <div onClick={(e) => e.stopPropagation()}>
              <CopyButton text={copyText} />
            </div>
          )}
          {open ? (
            <ChevronUp size={18} className="text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />
          )}
        </div>
      </button>

      {/* Section content */}
      <div
        id={`${id}-content`}
        className={cn(
          "transition-all duration-300 ease-in-out",
          open ? "max-h-[none] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        )}
      >
        <div className="px-5 pb-5 border-t border-amber-50 dark:border-gray-800">
          <div className="pt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
