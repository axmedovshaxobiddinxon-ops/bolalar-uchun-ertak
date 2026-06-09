// ============================================================
// localStorage Utilities for Story History
// ============================================================

import type { StoryPackage } from "@/types";

const HISTORY_KEY = "bolalar-ertak-history";
const MAX_HISTORY = 20;

/** Save a story to the front of the history list (max 20 entries) */
export function saveStory(pkg: StoryPackage): void {
  if (typeof window === "undefined") return;
  try {
    const existing = loadHistory();
    // Remove duplicate if same id exists
    const filtered = existing.filter((s) => s.id !== pkg.id);
    const updated = [pkg, ...filtered].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // localStorage may be unavailable (private mode, storage full)
    console.warn("Could not save story to localStorage");
  }
}

/** Load all stories from history */
export function loadHistory(): StoryPackage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Delete a single story from history by id */
export function deleteStory(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = loadHistory();
    const updated = existing.filter((s) => s.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    console.warn("Could not delete story from localStorage");
  }
}

/** Clear all story history */
export function clearHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    console.warn("Could not clear localStorage");
  }
}

/** Persist theme preference */
export function saveTheme(theme: "light" | "dark"): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("bolalar-ertak-theme", theme);
  } catch {
    /* ignore */
  }
}

/** Load theme preference */
export function loadTheme(): "light" | "dark" | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem("bolalar-ertak-theme");
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

// ── Search ────────────────────────────────────────────────

/**
 * Searches story history by query string.
 * Matches against: title, topic, summary, moralLesson, educationalValues.
 * Returns stories sorted by relevance (title match first, then others).
 */
export function searchHistory(query: string): StoryPackage[] {
  const all = loadHistory();
  if (!query || query.trim().length === 0) return all;

  const q = query.trim().toLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);

  function score(pkg: StoryPackage): number {
    let s = 0;
    const titleLower = pkg.title?.toLowerCase() ?? "";
    const topicLower = pkg.topic?.toLowerCase() ?? "";
    const summaryLower = pkg.summary?.toLowerCase() ?? "";
    const moralLower = pkg.moralLesson?.toLowerCase() ?? "";
    const valuesStr = (pkg.educationalValues ?? []).join(" ").toLowerCase();
    const ageLower = pkg.ageCategory?.toLowerCase() ?? "";

    for (const term of terms) {
      if (titleLower.includes(term)) s += 10;
      if (topicLower.includes(term)) s += 8;
      if (ageLower.includes(term)) s += 6;
      if (valuesStr.includes(term)) s += 5;
      if (summaryLower.includes(term)) s += 3;
      if (moralLower.includes(term)) s += 2;
    }
    return s;
  }

  return all
    .map((pkg) => ({ pkg, score: score(pkg) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ pkg }) => pkg);
}

/**
 * Returns unique age categories present in history.
 */
export function getHistoryAgeFilters(): string[] {
  const all = loadHistory();
  const cats = new Set(all.map((s) => s.ageCategory));
  return Array.from(cats).sort();
}

/**
 * Filters history by age category.  Pass null to get all.
 */
export function filterHistoryByAge(age: string | null): StoryPackage[] {
  const all = loadHistory();
  if (!age) return all;
  return all.filter((s) => s.ageCategory === age);
}
