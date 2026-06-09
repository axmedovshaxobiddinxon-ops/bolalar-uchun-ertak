// ============================================================
// POST /api/generate-images
// Phase 3 — AI image generation endpoint
//
// Accepts a StoryPackage (or subset) and generates one
// Disney-Pixar-style illustration per ImagePrompt scene.
//
// Strategy:
//  • Scenes are generated sequentially or with controlled
//    concurrency (IMAGE_AI_CONCURRENCY env var, default 2)
//    to stay inside OpenAI rate limits.
//  • Each scene result is streamed back as NDJSON so the
//    client can update the UI progressively without waiting
//    for ALL images to finish.
//  • If a single scene fails we keep going and report the
//    error for that scene only.
//
// Request body:  GenerateImagesRequest
// Response:      Server-Sent Events (text/event-stream NDJSON)
//                Each line is a GenerateImagesEvent JSON object.
// ============================================================

import { NextRequest } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/config/rate-limits";
import { getImageProvider } from "@/lib/ai/providers/openai-image";
import { buildImagePromptForScene } from "@/lib/ai/character-consistency";
import { AI_CONFIG } from "@/config/ai-providers";
import type { ImageResult, StoryPackage } from "@/types";

// ── Request schema ─────────────────────────────────────────

const CharacterSchema = z.object({
  name: z.string(),
  role: z.enum(["protagonist", "mentor", "antagonist", "supporting"]),
  visualSeed: z.string(),
});

const ImagePromptSchema = z.object({
  scene: z.number().int().min(1),
  storyReference: z.string(),
  prompt: z.string(),
  style: z.string(),
  characters: z.array(z.string()),
});

const RequestSchema = z.object({
  /** Which scenes to generate. If omitted, all scenes are generated. */
  sceneIndices: z.array(z.number().int().min(1)).optional(),
  /** Minimal StoryPackage subset needed for prompts + character seeds */
  storyPackage: z.object({
    id: z.string(),
    imagePrompts: z.array(ImagePromptSchema),
    characters: z.array(CharacterSchema).optional().default([]),
  }),
});

// ── Event types streamed to the client ────────────────────

export type GenerateImagesEventType =
  | "start"        // generation begun, carries { total }
  | "scene_start"  // scene generation started, carries { sceneIndex }
  | "scene_done"   // scene done successfully, carries { sceneIndex, result }
  | "scene_error"  // scene failed, carries { sceneIndex, error }
  | "done"         // all scenes finished, carries { total, succeeded, failed }
  | "error";       // fatal error before any scenes could start

export interface GenerateImagesEvent {
  type: GenerateImagesEventType;
  sceneIndex?: number;
  result?: ImageResult;
  error?: string;
  total?: number;
  succeeded?: number;
  failed?: number;
}

// ── IP helper ─────────────────────────────────────────────

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

// ── Concurrency helper ────────────────────────────────────

/**
 * Runs `tasks` with at most `concurrency` running at the same time.
 * Each task receives an emit function to stream events immediately.
 */
async function runConcurrent<T>(
  tasks: Array<() => Promise<T>>,
  concurrency: number
): Promise<T[]> {
  const results: T[] = [];
  const queue = [...tasks];
  const running = new Set<Promise<void>>();

  return new Promise((resolve, reject) => {
    function startNext() {
      if (queue.length === 0 && running.size === 0) {
        resolve(results);
        return;
      }
      while (running.size < concurrency && queue.length > 0) {
        const task = queue.shift()!;
        const p: Promise<void> = task().then((r) => {
          results.push(r);
          running.delete(p);
          startNext();
        }).catch((e) => {
          running.delete(p);
          reject(e);
        });
        running.add(p);
      }
    }
    startNext();
  });
}

// ── Main handler ──────────────────────────────────────────

export async function POST(req: NextRequest): Promise<Response> {
  // 1. Rate limiting — 5 requests/min per IP
  const ip = getClientIp(req);
  const rateCheck = checkRateLimit(ip, "generateImages");
  if (!rateCheck.allowed) {
    return new Response(
      JSON.stringify({ error: "Rasm yaratish chastotasi chegarasi oshdi. Iltimos, bir daqiqa kutib turing." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  // 2. Check image provider is configured
  const provider = getImageProvider();
  if (!provider) {
    return new Response(
      JSON.stringify({
        error:
          "IMAGE_AI_PROVIDER is not configured. " +
          "Set IMAGE_AI_PROVIDER=openai in your .env.local to enable image generation.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  // 3. Parse request
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "So'rov formati noto'g'ri." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Noto'g'ri so'rov ma'lumotlari.";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { storyPackage, sceneIndices } = parsed.data;

  // 4. Determine which scenes to generate
  const allPrompts = storyPackage.imagePrompts;
  const targetPrompts = sceneIndices?.length
    ? allPrompts.filter((p) => sceneIndices.includes(p.scene))
    : allPrompts;

  if (targetPrompts.length === 0) {
    return new Response(
      JSON.stringify({ error: "Yaratish uchun rasm tavsiflar topilmadi." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const total = targetPrompts.length;

  // 5. Build image options from config
  const imageOptions = {
    size: AI_CONFIG.image.size,
    quality: AI_CONFIG.image.quality,
    style: AI_CONFIG.image.style,
    background: AI_CONFIG.image.background,
  };

  const concurrency = AI_CONFIG.image.concurrency;

  // 6. Stream results back as NDJSON (Server-Sent Events style)
  const encoder = new TextEncoder();
  let succeeded = 0;
  let failed = 0;

  const stream = new ReadableStream({
    async start(controller) {
      function emit(event: GenerateImagesEvent) {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      }

      // Emit start event
      emit({ type: "start", total });

      // Cast to partial StoryPackage for buildImagePromptForScene
      const pkgForConsistency = storyPackage as Pick<
        StoryPackage,
        "imagePrompts" | "characters"
      >;

      // Build tasks
      const tasks = targetPrompts.map((promptDef) => async () => {
        const sceneIndex = promptDef.scene;
        emit({ type: "scene_start", sceneIndex });

        try {
          // Re-run character seed injection on this individual prompt
          const enrichedPrompt =
            buildImagePromptForScene(
              sceneIndex,
              pkgForConsistency as StoryPackage
            ) ?? promptDef.prompt;

          const result = await provider.generateImage(enrichedPrompt, imageOptions);

          const finalResult: ImageResult = {
            ...result,
            sceneIndex,
            promptUsed: enrichedPrompt,
          };

          succeeded++;
          emit({ type: "scene_done", sceneIndex, result: finalResult });
          return finalResult;
        } catch (err) {
          const errorMsg =
            err instanceof Error ? err.message : "Rasm yaratishda xatolik.";
          failed++;
          emit({ type: "scene_error", sceneIndex, error: errorMsg });
          return null;
        }
      });

      // Run with concurrency limit
      try {
        await runConcurrent(tasks, concurrency);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Kutilmagan xatolik.";
        emit({ type: "error", error: msg });
      }

      // Emit done
      emit({ type: "done", total, succeeded, failed });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no", // disable Nginx buffering for streaming
    },
  });
}

// Only POST supported
export async function GET(): Promise<Response> {
  return new Response(
    JSON.stringify({ error: "Method not allowed. Use POST." }),
    { status: 405, headers: { "Content-Type": "application/json" } }
  );
}
