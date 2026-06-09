// ============================================================
// Character Consistency Manager
// Ensures every image prompt includes:
//  1. A precise visual seed for each character in the scene
//  2. The Disney Pixar style suffix
//  3. Consistent negative guidance (no text, no watermarks)
// ============================================================

import type { Character, ImagePrompt, StoryPackage } from "@/types";

// ── Style constants ───────────────────────────────────────

/**
 * Core Disney Pixar 3D style that is appended to EVERY image prompt.
 * Chosen to produce warm, child-safe, visually consistent illustrations.
 */
export const PIXAR_STYLE =
  "Disney Pixar 3D animation style, vibrant warm colours, soft volumetric lighting, " +
  "expressive friendly characters, child-safe storybook illustration, " +
  "clean simple background, high detail, no text or letters in image, " +
  "no watermarks, no borders";

/**
 * Negative prompt injected as a trailing instruction in each prompt.
 * Helps suppress content that breaks the look or safety requirements.
 */
const NEGATIVE_GUIDANCE =
  "avoid: horror elements, violence, scary faces, adult content, realistic photo, " +
  "dark gloomy lighting, text, watermarks, logos";

// ── Helpers ───────────────────────────────────────────────

/**
 * Builds a compact but unambiguous English visual seed string for a character.
 * Used verbatim in every image prompt that features this character.
 *
 * Example output:
 *   "Karim: a 7-year-old Uzbek boy with short dark hair and warm brown eyes,
 *    wearing a traditional blue doppi hat and a green chapan coat, friendly smile"
 */
function buildVisualSeed(character: Character): string {
  return `${character.name}: ${character.visualSeed}`;
}

/**
 * Strips any previous style suffix from a prompt so we never double-append.
 */
function stripStyleSuffix(prompt: string): string {
  return prompt
    .replace(/,?\s*Disney Pixar.*?image[^,]*/gi, "")
    .replace(/,?\s*warm watercolor.*$/i, "")
    .replace(/,?\s*child-friendly.*$/i, "")
    .replace(/,?\s*storybook art style.*$/i, "")
    .replace(/,?\s*no text overlay.*$/i, "")
    .trim()
    .replace(/,+$/, "")
    .trim();
}

// ── Core functions ────────────────────────────────────────

/**
 * Injects character visual seeds and the Pixar style suffix into every
 * ImagePrompt in the list.
 *
 * Prompt structure:
 *   [CHARACTERS: <seed1>; <seed2>] <base scene description>,
 *   <Pixar style suffix>.
 *   Negative: <negative guidance>.
 */
export function injectCharacterSeeds(
  imagePrompts: ImagePrompt[],
  characters: Character[]
): ImagePrompt[] {
  // Build a case-insensitive lookup: "karim" → Character
  const characterMap = new Map<string, Character>(
    characters.map((c) => [c.name.toLowerCase().trim(), c])
  );

  return imagePrompts.map((prompt) => {
    // 1. Strip any existing style suffix so we start clean
    const basePrompt = stripStyleSuffix(prompt.prompt);

    // 2. Resolve characters that appear in this scene
    const sceneCharacters: Character[] = [];

    // Try exact match first, then partial match
    for (const nameInPrompt of prompt.characters) {
      const lower = nameInPrompt.toLowerCase().trim();
      const exact = characterMap.get(lower);
      if (exact) {
        sceneCharacters.push(exact);
        continue;
      }
      // Partial match: character whose name appears within the prompt name
      for (const [key, char] of characterMap) {
        if (lower.includes(key) || key.includes(lower)) {
          sceneCharacters.push(char);
          break;
        }
      }
    }

    // 3. Build character seed block
    const characterBlock =
      sceneCharacters.length > 0
        ? `[CHARACTERS: ${sceneCharacters.map(buildVisualSeed).join("; ")}] `
        : "";

    // 4. Assemble final prompt
    const finalPrompt =
      `${characterBlock}${basePrompt}, ${PIXAR_STYLE}. Negative: ${NEGATIVE_GUIDANCE}`;

    return {
      ...prompt,
      prompt: finalPrompt,
    };
  });
}

/**
 * Returns the names of characters referenced in imagePrompts that have
 * no matching entry in the characters array.
 */
export function findMissingCharacterSeeds(
  imagePrompts: ImagePrompt[],
  characters: Character[]
): string[] {
  const known = new Set(characters.map((c) => c.name.toLowerCase().trim()));
  const missing: string[] = [];

  for (const prompt of imagePrompts) {
    for (const name of prompt.characters) {
      const lower = name.toLowerCase().trim();
      if (!known.has(lower) && !missing.includes(name)) {
        missing.push(name);
      }
    }
  }

  return missing;
}

/**
 * Post-processes a full StoryPackage to apply character consistency
 * across all image prompts.  Used by the story orchestrator (Phase 1)
 * and also called before sending prompts to the image API (Phase 3).
 */
export function applyCharacterConsistency(pkg: StoryPackage): StoryPackage {
  if (!pkg.imagePrompts?.length) return pkg;

  const characters = pkg.characters ?? [];
  const enrichedPrompts = injectCharacterSeeds(pkg.imagePrompts, characters);

  return { ...pkg, imagePrompts: enrichedPrompts };
}

/**
 * Builds a single enriched prompt string for a specific scene, ready
 * to be sent to the image API.
 */
export function buildImagePromptForScene(
  sceneIndex: number,
  pkg: StoryPackage
): string | null {
  const prompt = pkg.imagePrompts.find((p) => p.scene === sceneIndex);
  if (!prompt) return null;

  const [enriched] = injectCharacterSeeds([prompt], pkg.characters ?? []);
  return enriched?.prompt ?? null;
}
