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

  /** Phase 3 — set IMAGE_AI_PROVIDER=openai to enable */
  image: {
    provider: process.env.IMAGE_AI_PROVIDER || null,
    /**
     * gpt-image-1  → latest OpenAI image model, supports transparent bg
     * dall-e-3     → previous generation, vivid/natural style param
     */
    model: process.env.IMAGE_AI_MODEL || "gpt-image-1",
    /** Square illustrations fit book pages best */
    size: (process.env.IMAGE_AI_SIZE || "1024x1024") as
      | "1024x1024"
      | "1792x1024"
      | "1024x1792",
    /**
     * gpt-image-1: "low" | "medium" | "high" | "auto"
     * dall-e-3:    "standard" | "hd"
     */
    quality: (process.env.IMAGE_AI_QUALITY || "medium") as
      | "low"
      | "medium"
      | "high"
      | "auto"
      | "standard"
      | "hd",
    /** dall-e-3 only — "vivid" | "natural" */
    style: (process.env.IMAGE_AI_STYLE || "vivid") as "vivid" | "natural",
    /** gpt-image-1 only — "transparent" keeps alpha channel in PNG */
    background: (process.env.IMAGE_AI_BACKGROUND || "opaque") as
      | "transparent"
      | "opaque"
      | "auto",
    /** How many images to generate per batch call (gpt-image-1 supports up to 10) */
    n: 1,
    /** Maximum concurrent in-flight image requests (to respect rate limits) */
    concurrency: Number(process.env.IMAGE_AI_CONCURRENCY) || 2,
  },

  /** Phase 4 — disabled by default */
  video: {
    provider: process.env.VIDEO_AI_PROVIDER || null,
    model: process.env.VIDEO_AI_MODEL || "runway-gen3",
    durationSeconds: 5,
    resolution: "1280x720",
  },
} as const;
