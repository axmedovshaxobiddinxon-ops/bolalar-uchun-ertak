// ============================================================
// Bolalar Uchun Ertak — Core TypeScript Types
// ============================================================

// ── Primitives ───────────────────────────────────────────

export type AgeCategory = "4-6" | "7-9" | "10-12";

export type StoryLength = "short" | "medium" | "long";

export type EducationalValue =
  | "ezgulik" // Kindness
  | "halollik" // Honesty
  | "odob-axloq" // Good Manners
  | "ilm-marifat" // Education & Knowledge
  | "kitobxonlik" // Love of Reading
  | "vatanparvarlik" // Patriotism
  | "ota-ona-hurmat" // Respect for Parents
  | "ustoz-ehtirom" // Respect for Teachers
  | "dostlik" // Friendship
  | "mehnatsevarlik"; // Hard Work & Perseverance

export type CharacterRole = "protagonist" | "mentor" | "antagonist" | "supporting";

// ── Story Domain Models ───────────────────────────────────

export interface Character {
  /** Character's name in Uzbek */
  name: string;
  /** Role in the story */
  role: CharacterRole;
  /**
   * Stable English description for image prompts — e.g.
   * "a 7-year-old Uzbek boy with dark hair, wearing a traditional
   *  doppi hat and blue chapan, friendly smile"
   */
  visualSeed: string;
}

export interface ImagePrompt {
  /** Scene index (1-based) */
  scene: number;
  /** Which part of the story this illustrates (Uzbek) */
  storyReference: string;
  /** Full English prompt for AI image generation */
  prompt: string;
  /** Visual style, e.g. "warm watercolor illustration, child-friendly" */
  style: string;
  /** Names of characters appearing in this scene */
  characters: string[];
}

export interface VideoScene {
  /** Scene index (1-based) */
  scene: number;
  /** Suggested duration, e.g. "5-8 seconds" */
  duration: string;
  /** English description for AI video generation */
  description: string;
  /** Uzbek narration text for this scene */
  narration: string;
  /** Camera movement description, e.g. "slow pan left to right" */
  cameraMovement: string;
  /** Emotional mood, e.g. "warm, hopeful, gentle" */
  mood: string;
}

export interface StoryPackage {
  /** UUID */
  id: string;
  /** ISO 8601 timestamp */
  generatedAt: string;
  /** Original user input topic */
  topic: string;
  /** Generated Uzbek title */
  title: string;
  /** Age category determined / confirmed by AI */
  ageCategory: AgeCategory;
  /** Story length requested */
  storyLength: StoryLength;
  /** 3–5 sentence Uzbek summary */
  summary: string;
  /** Full Uzbek story text */
  story: string;
  /** Moral lesson in Uzbek */
  moralLesson: string;
  /** Educational values embedded in the story */
  educationalValues: EducationalValue[];
  /** Extracted characters with visual seeds */
  characters: Character[];
  /** AI image generation prompts (English) */
  imagePrompts: ImagePrompt[];
  /** Video scene descriptions (English) */
  videoScenes: VideoScene[];
  hashtags: {
    /** Uzbek hashtags e.g. ["#bolalaruchun", "#ertak"] */
    uzbek: string[];
    /** English hashtags e.g. ["#uzbekfairytale", "#kidsbooks"] */
    english: string[];
  };
  /** Uzbek note for parents explaining the educational value */
  parentNote: string;
  metadata: {
    wordCount: number;
    readingTimeMinutes: number;
    /** AI model used, e.g. "gpt-4o" */
    aiModel: string;
    /** Prompt version, e.g. "v1.0.0" */
    promptVersion: string;
  };
}

// ── API Request / Response ────────────────────────────────

export interface GenerateRequest {
  /** User-provided topic (max 500 chars) */
  topic: string;
  /** Optional age override — AI will infer if not provided */
  ageOverride?: AgeCategory;
  /** Optional story length preference */
  storyLength?: StoryLength;
  /** Optional educational values to emphasise */
  emphasizedValues?: EducationalValue[];
  /** Script variant — default uz-latn */
  language?: "uz-latn" | "uz-cyrl";
}

export interface GenerateResponse {
  success: boolean;
  data?: StoryPackage;
  error?: string;
}

// ── Safety Validation ─────────────────────────────────────

export type SafetyViolationSeverity = "block" | "warn";

export interface SafetyViolation {
  rule: string;
  severity: SafetyViolationSeverity;
  detail: string;
}

