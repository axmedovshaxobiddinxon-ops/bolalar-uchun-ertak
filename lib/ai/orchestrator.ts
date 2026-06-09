// ============================================================
// Story Generation Orchestrator
// Full pipeline: validate → build prompts → call AI →
//               parse → safety check (retry ≤2) →
//               character consistency → return StoryPackage
// ============================================================

import { v4 as uuidv4 } from "uuid";
import type { GenerateRequest, StoryPackage, TextAIProvider } from "@/types";
import { OpenAIProvider } from "./providers/openai";
import { buildSystemPrompt, buildUserPrompt, PROMPT_VERSION } from "@/lib/prompts/builder";
import { validateStoryPackage } from "./safety-validator";
import { applyCharacterConsistency } from "./character-consistency";
import { sanitiseInput } from "@/lib/utils/sanitise";

const MAX_RETRIES = 2;

// ── Input validation ──────────────────────────────────────

function validateRequest(request: GenerateRequest): void {
  if (!request.topic || request.topic.trim().length === 0) {
    throw new Error("Mavzu bo'sh bo'lishi mumkin emas. Iltimos, mavzu kiriting.");
  }
  if (request.topic.length > 500) {
    throw new Error("Mavzu 500 ta belgidan oshmasligi kerak.");
  }

  const validAgeCategories = ["4-6", "7-9", "10-12"];
  if (request.ageOverride && !validAgeCategories.includes(request.ageOverride)) {
    throw new Error("Noto'g'ri yosh toifasi.");
  }

  const validLengths = ["short", "medium", "long"];
  if (request.storyLength && !validLengths.includes(request.storyLength)) {
    throw new Error("Noto'g'ri ertak uzunligi.");
  }
}

// ── JSON parser ───────────────────────────────────────────

function parseAIResponse(raw: string): StoryPackage {
  let json: string = raw.trim();

  // Strip markdown code fences if AI wraps response
  if (json.startsWith("```")) {
    json = json.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(json);
  } catch {
    // Try to extract a JSON object from the text
    const match = json.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        parsed = JSON.parse(match[0]);
      } catch {
        throw new Error(
          "AI javobi JSON formatida emas. Qayta urinib ko'ring."
        );
      }
    } else {
      throw new Error("AI javobi JSON formatida emas. Qayta urinib ko'ring.");
    }
  }

  // Validate required fields
  const required = ["title", "ageCategory", "summary", "story", "moralLesson"];
  for (const field of required) {
    if (!parsed[field]) {
      throw new Error(`AI javobi to'liq emas: '${field}' maydoni yo'q.`);
    }
  }

  // Ensure arrays exist with defaults
  if (!Array.isArray(parsed.characters)) parsed.characters = [];
  if (!Array.isArray(parsed.imagePrompts)) parsed.imagePrompts = [];
  if (!Array.isArray(parsed.videoScenes)) parsed.videoScenes = [];
  if (!Array.isArray(parsed.educationalValues)) parsed.educationalValues = [];

  // Ensure hashtags object
  if (!parsed.hashtags || typeof parsed.hashtags !== "object") {
    parsed.hashtags = { uzbek: [], english: [] };
  }
  const hashtags = parsed.hashtags as Record<string, unknown>;
  if (!Array.isArray(hashtags.uzbek)) hashtags.uzbek = [];
  if (!Array.isArray(hashtags.english)) hashtags.english = [];

  if (!parsed.parentNote) parsed.parentNote = "";

  return parsed as unknown as StoryPackage;
}

// ── Metadata enrichment ───────────────────────────────────

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function estimateReadingTime(wordCount: number): number {
  // Average reading speed: 150 wpm for children
  return Math.max(1, Math.ceil(wordCount / 150));
}

function enrichWithMetadata(
  pkg: StoryPackage,
  request: GenerateRequest,
  aiModel: string
): StoryPackage {
  const wordCount = countWords(pkg.story);

  return {
    ...pkg,
    id: uuidv4(),
    generatedAt: new Date().toISOString(),
    topic: request.topic,
    storyLength: request.storyLength || "medium",
    metadata: {
      wordCount,
      readingTimeMinutes: estimateReadingTime(wordCount),
      aiModel,
      promptVersion: PROMPT_VERSION,
    },
  };
}

// ── Provider factory ──────────────────────────────────────

function getTextProvider(): TextAIProvider {
  const providerName = process.env.TEXT_AI_PROVIDER || "openai";

  switch (providerName) {
    case "openai":
      return new OpenAIProvider();
    default:
      // Default to OpenAI for Phase 1
      return new OpenAIProvider();
  }
}

// ── Main orchestrator ─────────────────────────────────────

/**
 * Full story generation pipeline.
 * Validates input → builds prompts → calls AI → parses response →
 * validates safety (retries ≤2) → applies character consistency →
 * enriches with metadata → returns StoryPackage
 */
export async function generateStory(request: GenerateRequest): Promise<StoryPackage> {
  // 1. Validate and sanitise input
  validateRequest(request);

  const sanitised = sanitiseInput(request.topic, 500);
  if (sanitised.isBlocked) {
    throw new Error(sanitised.blockReason || "Noto'g'ri mavzu kiritildi.");
  }

  const cleanRequest: GenerateRequest = {
    ...request,
    topic: sanitised.clean,
  };

  // 2. Build prompts
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(cleanRequest);

  // 3. Get AI provider
  const provider = getTextProvider();

  // 4. Generate with retry loop
  let lastError: Error | null = null;
  let pkg: StoryPackage | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const rawResponse = await provider.generateStory(systemPrompt, userPrompt);

      // 5. Parse AI response
      const parsed = parseAIResponse(rawResponse);

      // 6. Validate content safety
      const safetyResult = validateStoryPackage(parsed);

      if (!safetyResult.passed) {
        const blockViolations = safetyResult.violations
          .filter((v) => v.severity === "block")
          .map((v) => v.rule)
          .join(", ");

        if (attempt < MAX_RETRIES) {
          console.warn(
            `Safety check failed (attempt ${attempt + 1}): ${blockViolations}. Retrying...`
          );
          continue;
        }

        throw new Error(
          `Ertak xavfsizlik tekshiruvidan o'tmadi: ${blockViolations}. ` +
            "Iltimos, boshqa mavzu bilan qayta urinib ko'ring."
        );
      }

      pkg = parsed;
      break;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt < MAX_RETRIES && isRetryableError(lastError)) {
        console.warn(`Attempt ${attempt + 1} failed: ${lastError.message}. Retrying...`);
        await delay(1000 * (attempt + 1)); // exponential back-off
        continue;
      }

      throw lastError;
    }
  }

  if (!pkg) {
    throw lastError || new Error("Ertak yaratishda xatolik yuz berdi.");
  }

  // 7. Apply character consistency to image prompts
  const withConsistency = applyCharacterConsistency(pkg);

  // 8. Enrich with metadata
  const enriched = enrichWithMetadata(withConsistency, cleanRequest, provider.name);

  return enriched;
}

function isRetryableError(err: Error): boolean {
  const msg = err.message.toLowerCase();
  return (
    msg.includes("timeout") ||
    msg.includes("503") ||
    msg.includes("502") ||
    msg.includes("temporarily unavailable") ||
    msg.includes("rate limit")
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
