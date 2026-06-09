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
