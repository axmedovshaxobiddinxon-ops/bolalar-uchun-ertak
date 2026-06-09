// Output schema definition for AI response validation
// This mirrors the JSON Schema but as a TypeScript object for use in code

export const OUTPUT_SCHEMA_DESCRIPTION = `
Return ONLY a JSON object with these exact fields:
{
  "title": "string (Uzbek story title, 5-100 chars)",
  "ageCategory": "4-6" | "7-9" | "10-12",
  "summary": "string (3-5 sentences in Uzbek)",
  "story": "string (full story in Uzbek, minimum 300 words, following 6-part structure)",
  "moralLesson": "string (1-3 sentences in Uzbek)",
  "educationalValues": ["array of value IDs"],
  "characters": [{"name": "string", "role": "protagonist|mentor|antagonist|supporting", "visualSeed": "string in English"}],
  "imagePrompts": [{"scene": 1, "storyReference": "string in Uzbek", "prompt": "string in English", "style": "string", "characters": ["names"]}],
  "videoScenes": [{"scene": 1, "duration": "string", "description": "string in English", "narration": "string in Uzbek", "cameraMovement": "string", "mood": "string"}],
  "hashtags": {"uzbek": ["#tag1", ...], "english": ["#tag1", ...]},
  "parentNote": "string in Uzbek"
}
`;

export const REQUIRED_FIELDS = [
  "title",
  "ageCategory",
  "summary",
  "story",
  "moralLesson",
  "educationalValues",
  "characters",
  "imagePrompts",
  "videoScenes",
  "hashtags",
  "parentNote",
] as const;

export type RequiredField = (typeof REQUIRED_FIELDS)[number];
