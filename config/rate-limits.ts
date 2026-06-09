// ============================================================
// Rate Limiting Configuration (per IP)
// ============================================================

export const RATE_LIMITS = {
  generate: {
    requests: Number(process.env.RATE_LIMIT_GENERATE) || 10,
    windowMs: 60_000, // 1 minute
  },
  regenerateSection: {
    requests: 30,
    windowMs: 60_000,
  },
  /** Phase 3 — each call may generate multiple images */
  generateImages: {
    requests: 5,
    windowMs: 60_000,
  },
  /** Phase 4 */
  generateVideo: {
    requests: 2,
    windowMs: 60_000,
  },
} as const;

/** In-memory store for rate limiting (sufficient for single-instance MVP) */
const ipRequestMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  ip: string,
  route: keyof typeof RATE_LIMITS
): { allowed: boolean; remaining: number; resetAt: number } {
  const limit = RATE_LIMITS[route];
  const now = Date.now();
  const key = `${route}:${ip}`;

  const record = ipRequestMap.get(key);

  if (!record || now > record.resetAt) {
    // New window
    ipRequestMap.set(key, { count: 1, resetAt: now + limit.windowMs });
    return { allowed: true, remaining: limit.requests - 1, resetAt: now + limit.windowMs };
  }

  if (record.count >= limit.requests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: limit.requests - record.count,
    resetAt: record.resetAt,
  };
}
