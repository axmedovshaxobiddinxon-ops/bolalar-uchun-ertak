"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { v4 as uuidv4 } from "uuid";
import type { AgeCategory, StoryLength, EducationalValue, Character } from "@/types";
import {
  type OfflineEditorState,
  type OfflineImageSlot,
  OFFLINE_DEFAULTS,
  saveDraft,
  loadDraft,
  clearDraft,
  buildStoryPackage,
  buildImageMap,
  validateOfflineState,
  type ValidationResult,
} from "@/lib/utils/offline-story";

// ── Action types ──────────────────────────────────────────

type OfflineAction =
  | { type: "SET_TITLE"; payload: string }
  | { type: "SET_AGE"; payload: AgeCategory }
  | { type: "SET_LENGTH"; payload: StoryLength }
  | { type: "SET_SUMMARY"; payload: string }
  | { type: "SET_STORY"; payload: string }
  | { type: "SET_MORAL"; payload: string }
  | { type: "SET_PARENT_NOTE"; payload: string }
  | { type: "SET_TOPIC"; payload: string }
  | { type: "SET_HASHTAGS_UZ"; payload: string }
  | { type: "SET_HASHTAGS_EN"; payload: string }
  | { type: "TOGGLE_VALUE"; payload: EducationalValue }
  | { type: "ADD_CHARACTER"; payload: Character }
  | { type: "UPDATE_CHARACTER"; payload: { index: number; character: Character } }
  | { type: "REMOVE_CHARACTER"; payload: number }
  | { type: "ADD_IMAGE"; payload: OfflineImageSlot }
  | { type: "UPDATE_IMAGE_REF"; payload: { scene: number; storyReference: string } }
  | { type: "REMOVE_IMAGE"; payload: number /* scene index */ }
  | { type: "REORDER_IMAGE"; payload: { oldScene: number; newScene: number } }
  | { type: "LOAD_DRAFT"; payload: OfflineEditorState }
  | { type: "RESET" };

// ── Reducer ───────────────────────────────────────────────

function offlineReducer(
  state: OfflineEditorState,
  action: OfflineAction
): OfflineEditorState {
  const bump = { lastModified: new Date().toISOString() };

  switch (action.type) {
    case "SET_TITLE":        return { ...state, ...bump, title: action.payload };
    case "SET_AGE":          return { ...state, ...bump, ageCategory: action.payload };
    case "SET_LENGTH":       return { ...state, ...bump, storyLength: action.payload };
    case "SET_SUMMARY":      return { ...state, ...bump, summary: action.payload };
    case "SET_STORY":        return { ...state, ...bump, story: action.payload };
    case "SET_MORAL":        return { ...state, ...bump, moralLesson: action.payload };
    case "SET_PARENT_NOTE":  return { ...state, ...bump, parentNote: action.payload };
    case "SET_TOPIC":        return { ...state, ...bump, topic: action.payload };
    case "SET_HASHTAGS_UZ":  return { ...state, ...bump, hashtagsUzbek: action.payload };
    case "SET_HASHTAGS_EN":  return { ...state, ...bump, hashtagsEnglish: action.payload };

    case "TOGGLE_VALUE": {
      const exists = state.educationalValues.includes(action.payload);
      return {
        ...state, ...bump,
        educationalValues: exists
          ? state.educationalValues.filter((v) => v !== action.payload)
          : [...state.educationalValues, action.payload],
      };
    }

    case "ADD_CHARACTER":
      return { ...state, ...bump, characters: [...state.characters, action.payload] };

    case "UPDATE_CHARACTER": {
      const updated = [...state.characters];
      updated[action.payload.index] = action.payload.character;
      return { ...state, ...bump, characters: updated };
    }

    case "REMOVE_CHARACTER":
      return {
        ...state, ...bump,
        characters: state.characters.filter((_, i) => i !== action.payload),
      };

    case "ADD_IMAGE": {
      // Renumber all scenes 1..N after adding
      const withNew = [...state.imageSlots, action.payload]
        .sort((a, b) => a.scene - b.scene)
        .map((s, i) => ({ ...s, scene: i + 1 }));
      return { ...state, ...bump, imageSlots: withNew };
    }

    case "UPDATE_IMAGE_REF":
      return {
        ...state, ...bump,
        imageSlots: state.imageSlots.map((s) =>
          s.scene === action.payload.scene
            ? { ...s, storyReference: action.payload.storyReference }
            : s
        ),
      };

    case "REMOVE_IMAGE": {
      const filtered = state.imageSlots
        .filter((s) => s.scene !== action.payload)
        .map((s, i) => ({ ...s, scene: i + 1 }));
      return { ...state, ...bump, imageSlots: filtered };
    }

    case "REORDER_IMAGE": {
      const { oldScene, newScene } = action.payload;
      if (oldScene === newScene) return state;
      const slots = [...state.imageSlots];
      const fromIdx = slots.findIndex((s) => s.scene === oldScene);
      const [moved] = slots.splice(fromIdx, 1);
      const toIdx = newScene - 1;
      slots.splice(toIdx, 0, moved);
      const renumbered = slots.map((s, i) => ({ ...s, scene: i + 1 }));
      return { ...state, ...bump, imageSlots: renumbered };
    }

    case "LOAD_DRAFT":
      return { ...action.payload, lastModified: action.payload.lastModified || new Date().toISOString() };

    case "RESET":
      return { ...OFFLINE_DEFAULTS, id: uuidv4(), lastModified: new Date().toISOString() };

    default:
      return state;
  }
}

// ── Context value ─────────────────────────────────────────

