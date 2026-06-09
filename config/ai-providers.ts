// ============================================================
// AI Provider Configuration
// All values read from environment variables
// ============================================================

export const AI_CONFIG = {
  text: {
    provider: process.env.TEXT_AI_PROVIDER || "openai",
    model: process.env.TEXT_AI_MODEL || "gpt-4o",
    maxTokens: 4000,
    /** Higher temperature for creative storytelling */
    temperature: 0.85,
  },
  /** Phase 3 — disabled by default */
  image: {
    provider: process.env.IMAGE_AI_PROVIDER || null,
    model: process.env.IMAGE_AI_MODEL || "dall-e-3",
    size: "1024x1024",
    quality: "hd",
    style: "vivid",
  },
  /** Phase 4 — disabled by default */
  video: {
    provider: process.env.VIDEO_AI_PROVIDER || null,
    model: process.env.VIDEO_AI_MODEL || "runway-gen3",
    durationSeconds: 5,
    resolution: "1280x720",
  },
} as const;