export interface SafetyCheckResult {
  passed: boolean;
  violations: SafetyViolation[];
}

// ── AI Provider Interfaces ────────────────────────────────

export interface TextAIProvider {
  name: string;
  generateStory(systemPrompt: string, userPrompt: string): Promise<string>;
}

// ── Phase 3: AI Image Generation ─────────────────────────

export interface ImageOptions {
  size: "1024x1024" | "1792x1024" | "1024x1792";
  quality: "standard" | "hd" | "low" | "medium" | "high" | "auto";
  style?: "vivid" | "natural";
  /** Background transparency — only for gpt-image-1 */
  background?: "transparent" | "opaque" | "auto";
}

export interface ImageResult {
  /** scene index (1-based), matching ImagePrompt.scene */
  sceneIndex: number;
  promptUsed: string;
  /** base64-encoded PNG data URL: "data:image/png;base64,..." */
  dataUrl: string;
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /** Which model generated this */
  model: string;
  /** ISO timestamp */
  generatedAt: string;
}

export type ImageGenerationStatus =
  | "idle"
  | "generating"   // currently generating one or more images
  | "partial"       // some done, some still pending or errored
  | "done"          // all images generated successfully
  | "error";        // all failed

export interface ImageGenerationState {
  status: ImageGenerationStatus;
  /** Results indexed by sceneIndex (1-based) */
  images: Record<number, ImageResult>;
  /** Per-scene generation status */
  sceneStatus: Record<number, "idle" | "generating" | "done" | "error">;
  /** Per-scene error messages */
  sceneErrors: Record<number, string>;
  /** Total scenes to generate */
  total: number;
  /** How many have finished (done or error) */
  completed: number;
  /** Global error message */
  errorMessage: string | null;
}

export const INITIAL_IMAGE_STATE: ImageGenerationState = {
  status: "idle",
  images: {},
  sceneStatus: {},
  sceneErrors: {},
  total: 0,
  completed: 0,
  errorMessage: null,
};

export interface ImageAIProvider {
  name: string;
  generateImage(prompt: string, options: ImageOptions): Promise<ImageResult>;
}

/** Phase 4 — not yet implemented */
export interface VideoOptions {
  durationSeconds: number;
  resolution: string;
}

export interface VideoResult {
  url: string;
  sceneIndex: number;
  status: "completed" | "processing" | "failed";
}

export interface VideoAIProvider {
  name: string;
  generateVideoClip(scene: VideoScene, options: VideoOptions): Promise<VideoResult>;
}

// ── App State (Frontend) ──────────────────────────────────

export type AppStatus = "idle" | "loading" | "success" | "error";

export interface AppState {
  // Input
  topic: string;
  ageOverride: AgeCategory | null;
  storyLength: StoryLength;
  emphasizedValues: EducationalValue[];

  // Generation status
  status: AppStatus;
  errorMessage: string | null;

  // Output
  storyPackage: StoryPackage | null;

  // Phase 3: image generation state
  imageState: ImageGenerationState;

  // History (persisted to localStorage)
  history: StoryPackage[];

  // UI
  theme: "light" | "dark";
  activeSection: string | null;
}

export type AppAction =
  | { type: "SET_TOPIC"; payload: string }
  | { type: "SET_AGE"; payload: AgeCategory | null }
  | { type: "SET_STORY_LENGTH"; payload: StoryLength }
  | { type: "SET_VALUES"; payload: EducationalValue[] }
  | { type: "TOGGLE_VALUE"; payload: EducationalValue }
  | { type: "GENERATE_START" }
  | { type: "GENERATE_SUCCESS"; payload: StoryPackage }
  | { type: "GENERATE_ERROR"; payload: string }
  | { type: "ADD_TO_HISTORY"; payload: StoryPackage }
  | { type: "LOAD_HISTORY"; payload: StoryPackage[] }
  | { type: "CLEAR_OUTPUT" }
  | { type: "SET_THEME"; payload: "light" | "dark" }
  | { type: "SET_ACTIVE_SECTION"; payload: string | null }
  // ── Phase 3: image generation ──────────────────────────
  | { type: "IMAGES_START"; payload: { total: number } }
  | { type: "IMAGE_SCENE_GENERATING"; payload: { sceneIndex: number } }
  | { type: "IMAGE_SCENE_DONE"; payload: { sceneIndex: number; result: ImageResult } }
  | { type: "IMAGE_SCENE_ERROR"; payload: { sceneIndex: number; error: string } }
  | { type: "IMAGES_RESET" };
