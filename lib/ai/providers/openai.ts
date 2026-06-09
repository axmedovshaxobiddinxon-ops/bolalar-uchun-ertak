// ============================================================
// OpenAI Text AI Provider
// Implements TextAIProvider interface using GPT-4o
// ============================================================

import type { TextAIProvider } from "@/types";
import { AI_CONFIG } from "@/config/ai-providers";

export class OpenAIProvider implements TextAIProvider {
  name = "openai";
  private apiKey: string;
  private model: string;

  constructor() {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error(
        "OPENAI_API_KEY environment variable is not set. " +
          "Please add it to your .env.local file."
      );
    }
    this.apiKey = key;
    this.model = AI_CONFIG.text.model;
  }

  async generateStory(systemPrompt: string, userPrompt: string): Promise<string> {
    const requestBody = {
      model: this.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: AI_CONFIG.text.temperature,
      max_tokens: AI_CONFIG.text.maxTokens,
      response_format: { type: "json_object" },
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(90_000), // 90 second timeout
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "unknown error");

      if (response.status === 401) {
        throw new Error("OpenAI API key is invalid or expired.");
      }
      if (response.status === 429) {
        throw new Error(
          "OpenAI rate limit exceeded. Please wait a moment and try again."
        );
      }
      if (response.status === 503 || response.status === 502) {
        throw new Error("OpenAI service is temporarily unavailable. Please try again.");
      }

      throw new Error(`OpenAI API error ${response.status}: ${errorBody}`);
    }

    const data = await response.json();

    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI returned an empty response.");
    }

    return content;
  }
}
