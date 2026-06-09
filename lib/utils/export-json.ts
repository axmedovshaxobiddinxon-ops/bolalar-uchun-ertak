// ============================================================
// JSON Export Utility
// ============================================================

import type { StoryPackage } from "@/types";

/**
 * Triggers a browser download of the StoryPackage as a formatted JSON file.
 * Filename: {sanitised-title}-{date}.json
 */
export function exportJson(pkg: StoryPackage): void {
  if (typeof window === "undefined") return;

  const sanitisedTitle = pkg.title
    .replace(/[^a-zA-Z0-9\u0400-\u04FFa-zA-Z\u00C0-\u024F\s]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 40)
    .toLowerCase();

  const date = new Date(pkg.generatedAt).toISOString().slice(0, 10);
  const filename = `${sanitisedTitle || "ertak"}-${date}.json`;

  const blob = new Blob([JSON.stringify(pkg, null, 2)], {
    type: "application/json;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