interface OfflineEditorContextValue {
  state: OfflineEditorState;
  dispatch: React.Dispatch<OfflineAction>;
  // Derived helpers
  wordCount: number;
  readingMinutes: number;
  validation: ValidationResult;
  storyPackage: ReturnType<typeof buildStoryPackage>;
  imageMap: Record<number, string>;
  // Convenience setters
  setTitle: (v: string) => void;
  setAge: (v: AgeCategory) => void;
  setLength: (v: StoryLength) => void;
  setSummary: (v: string) => void;
  setStory: (v: string) => void;
  setMoral: (v: string) => void;
  setParentNote: (v: string) => void;
  setTopic: (v: string) => void;
  setHashtagsUz: (v: string) => void;
  setHashtagsEn: (v: string) => void;
  toggleValue: (v: EducationalValue) => void;
  addCharacter: (c: Character) => void;
  updateCharacter: (index: number, c: Character) => void;
  removeCharacter: (index: number) => void;
  addImage: (slot: OfflineImageSlot) => void;
  updateImageRef: (scene: number, ref: string) => void;
  removeImage: (scene: number) => void;
  reorderImage: (oldScene: number, newScene: number) => void;
  resetEditor: () => void;
  hasDraft: boolean;
}

const OfflineEditorContext = createContext<OfflineEditorContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────

export function OfflineEditorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(offlineReducer, {
    ...OFFLINE_DEFAULTS,
    id: uuidv4(),
    lastModified: new Date().toISOString(),
  });

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) dispatch({ type: "LOAD_DRAFT", payload: draft });
  }, []);

  // Auto-save draft 1 s after last change (debounced)
  useEffect(() => {
    const t = setTimeout(() => saveDraft(state), 1000);
    return () => clearTimeout(t);
  }, [state]);

  // Derived values
  const wordCount = useMemo(
    () => state.story.trim().split(/\s+/).filter(Boolean).length,
    [state.story]
  );
  const readingMinutes = useMemo(() => Math.max(1, Math.ceil(wordCount / 150)), [wordCount]);
  const validation = useMemo(() => validateOfflineState(state), [state]);
  const storyPackage = useMemo(() => buildStoryPackage(state), [state]);
  const imageMap = useMemo(() => buildImageMap(state.imageSlots), [state.imageSlots]);

  const hasDraft = useMemo(
    () => state.title.trim().length > 0 || state.story.trim().length > 0,
    [state.title, state.story]
  );

  // Convenience setters
  const setTitle      = useCallback((v: string) => dispatch({ type: "SET_TITLE", payload: v }), []);
  const setAge        = useCallback((v: AgeCategory) => dispatch({ type: "SET_AGE", payload: v }), []);
  const setLength     = useCallback((v: StoryLength) => dispatch({ type: "SET_LENGTH", payload: v }), []);
  const setSummary    = useCallback((v: string) => dispatch({ type: "SET_SUMMARY", payload: v }), []);
  const setStory      = useCallback((v: string) => dispatch({ type: "SET_STORY", payload: v }), []);
  const setMoral      = useCallback((v: string) => dispatch({ type: "SET_MORAL", payload: v }), []);
  const setParentNote = useCallback((v: string) => dispatch({ type: "SET_PARENT_NOTE", payload: v }), []);
  const setTopic      = useCallback((v: string) => dispatch({ type: "SET_TOPIC", payload: v }), []);
  const setHashtagsUz = useCallback((v: string) => dispatch({ type: "SET_HASHTAGS_UZ", payload: v }), []);
  const setHashtagsEn = useCallback((v: string) => dispatch({ type: "SET_HASHTAGS_EN", payload: v }), []);
  const toggleValue   = useCallback((v: EducationalValue) => dispatch({ type: "TOGGLE_VALUE", payload: v }), []);
  const addCharacter  = useCallback((c: Character) => dispatch({ type: "ADD_CHARACTER", payload: c }), []);
  const updateCharacter = useCallback((index: number, c: Character) => dispatch({ type: "UPDATE_CHARACTER", payload: { index, character: c } }), []);
  const removeCharacter = useCallback((index: number) => dispatch({ type: "REMOVE_CHARACTER", payload: index }), []);
  const addImage      = useCallback((s: OfflineImageSlot) => dispatch({ type: "ADD_IMAGE", payload: s }), []);
  const updateImageRef = useCallback((scene: number, ref: string) => dispatch({ type: "UPDATE_IMAGE_REF", payload: { scene, storyReference: ref } }), []);
  const removeImage   = useCallback((scene: number) => dispatch({ type: "REMOVE_IMAGE", payload: scene }), []);
  const reorderImage  = useCallback((o: number, n: number) => dispatch({ type: "REORDER_IMAGE", payload: { oldScene: o, newScene: n } }), []);
  const resetEditor   = useCallback(() => { clearDraft(); dispatch({ type: "RESET" }); }, []);

  return (
    <OfflineEditorContext.Provider
      value={{
        state, dispatch,
        wordCount, readingMinutes, validation, storyPackage, imageMap,
        setTitle, setAge, setLength, setSummary, setStory, setMoral,
        setParentNote, setTopic, setHashtagsUz, setHashtagsEn,
        toggleValue, addCharacter, updateCharacter, removeCharacter,
        addImage, updateImageRef, removeImage, reorderImage,
        resetEditor, hasDraft,
      }}
    >
      {children}
    </OfflineEditorContext.Provider>
  );
}

export function useOfflineEditor(): OfflineEditorContextValue {
  const ctx = useContext(OfflineEditorContext);
  if (!ctx) throw new Error("useOfflineEditor must be used within OfflineEditorProvider");
  return ctx;
}
