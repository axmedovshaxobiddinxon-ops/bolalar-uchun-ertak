"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
} from "react";
import type {
  AppState,
  AppAction,
  AgeCategory,
  EducationalValue,
  StoryPackage,
  StoryLength,
  ImageGenerationState,
  ImageResult,
} from "@/types";
import { INITIAL_IMAGE_STATE } from "@/types";
import { loadHistory, saveTheme, loadTheme } from "@/lib/utils/local-storage";
import type { GenerateImagesEvent } from "@/app/api/generate-images/route";

// ── Initial state ─────────────────────────────────────────

const initialState: AppState = {
  topic: "",
  ageOverride: null,
  storyLength: "medium",
  emphasizedValues: [],
  status: "idle",
  errorMessage: null,
  storyPackage: null,
  imageState: INITIAL_IMAGE_STATE,
  history: [],
  theme: "light",
  activeSection: null,
};

// ── Reducer ───────────────────────────────────────────────

function imageReducer(
  imageState: ImageGenerationState,
  action: AppAction
): ImageGenerationState {
  switch (action.type) {
    case "IMAGES_START": {
      const { total } = action.payload;
      // Build idle scene-status map
      return {
        ...INITIAL_IMAGE_STATE,
        status: "generating",
        total,
        sceneStatus: {},
        sceneErrors: {},
        images: {},
        completed: 0,
      };
    }

    case "IMAGE_SCENE_GENERATING": {
      const { sceneIndex } = action.payload;
      return {
        ...imageState,
        sceneStatus: { ...imageState.sceneStatus, [sceneIndex]: "generating" },
      };
    }

    case "IMAGE_SCENE_DONE": {
      const { sceneIndex, result } = action.payload;
      const newImages = { ...imageState.images, [sceneIndex]: result };
      const newSceneStatus = { ...imageState.sceneStatus, [sceneIndex]: "done" as const };
      const completed = imageState.completed + 1;
      const allFinished = completed >= imageState.total;
      const anyError = Object.values(newSceneStatus).some((s) => s === "error");
      const status = allFinished
        ? anyError
          ? "partial"
          : "done"
        : "generating";
      return {
        ...imageState,
        images: newImages,
        sceneStatus: newSceneStatus,
        completed,
        status,
      };
    }

    case "IMAGE_SCENE_ERROR": {
      const { sceneIndex, error } = action.payload;
      const newSceneStatus = { ...imageState.sceneStatus, [sceneIndex]: "error" as const };
      const newSceneErrors = { ...imageState.sceneErrors, [sceneIndex]: error };
      const completed = imageState.completed + 1;
      const allFinished = completed >= imageState.total;
      const allDoneOrError = Object.values(newSceneStatus).every(
        (s) => s === "done" || s === "error"
      );
      const anyDone = Object.values(newSceneStatus).some((s) => s === "done");
      const status = allFinished || allDoneOrError
        ? anyDone
          ? "partial"
          : "error"
        : "generating";
      return {
        ...imageState,
        sceneStatus: newSceneStatus,
        sceneErrors: newSceneErrors,
        completed,
        status,
      };
    }

    case "IMAGES_RESET":
      return INITIAL_IMAGE_STATE;

    default:
      return imageState;
  }
}

