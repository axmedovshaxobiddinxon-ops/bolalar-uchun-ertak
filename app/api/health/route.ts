// ============================================================
// GET /api/health
// Health check endpoint for uptime monitoring
// ============================================================

import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      status: "ok",
      service: "bolalar-uchun-ertak",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      aiProvider: process.env.TEXT_AI_PROVIDER || "openai",
      aiModel: process.env.TEXT_AI_MODEL || "gpt-4o",
    },
    { status: 200 }
  );
}
