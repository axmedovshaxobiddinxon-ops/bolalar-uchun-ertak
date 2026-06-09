// ============================================================
// OpenAI Image Provider — gpt-image-1 / DALL-E 3
// Implements ImageAIProvider interface.
//
// gpt-image-1 returns base64-encoded PNG directly.
// DALL-E 3 can return a URL; we request b64_json for consistency
// so the image is immediately usable without a second fetch.
// ============================================================

import type { ImageAIProvider, ImageOptions, ImageResult } from "@/types";
import { AI_CONFIG } from "@/config/ai-providers";

// ── Disney Pixar children's book style suffix ─────────────
// Injected at the END of every prompt regardless of what
// character-consistency already added.

export const PIXAR_STYLE_SUFFIX =
  "Disney Pixar 3D animation style, vibrant warm colours, soft volumetric lighting, " +
  "expressive friendly characters, child-safe, clean background, " +
  "high detail storybook illustration, no text or letters in image";

// ── Helper: convert base64 string → data URL ─────────────

function toDataUrl(b64: string, mimeType = "image/png"): string {
  // Already a data URL — return as-is
  if (b64.startsWith("data:")) return b64;
  return `data:${mimeType};base64,${b64}`;
}

// ── Provider ──────────────────────────────────────────────

export class OpenAIImageProvider implements ImageAIProvider {
  readonly name = "openai-image";

  private readonly apiKey: string;
  private readonly model: string;

  constructor() {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error(
        "OPENAI_API_KEY is not set. Please add it to your .env.local file."
      );
    }
    this.apiKey = key;
    this.model = AI_CONFIG.image.model;
  }

  async generateImage(
    prompt: string,
    options: ImageOptions
  ): Promise<ImageResult> {
    // Always append Pixar style suffix (deduplicated)
    const cleanPrompt = prompt.replace(/Disney Pixar.*?image/gi, "").trim();
    const fullPrompt = `${cleanPrompt}, ${PIXAR_STYLE_SUFFIX}`.slice(0, 4000);

    const isGptImage1 = this.model.startsWith("gpt-image");

    // Build request body — slightly different shape per model
    const body: Record<string, unknown> = {
      model: this.model,
      prompt: fullPrompt,
      n: 1,
      size: options.size ?? "1024x1024",
      response_format: "b64_json",
    };

    if (isGptImage1) {
      // gpt-image-1 quality: "low" | "medium" | "high" | "auto"
      body.quality = options.quality ?? "medium";
      // background: "opaque" | "transparent" | "auto"
      if (AI_CONFIG.image.background) {
        body.background = AI_CONFIG.image.background;
      }
      // output_format — request PNG for transparency support
      body.output_format = "png";
    } else {
      // dall-e-3 quality: "standard" | "hd"
      body.quality = options.quality === "high" ? "hd" : "standard";
      // dall-e-3 style: "vivid" | "natural"
      body.style = options.style ?? "vivid";
    }

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(120_000), // 2-minute timeout per image
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "unknown");

      if (response.status === 401) {
        throw new Error("OpenAI API key is invalid or expired.");
      }
      if (response.status === 429) {
        throw new Error(
          "OpenAI image rate limit hit. Please wait a moment and try again."
        );
      }
      if (response.status === 400) {
        // Content policy violation — return a safe placeholder instead of crashing
        throw new Error(`Image prompt rejected by content policy: ${errText.slice(0, 200)}`);
      }
      throw new Error(`OpenAI Images API error ${response.status}: ${errText.slice(0, 300)}`);
    }

    const json = await response.json();

    const b64 = json?.data?.[0]?.b64_json as string | undefined;
    if (!b64) {
      throw new Error("OpenAI Images API returned no image data.");
    }

    // Determine pixel dimensions from size string
    const [wStr, hStr] = (options.size ?? "1024x1024").split("x");
    const width = parseInt(wStr ?? "1024", 10);
    const height = parseInt(hStr ?? "1024", 10);

    return {
      sceneIndex: -1, // caller overwrites this
      promptUsed: fullPrompt,
      dataUrl: toDataUrl(b64, "image/png"),
      width,
      height,
      model: this.model,
      generatedAt: new Date().toISOString(),
    };
  }
}

// ── Factory ───────────────────────────────────────────────

/**
 * Returns the configured image provider, or null if image generation
 * is disabled (IMAGE_AI_PROVIDER not set).
 */
export function getImageProvider(): OpenAIImageProvider | null {
  const providerName = process.env.IMAGE_AI_PROVIDER;
  if (!providerName) return null;

  switch (providerName.toLowerCase()) {
    case "openai":
      return new OpenAIImageProvider();
    default:
      console.warn(`Unknown IMAGE_AI_PROVIDER: "${providerName}". Image generation disabled.`);
      return null;
  }
}
