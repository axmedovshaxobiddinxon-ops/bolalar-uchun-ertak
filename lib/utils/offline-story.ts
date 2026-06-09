// ============================================================
// Offline Story Builder
// Converts the OfflineEditorState into a full StoryPackage
// that can be fed into the existing PDF/DOCX/preview pipeline
// without any AI involvement.
// ============================================================

import { v4 as uuidv4 } from "uuid";
import type {
  StoryPackage,
  AgeCategory,
  StoryLength,
  EducationalValue,
  Character,
} from "@/types";

// ── Offline form state ────────────────────────────────────

export interface OfflineImageSlot {
  /** 1-based scene index matching the story sequence */
  scene: number;
  /** Human-readable scene reference (filled by user) */
  storyReference: string;
  /** base64 data URL — "data:image/...;base64,..." */
  dataUrl: string;
  /** Original file name, for display only */
  fileName: string;
  /** MIME type of the uploaded file */
  mimeType: string;
}

export interface OfflineEditorState {
  // ── Core content ────────────────────────────────────────
  title: string;
  ageCategory: AgeCategory;
  storyLength: StoryLength;
  summary: string;
  story: string;
  moralLesson: string;
  parentNote: string;

  // ── Educational metadata ─────────────────────────────────
  educationalValues: EducationalValue[];

  // ── Characters ────────────────────────────────────────────
  characters: Character[];

  // ── Uploaded images (one per scene) ──────────────────────
  imageSlots: OfflineImageSlot[];

  // ── Optional extras ─────────────────────────────────────
  topic: string;           // book topic / description
  hashtagsUzbek: string;   // space-separated string e.g. "#bolalar #ertak"
  hashtagsEnglish: string; // space-separated string

  // ── Internal ──────────────────────────────────────────────
  /** Used to keep an edit session alive across saves */
  id: string;
  lastModified: string;
}

// ── Defaults ──────────────────────────────────────────────

export const OFFLINE_DEFAULTS: OfflineEditorState = {
  id: "",
  lastModified: "",
  title: "",
  ageCategory: "7-9",
  storyLength: "medium",
  summary: "",
  story: "",
  moralLesson: "",
  parentNote: "",
  educationalValues: [],
  characters: [],
  imageSlots: [],
  topic: "",
  hashtagsUzbek: "",
  hashtagsEnglish: "",
};

// ── Validation ────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateOfflineState(state: OfflineEditorState): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!state.title.trim()) errors.push("Sarlavha kiritilmagan.");
  if (!state.story.trim() || state.story.trim().length < 50)
    errors.push("Ertak matni kamida 50 ta belgidan iborat bo'lishi kerak.");

  if (!state.summary.trim()) warnings.push("Qisqa mazmun kiritilmagan.");
  if (!state.moralLesson.trim()) warnings.push("Saboq kiritilmagan.");
  if (state.characters.length === 0) warnings.push("Hech bir qahramon qo'shilmagan.");
  if (state.imageSlots.length === 0) warnings.push("Rasm yuklanmagan — PDF rasmsiz yaratiladi.");
  if (state.educationalValues.length === 0) warnings.push("Ta'lim qiymatlari tanlanmagan.");

  return { valid: errors.length === 0, errors, warnings };
}

// ── Word count & reading time ─────────────────────────────

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function readingMinutes(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 150));
}

// ── Parse hashtag string → array ─────────────────────────

function parseHashtags(raw: string): string[] {
  return raw
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => (t.startsWith("#") ? t : `#${t}`));
}

// ── Build ImagePrompt[] from OfflineImageSlot[] ───────────

function buildImagePrompts(slots: OfflineImageSlot[]) {
  return slots.map((slot) => ({
    scene: slot.scene,
    storyReference: slot.storyReference || `Sahna ${slot.scene}`,
    prompt: `Offline uploaded image for scene ${slot.scene}`,
    style: "uploaded illustration",
    characters: [],
  }));
}

// ── Main builder ──────────────────────────────────────────

/**
 * Converts an OfflineEditorState into a StoryPackage that can be
 * passed directly into exportPdf(), exportDocx(), generateBook(),
 * and BookPreviewModal without any changes to those utilities.
 */
export function buildStoryPackage(state: OfflineEditorState): StoryPackage {
  const wordCount = countWords(state.story);

  return {
    id: state.id || uuidv4(),
    generatedAt: state.lastModified || new Date().toISOString(),
    topic: state.topic || state.title,
    title: state.title || "Nomsiz ertak",
    ageCategory: state.ageCategory,
    storyLength: state.storyLength,
    summary: state.summary,
    story: state.story,
    moralLesson: state.moralLesson,
    educationalValues: state.educationalValues,
    characters: state.characters,
    imagePrompts: buildImagePrompts(state.imageSlots),
    videoScenes: [],
    hashtags: {
      uzbek: parseHashtags(state.hashtagsUzbek),
      english: parseHashtags(state.hashtagsEnglish),
    },
    parentNote: state.parentNote,
    metadata: {
      wordCount,
      readingTimeMinutes: readingMinutes(wordCount),
      aiModel: "offline",
      promptVersion: "offline-v1",
    },
  };
}

/**
 * Builds the ImageMap (sceneIndex → dataUrl) from uploaded image slots.
 * This is the same format expected by exportPdf() and BookPreviewModal.
 */
export function buildImageMap(slots: OfflineImageSlot[]): Record<number, string> {
  return Object.fromEntries(slots.map((s) => [s.scene, s.dataUrl]));
}

// ── localStorage persistence ──────────────────────────────

const OFFLINE_DRAFT_KEY = "bolalar-offline-draft";

export function saveDraft(state: OfflineEditorState): void {
  if (typeof window === "undefined") return;
  try {
    const toSave: OfflineEditorState = {
      ...state,
      lastModified: new Date().toISOString(),
      // Don't persist large base64 images in the draft key to avoid
      // hitting the 5 MB localStorage quota. Store scene metadata only.
      imageSlots: state.imageSlots.map((s) => ({
        ...s,
        dataUrl: s.dataUrl.length > 50_000
          ? "__LARGE_IMAGE_REMOVED__"
          : s.dataUrl,
      })),
    };
    localStorage.setItem(OFFLINE_DRAFT_KEY, JSON.stringify(toSave));
  } catch {
    // Quota exceeded — fail silently
  }
}

export function loadDraft(): OfflineEditorState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(OFFLINE_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OfflineEditorState;
    // Drop slots whose dataUrl was stripped (user must re-upload images)
    return {
      ...parsed,
      imageSlots: parsed.imageSlots.filter(
        (s) => s.dataUrl && s.dataUrl !== "__LARGE_IMAGE_REMOVED__"
      ),
    };
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(OFFLINE_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

// ── File → base64 helper ──────────────────────────────────

/** Reads a File object and resolves with a base64 data URL. */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsDataURL(file);
  });
}

/** Returns true if the mime type is a supported image. */
export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

/** Max file size we accept: 8 MB */
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
