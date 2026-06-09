// ============================================================
// Content Safety Validator
// Checks generated StoryPackage against all 7 prohibition rules
// ============================================================

import type { SafetyCheckResult, SafetyViolation, StoryPackage } from "@/types";

// ── Pattern banks ─────────────────────────────────────────

const VIOLENCE_PATTERNS = [
  /\b(urdi|urmoq|urib|urish|kaltakladi|kaltakla|qon|qonli|yaralandi|o[''']ldirdi|o[''']ldirmoq|qurol|bolta|pichoq|o[''']q|otmoq|jangovar|jang|urush|hujum|zo[''']ravonlik)\b/i,
  /\b(kill|killed|killing|murder|weapon|gun|knife|sword|attack|fight|violence|blood|wound|harm|hurt|punch|hit|beat|stab|shoot)\b/i,
];

const HORROR_PATTERNS = [
  /\b(dahshat|qo[''']rqinchli|arvoh|jin|shayton|yomonlik|qabr|o[''']lim|o[''']lik|mushuk|dahshatli|qo[''']rqdi)\b/i,
  /\b(horror|scary|terrifying|ghost|demon|devil|death|dead|grave|nightmare|fear|monster|evil|darkness)\b/i,
];

const CRUDE_LANGUAGE_PATTERNS = [
  /\b(la[''']nat|ahmoq|tentak|eshak|qarg[''']ish|so[''']k|haqorat)\b/i,
  /\b(fuck|shit|damn|hell|ass|bitch|bastard|crap|idiot|stupid|dumb|moron)\b/i,
];

const NEGATIVE_ENDING_PATTERNS = [
  /\b(yig[''']lab|yig[''']ladi|g[''']amgin|muvaffaqiyatsiz|yutqazdi|mag[''']lub|umidsiz|baxtsiz|shikoyat|achinarli)\b.*$/is,
];

const INAPPROPRIATE_PATTERNS = [
  /\b(alkogol|aroq|pivo|vino|spirt|narkotik|giyohvand|qimor|gashish|efedrin)\b/i,
  /\b(alcohol|beer|wine|vodka|drug|gambling|casino|cigarette|tobacco|porn|sex)\b/i,
];

// ── Checker functions ─────────────────────────────────────

function checkPatterns(text: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

function checkNoViolence(pkg: StoryPackage): SafetyViolation | null {
  const combined = [pkg.story, pkg.summary, pkg.moralLesson].join(" ");
  if (checkPatterns(combined, VIOLENCE_PATTERNS)) {
    return {
      rule: "NO_VIOLENCE",
      severity: "block",
      detail: "Story contains potentially violent content",
    };
  }
  return null;
}

function checkNoHorror(pkg: StoryPackage): SafetyViolation | null {
  const combined = [pkg.story, pkg.summary].join(" ");
  if (checkPatterns(combined, HORROR_PATTERNS)) {
    return {
      rule: "NO_HORROR",
      severity: "block",
      detail: "Story contains potentially frightening/horror content",
    };
  }
  return null;
}

function checkNoCrudeLanguage(pkg: StoryPackage): SafetyViolation | null {
  const combined = [pkg.story, pkg.summary, pkg.moralLesson, pkg.parentNote].join(" ");
  if (checkPatterns(combined, CRUDE_LANGUAGE_PATTERNS)) {
    return {
      rule: "NO_CRUDE_LANGUAGE",
      severity: "block",
      detail: "Story contains crude or offensive language",
    };
  }
  return null;
}

function checkPositiveEnding(pkg: StoryPackage): SafetyViolation | null {
  // Extract the last 20% of the story as the "ending"
  const story = pkg.story;
  const endingStart = Math.floor(story.length * 0.75);
  const ending = story.slice(endingStart);
  if (checkPatterns(ending, NEGATIVE_ENDING_PATTERNS)) {
    return {
      rule: "NO_NEGATIVE_ENDING",
      severity: "block",
      detail: "Story ending appears to be negative or sad",
    };
  }
  return null;
}

function checkNoInappropriateContent(pkg: StoryPackage): SafetyViolation | null {
  const combined = [pkg.story, pkg.summary].join(" ");
  if (checkPatterns(combined, INAPPROPRIATE_PATTERNS)) {
    return {
      rule: "NO_AGE_INAPPROPRIATE",
      severity: "block",
      detail: "Story contains age-inappropriate content",
    };
  }
  return null;
}

function checkHasMoralLesson(pkg: StoryPackage): SafetyViolation | null {
  if (!pkg.moralLesson || pkg.moralLesson.trim().length < 20) {
    return {
      rule: "HAS_MORAL_LESSON",
      severity: "block",
      detail: "Story is missing a moral lesson",
    };
  }
  return null;
}

function checkHasEducationalValue(pkg: StoryPackage): SafetyViolation | null {
  if (!pkg.educationalValues || pkg.educationalValues.length === 0) {
    return {
      rule: "HAS_EDUCATIONAL_VALUE",
      severity: "warn",
      detail: "Story does not specify educational values",
    };
  }
  return null;
}

function checkRequiredFields(pkg: StoryPackage): SafetyViolation | null {
  const required = ["title", "ageCategory", "summary", "story", "moralLesson"] as const;
  for (const field of required) {
    if (!pkg[field] || String(pkg[field]).trim().length === 0) {
      return {
        rule: "REQUIRED_FIELD_MISSING",
        severity: "block",
        detail: `Required field '${field}' is missing or empty`,
      };
    }
  }
  return null;
}

function checkCharactersExist(pkg: StoryPackage): SafetyViolation | null {
  if (!pkg.characters || pkg.characters.length === 0) {
    return {
      rule: "CHARACTERS_MISSING",
      severity: "warn",
      detail: "No characters were defined in the story",
    };
  }
  return null;
}

function checkImagePromptsExist(pkg: StoryPackage): SafetyViolation | null {
  if (!pkg.imagePrompts || pkg.imagePrompts.length < 3) {
    return {
      rule: "IMAGE_PROMPTS_INSUFFICIENT",
      severity: "warn",
      detail: "Fewer than 3 image prompts were generated",
    };
  }
  return null;
}

// ── Main validator ─────────────────────────────────────────

/**
 * Validates a StoryPackage against all content safety rules.
 * Returns a SafetyCheckResult with all violations found.
 * Block-severity violations should trigger a retry.
 */
export function validateStoryPackage(pkg: StoryPackage): SafetyCheckResult {
  const checkers = [
    checkRequiredFields,
    checkNoViolence,
    checkNoHorror,
    checkNoCrudeLanguage,
    checkPositiveEnding,
    checkNoInappropriateContent,
    checkHasMoralLesson,
    checkHasEducationalValue,
    checkCharactersExist,
    checkImagePromptsExist,
  ];

  const violations: SafetyViolation[] = [];

  for (const checker of checkers) {
    const violation = checker(pkg);
    if (violation) violations.push(violation);
  }

  const hasBlockViolation = violations.some((v) => v.severity === "block");

  return {
    passed: !hasBlockViolation,
    violations,
  };
}