function appReducer(state: AppState, action: AppAction): AppState {
  // Delegate image actions to sub-reducer
  if (
    action.type === "IMAGES_START" ||
    action.type === "IMAGE_SCENE_GENERATING" ||
    action.type === "IMAGE_SCENE_DONE" ||
    action.type === "IMAGE_SCENE_ERROR" ||
    action.type === "IMAGES_RESET"
  ) {
    return { ...state, imageState: imageReducer(state.imageState, action) };
  }

  switch (action.type) {
    case "SET_TOPIC":
      return { ...state, topic: action.payload };

    case "SET_AGE":
      return { ...state, ageOverride: action.payload };

    case "SET_STORY_LENGTH":
      return { ...state, storyLength: action.payload };

    case "SET_VALUES":
      return { ...state, emphasizedValues: action.payload };

    case "TOGGLE_VALUE": {
      const current = state.emphasizedValues;
      const exists = current.includes(action.payload);
      return {
        ...state,
        emphasizedValues: exists
          ? current.filter((v) => v !== action.payload)
          : [...current, action.payload],
      };
    }

    case "GENERATE_START":
      return {
        ...state,
        status: "loading",
        errorMessage: null,
        storyPackage: null,
        imageState: INITIAL_IMAGE_STATE,
      };

    case "GENERATE_SUCCESS":
      return {
        ...state,
        status: "success",
        storyPackage: action.payload,
        errorMessage: null,
        imageState: INITIAL_IMAGE_STATE,
      };

    case "GENERATE_ERROR":
      return {
        ...state,
        status: "error",
        errorMessage: action.payload,
        storyPackage: null,
        imageState: INITIAL_IMAGE_STATE,
      };

    case "ADD_TO_HISTORY":
      return {
        ...state,
        history: [
          action.payload,
          ...state.history.filter((s) => s.id !== action.payload.id),
        ].slice(0, 20),
      };

    case "LOAD_HISTORY":
      return { ...state, history: action.payload };

    case "CLEAR_OUTPUT":
      return {
        ...state,
        status: "idle",
        storyPackage: null,
        errorMessage: null,
        imageState: INITIAL_IMAGE_STATE,
      };

    case "SET_THEME":
      return { ...state, theme: action.payload };

    case "SET_ACTIVE_SECTION":
      return { ...state, activeSection: action.payload };

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Convenience actions
  setTopic: (topic: string) => void;
  setAge: (age: AgeCategory | null) => void;
  setStoryLength: (length: StoryLength) => void;
  toggleValue: (value: EducationalValue) => void;
  clearOutput: () => void;
  loadStory: (pkg: StoryPackage) => void;
  toggleTheme: () => void;
  // Phase 3
  generateImages: (pkg: StoryPackage, sceneIndices?: number[]) => Promise<void>;
  cancelImageGeneration: () => void;
  imageGenerating: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Abort controller ref for cancelling image generation
  const imageAbortRef = useRef<AbortController | null>(null);

  // Load history and theme from localStorage on mount
  useEffect(() => {
    const history = loadHistory();
    if (history.length > 0) {
      dispatch({ type: "LOAD_HISTORY", payload: history });
    }
    const savedTheme = loadTheme();
    if (savedTheme) {
      dispatch({ type: "SET_THEME", payload: savedTheme });
    } else if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      dispatch({ type: "SET_THEME", payload: "dark" });
    }
  }, []);

  // Sync theme class to <html>
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (state.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [state.theme]);

  // ── Convenience actions ────────────────────────────────
  const setTopic = useCallback(
    (topic: string) => dispatch({ type: "SET_TOPIC", payload: topic }),
    []
  );
  const setAge = useCallback(
    (age: AgeCategory | null) => dispatch({ type: "SET_AGE", payload: age }),
    []
  );
  const setStoryLength = useCallback(
    (length: StoryLength) => dispatch({ type: "SET_STORY_LENGTH", payload: length }),
    []
  );
  const toggleValue = useCallback(
    (value: EducationalValue) => dispatch({ type: "TOGGLE_VALUE", payload: value }),
    []
  );
  const clearOutput = useCallback(() => dispatch({ type: "CLEAR_OUTPUT" }), []);
  const loadStory = useCallback(
    (pkg: StoryPackage) => dispatch({ type: "GENERATE_SUCCESS", payload: pkg }),
    []
  );
  const toggleTheme = useCallback(() => {
    const next = state.theme === "light" ? "dark" : "light";
    dispatch({ type: "SET_THEME", payload: next });
    saveTheme(next);
  }, [state.theme]);

  // ── Phase 3: image generation ──────────────────────────

  const cancelImageGeneration = useCallback(() => {
    imageAbortRef.current?.abort();
    imageAbortRef.current = null;
    dispatch({ type: "IMAGES_RESET" });
  }, []);

  /**
   * Streams image generation for all (or selected) scenes.
   * Updates imageState progressively as each scene completes.
   */
  const generateImages = useCallback(
    async (pkg: StoryPackage, sceneIndices?: number[]) => {
      // Cancel any in-flight generation
      imageAbortRef.current?.abort();
      const abort = new AbortController();
      imageAbortRef.current = abort;

      const targetScenes = sceneIndices?.length
        ? pkg.imagePrompts.filter((p) => sceneIndices.includes(p.scene))
        : pkg.imagePrompts;

      if (targetScenes.length === 0) return;

      dispatch({
        type: "IMAGES_START",
        payload: { total: targetScenes.length },
      });

      try {
        const res = await fetch("/api/generate-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sceneIndices: sceneIndices ?? undefined,
            storyPackage: {
              id: pkg.id,
              imagePrompts: pkg.imagePrompts,
              characters: pkg.characters ?? [],
            },
          }),
          signal: abort.signal,
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({ error: "Network error" }));
          throw new Error(errJson.error ?? `HTTP ${res.status}`);
        }

        // Read NDJSON stream
        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete lines
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? ""; // keep incomplete last line

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            let event: GenerateImagesEvent;
            try {
              event = JSON.parse(trimmed);
            } catch {
              continue; // skip malformed lines
            }

            switch (event.type) {
              case "scene_start":
                dispatch({
                  type: "IMAGE_SCENE_GENERATING",
                  payload: { sceneIndex: event.sceneIndex! },
                });
                break;

              case "scene_done":
                dispatch({
                  type: "IMAGE_SCENE_DONE",
                  payload: {
                    sceneIndex: event.sceneIndex!,
                    result: event.result as ImageResult,
                  },
                });
                break;

              case "scene_error":
                dispatch({
                  type: "IMAGE_SCENE_ERROR",
                  payload: {
                    sceneIndex: event.sceneIndex!,
                    error: event.error ?? "Unknown error",
                  },
                });
                break;

              case "error":
                // Fatal error — mark all unfinished scenes as error
                console.error("[generateImages] fatal:", event.error);
                break;

              case "done":
                // Final event — nothing extra to dispatch; reducer already computed status
                break;
            }
          }
        }
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return; // user cancelled
        console.error("[generateImages] stream error:", err);
        // Mark any remaining generating scenes as error
        dispatch({
          type: "IMAGE_SCENE_ERROR",
          payload: {
            sceneIndex: -1,
            error: err instanceof Error ? err.message : "Image generation failed",
          },
        });
      } finally {
        if (imageAbortRef.current === abort) {
          imageAbortRef.current = null;
        }
      }
    },
    []
  );

  const imageGenerating =
    state.imageState.status === "generating";

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        setTopic,
        setAge,
        setStoryLength,
        toggleValue,
        clearOutput,
        loadStory,
        toggleTheme,
        generateImages,
        cancelImageGeneration,
        imageGenerating,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
