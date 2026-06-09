// ============================================================
// POST /api/generate
// Main story generation endpoint
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateStory } from "@/lib/ai/orchestrator";
import { checkRateLimit } from "@/config/rate-limits";
import type { GenerateResponse } from "@/types";

// ── Request schema ─────────────────────────────────────────

const GenerateRequestSchema = z.object({
  topic: z
    .string()
    .min(2, "Mavzu kamida 2 ta belgidan iborat bo'lishi kerak")
    .max(500, "Mavzu 500 ta belgidan oshmasligi kerak"),
  ageOverride: z.enum(["4-6", "7-9", "10-12"]).optional(),
  storyLength: z.enum(["short", "medium", "long"]).optional().default("medium"),
  emphasizedValues: z
    .array(
      z.enum([
        "ezgulik",
        "halollik",
        "odob-axloq",
        "ilm-marifat",
        "kitobxonlik",
        "vatanparvarlik",
        "ota-ona-hurmat",
        "ustoz-ehtirom",
        "dostlik",
        "mehnatsevarlik",
      ])
    )
    .optional()
    .default([]),
  language: z.enum(["uz-latn", "uz-cyrl"]).optional().default("uz-latn"),
});

// ── IP extraction ──────────────────────────────────────────

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

// ── Handler ────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse<GenerateResponse>> {
  // 1. Rate limiting
  const ip = getClientIp(req);
  const rateCheck = checkRateLimit(ip, "generate");

  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `Juda ko'p so'rov yuborildi. Iltimos, bir daqiqadan so'ng qayta urinib ko'ring.`,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rateCheck.resetAt),
          "Retry-After": String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  // 2. Parse and validate request body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "So'rov formati noto'g'ri." },
      { status: 400 }
    );
  }

  const parseResult = GenerateRequestSchema.safeParse(body);
  if (!parseResult.success) {
    const firstError = parseResult.error.errors[0];
    return NextResponse.json(
      {
        success: false,
        error: firstError?.message || "So'rov ma'lumotlari noto'g'ri.",
      },
      { status: 400 }
    );
  }

  const request = parseResult.data;

  // 3. Generate story
  try {
    const storyPackage = await generateStory(request);

    return NextResponse.json(
      { success: true, data: storyPackage },
      {
        status: 200,
        headers: {
          "X-RateLimit-Remaining": String(rateCheck.remaining),
          "X-RateLimit-Reset": String(rateCheck.resetAt),
        },
      }
    );
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Ertak yaratishda kutilmagan xatolik yuz berdi. Iltimos, qayta urinib ko'ring.";

    console.error("[/api/generate] Error:", err);

    // Differentiate between user errors (4xx) and server errors (5xx)
    const isUserError =
      message.includes("bo'sh bo'lishi mumkin emas") ||
      message.includes("Noto'g'ri") ||
      message.includes("mos bo'lmagan so'zlar");

    return NextResponse.json(
      { success: false, error: message },
      { status: isUserError ? 400 : 500 }
    );
  }
}

// Only POST is supported
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: "Method not allowed. Use POST." },
    { status: 405 }
  );
}
