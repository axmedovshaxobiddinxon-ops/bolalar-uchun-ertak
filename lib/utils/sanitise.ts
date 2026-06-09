// ============================================================
// Input Sanitisation Utilities
// ============================================================

/** Strips HTML tags from a string */
function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

/** Strips control characters and trims whitespace */
function stripControlChars(input: string): string {
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\x00-\x1F\x7F]/g, " ").trim();
}

/** Collapses multiple whitespace/newlines to single space */
function normaliseWhitespace(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

/**
 * Basic profanity keyword list — extends with more terms as needed.
 * Covers common English and Uzbek offensive terms.
 */
const BLOCKED_KEYWORDS: string[] = [
  // English
  "fuck",
  "shit",
  "ass",
  "bitch",
  "damn",
  "hell",
  "crap",
  "bastard",
  "whore",
  "porn",
  "sex",
  "kill",
  "murder",
  "rape",
  "nazi",
  "terrorist",
  "bomb",
  "weapon",
  "drug",
  "cocaine",
  "heroin",
  "suicide",
  // Uzbek offensive
  "la'nat",
  "ahmoq",
  "tentak",
  "it",
  "eshak",
];

/** Returns true if the input contains a blocked keyword */
function containsBlockedKeyword(input: string): boolean {
  const lower = input.toLowerCase();
  return BLOCKED_KEYWORDS.some((kw) => lower.includes(kw));
}

export interface SanitiseResult {
  clean: string;
  isBlocked: boolean;
  blockReason?: string;
}

/**
 * Full sanitisation pipeline:
 * 1. Strip HTML
 * 2. Strip control characters
 * 3. Normalise whitespace
 * 4. Enforce max length
 * 5. Profanity / keyword check
 */
export function sanitiseInput(
  raw: string,
  maxLength = 500
): SanitiseResult {
  let clean = stripHtml(raw);
  clean = stripControlChars(clean);
  clean = normaliseWhitespace(clean);

  if (clean.length === 0) {
    return { clean: "", isBlocked: true, blockReason: "Input is empty after sanitisation" };
  }

  if (clean.length > maxLength) {
    clean = clean.slice(0, maxLength);
  }

  if (containsBlockedKeyword(clean)) {
    return {
      clean,
      isBlocked: true,
      blockReason:
        "Kiritilgan matn bolalar uchun mos bo'lmagan so'zlarni o'z ichiga oladi. Iltimos, boshqa mavzu kiriting.",
    };
  }

  return { clean, isBlocked: false };
}
