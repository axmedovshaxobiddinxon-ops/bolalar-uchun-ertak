// ============================================================
// Prompt Builder
// Assembles system and user prompts from templates + config
// ============================================================

import fs from "fs";
import path from "path";
import type { GenerateRequest } from "@/types";
import { EDUCATIONAL_VALUES } from "@/config/educational-values";

const PROMPT_VERSION = "v1.0.0";
const PROMPTS_DIR = path.join(process.cwd(), "prompts");

function readPromptFile(filename: string): string {
  const filePath = path.join(PROMPTS_DIR, filename);
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    console.error(`Failed to read prompt file: ${filePath}`, err);
    throw new Error(`Prompt file not found: ${filename}`);
  }
}

/** Reads age profile data */
function getAgeProfile(ageCategory: string) {
  const profilesPath = path.join(PROMPTS_DIR, "age-profiles.json");
  const raw = fs.readFileSync(profilesPath, "utf-8");
  const data = JSON.parse(raw);
  return (
    data.profiles[ageCategory] || {
      guidance: "Use age-appropriate language.",
      minStoryWords: 500,
      maxStoryWords: 900,
    }
  );
}

/** Reads length profile data */
function getLengthProfile(storyLength: string) {
  const profilesPath = path.join(PROMPTS_DIR, "age-profiles.json");
  const raw = fs.readFileSync(profilesPath, "utf-8");
  const data = JSON.parse(raw);
  return (
    data.lengthProfiles[storyLength] || {
      uzbekLabel: "O'rta",
      minWords: 500,
      maxWords: 900,
    }
  );
}

/** Reads values descriptions for the prompt */
function buildValuesDescription(valueIds: string[]): string {
  if (!valueIds || valueIds.length === 0) return "";

  const lines = valueIds.map((id) => {
    const def = EDUCATIONAL_VALUES.find((v) => v.id === id);
    if (!def) return `- ${id}`;
    return `- ${def.uzbekLabel} (${def.englishLabel}): ${def.description}`;
  });

  return lines.join("\n");
}

// ── Public API ────────────────────────────────────────────

/** Assembles the full system prompt */
export function buildSystemPrompt(): string {
  const system = readPromptFile("system.txt");
  const safetyRules = readPromptFile("safety-rules.txt");
  const schemaDescription = `
OUTPUT SCHEMA:
Return ONLY a valid JSON object with these fields:
- title (string, Uzbek)
- ageCategory ("4-6" | "7-9" | "10-12")
- summary (string, Uzbek, 3-5 sentences)
- story (string, Uzbek, full narrative following 6-part structure)
- moralLesson (string, Uzbek)
- educationalValues (array of value IDs)
- characters (array of {name, role, visualSeed})
- imagePrompts (array of {scene, storyReference, prompt, style, characters})
- videoScenes (array of {scene, duration, description, narration, cameraMovement, mood})
- hashtags ({uzbek: string[], english: string[]})
- parentNote (string, Uzbek)

IMPORTANT: Return ONLY the JSON object. No markdown. No explanation. No backticks.
`;

  return [system, "\n\n", safetyRules, "\n\n", schemaDescription].join("");
}

/** Assembles the user prompt from the template, interpolating request values */
export function buildUserPrompt(request: GenerateRequest): string {
  const template = readPromptFile("user-template.txt");
  const safetyRules = readPromptFile("safety-rules.txt");

  const ageCategory = request.ageOverride || "7-9";
  const storyLength = request.storyLength || "medium";
  const ageProfile = getAgeProfile(ageCategory);
  const lengthProfile = getLengthProfile(storyLength);

  const emphasizedValues =
    request.emphasizedValues && request.emphasizedValues.length > 0
      ? request.emphasizedValues
      : ["ezgulik", "dostlik"]; // default values

  const ageGuidance = `
Age-specific guidance: ${ageProfile.guidance}
Vocabulary complexity: ${ageProfile.vocabularyComplexity}
Maximum sentence length: ${ageProfile.maxSentenceWords} words
Story length range: ${lengthProfile.minWords}–${lengthProfile.maxWords} words
`;

  const lengthGuidance = `
Story length: ${lengthProfile.uzbekLabel}
Target word count: ${lengthProfile.minWords}–${lengthProfile.maxWords} words
Image prompts to generate: ${storyLength === "short" ? "3-5" : storyLength === "medium" ? "5-7" : "7-10"}
Video scenes to generate: ${storyLength === "short" ? "3-5" : storyLength === "medium" ? "5-6" : "6-8"}
`;

  const valuesDescription = buildValuesDescription(emphasizedValues);

  let prompt = template
    .replace("{{TOPIC}}", request.topic)
    .replace("{{AGE_CATEGORY}}", ageCategory)
    .replace("{{AGE_GUIDANCE}}", ageGuidance)
    .replace("{{STORY_LENGTH}}", storyLength)
    .replace("{{LENGTH_GUIDANCE}}", lengthGuidance)
    .replace("{{EMPHASIZED_VALUES}}", emphasizedValues.join(", "))
    .replace("{{VALUES_DESCRIPTIONS}}", valuesDescription ? `Value details:\n${valuesDescription}` : "")
    .replace("{{SAFETY_RULES}}", safetyRules)
    .replace("{{MIN_WORDS}}", String(lengthProfile.minWords));

  return prompt;
}

export { PROMPT_VERSION };
