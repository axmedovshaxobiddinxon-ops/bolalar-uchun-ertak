"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import type { AppState, AppAction, AgeCategory, EducationalValue, StoryPackage, StoryLength } from "@/types";
import { loadHistory, saveTheme, loadTheme } from "@/lib/utils/local-storage";

// ── Initial state ─────────────────────────────────────────

const initialState: AppState = {
  topic: "",
  ageOverride: null,
  storyLength: "medium",
  emphasizedValues: [],
  status: "idle",
  errorMessage: null,
  storyPackage: null,
  history: [],
  theme: "light",
  activeSection: null,
};

// ── Reducer ───────────────────────────────────────────────

function appReducer(state: AppState, action: AppAction): AppState {
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
      };

    case "GENERATE_SUCCESS":
      return {
        ...state,
        status: "success",
        storyPackage: action.payload,
        errorMessage: null,
      };

    case "GENERATE_ERROR":
      return {
        ...state,
        status: "error",
        errorMessage: action.payload,
        storyPackage: null,
      };

    case "ADD_TO_HISTORY":
      return {
        ...state,
        history: [action.payload, ...state.history.filter((s) => s.id !== action.payload.id)].slice(0, 20),
      };

    case "LOAD_HISTORY":
      return { ...state, history: action.payload };

    case "CLEAR_OUTPUT":
      return { ...state, status: "idle", storyPackage: null, errorMessage: null };

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
}

const AppContext = createContext<AppContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

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
    if (typeof document !== "undefined") {
      if (state.theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [state.theme]);

  const setTopic = useCallback((topic: string) => {
    dispatch({ type: "SET_TOPIC", payload: topic });
  }, []);

  const setAge = useCallback((age: AgeCategory | null) => {
    dispatch({ type: "SET_AGE", payload: age });
  }, []);

  const setStoryLength = useCallback((length: StoryLength) => {
    dispatch({ type: "SET_STORY_LENGTH", payload: length });
  }, []);

  const toggleValue = useCallback((value: EducationalValue) => {
    dispatch({ type: "TOGGLE_VALUE", payload: value });
  }, []);

  const clearOutput = useCallback(() => {
    dispatch({ type: "CLEAR_OUTPUT" });
  }, []);

  const loadStory = useCallback((pkg: StoryPackage) => {
    dispatch({ type: "GENERATE_SUCCESS", payload: pkg });
  }, []);

  const toggleTheme = useCallback(() => {
    const next = state.theme === "light" ? "dark" : "light";
    dispatch({ type: "SET_THEME", payload: next });
    saveTheme(next);
  }, [state.theme]);

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
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within AppProvider");
  }
  return ctx;
}
