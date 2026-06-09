// ============================================================
// Character Consistency Manager
// Ensures all image prompts include the correct character visualSeeds
// ============================================================

import type { Character, ImagePrompt, StoryPackage } from "@/types";

const STYLE_SUFFIX =
  "warm watercolor illustration, child-friendly, Uzbek cultural setting, soft warm colours, storybook art style, no text overlay, no words in image, clean background";

/**
 * Builds a character reference string from a visualSeed.
 * e.g. "Karim: a 7-year-old Uzbek boy with dark hair, wearing a blue doppi hat"
 */
function buildCharacterReference(character: Character): string {
  return `${character.name} — ${character.visualSeed}`;
}

/**
 * Given a list of image prompts and the full character roster,
 * injects the visualSeed for every character referenced in each prompt.
 * Also appends the shared style suffix.
 */
export function injectCharacterSeeds(
  imagePrompts: ImagePrompt[],
  characters: Character[]
): ImagePrompt[] {
  const characterMap = new Map<string, Character>(
    characters.map((c) => [c.name.toLowerCase(), c])
  );

  return imagePrompts.map((prompt) => {
    // Find which characters appear in this scene
    const sceneCharacters = prompt.characters
      .map((name) => characterMap.get(name.toLowerCase()))
      .filter((c): c is Character => c !== undefined);

    if (sceneCharacters.length === 0) {
      // No named characters — just add style suffix
      const cleanPrompt = prompt.prompt.replace(/,?\s*warm watercolor.*$/i, "").trim();
      return {
        ...prompt,
        prompt: `${cleanPrompt}, ${STYLE_SUFFIX}`,
      };
    }

    // Build character seed prefix
    const characterSeeds = sceneCharacters
      .map((c) => buildCharacterReference(c))
      .join("; ");

    // Strip any existing style suffix to avoid duplication
    const basePrompt = prompt.prompt.replace(/,?\s*warm watercolor.*$/i, "").trim();

    const enrichedPrompt = `[Characters: ${characterSeeds}] ${basePrompt}, ${STYLE_SUFFIX}`;

    return {
      ...prompt,
      prompt: enrichedPrompt,
    };
  });
}

/**
 * Validates that all characters referenced in imagePrompts
 * have a corresponding entry in the characters array.
 * Returns names of any missing characters.
 */
export function findMissingCharacterSeeds(
  imagePrompts: ImagePrompt[],
  characters: Character[]
): string[] {
  const characterNames = new Set(characters.map((c) => c.name.toLowerCase()));
  const missing: string[] = [];

  for (const prompt of imagePrompts) {
    for (const name of prompt.characters) {
      if (!characterNames.has(name.toLowerCase())) {
        if (!missing.includes(name)) missing.push(name);
      }
    }
  }

  return missing;
}

/**
 * Post-processes a full StoryPackage to apply character consistency
 * across all image prompts.
 */
export function applyCharacterConsistency(pkg: StoryPackage): StoryPackage {
  if (!pkg.characters?.length || !pkg.imagePrompts?.length) {
    return pkg;
  }

  const enrichedImagePrompts = injectCharacterSeeds(pkg.imagePrompts, pkg.characters);

  return {
    ...pkg,
    imagePrompts: enrichedImagePrompts,
  };
}
