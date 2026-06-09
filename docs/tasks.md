# Tasks — AI-Powered Uzbek Children's Story Generator

## Overview

Implementation is divided into **4 phases**, each building on the previous. Every phase is independently deployable and delivers real user value.

| Phase | Name                          | Deliverable                                      | Est. Duration |
|-------|-------------------------------|--------------------------------------------------|---------------|
| 1     | Foundation & Core Generation  | Working story generator (text only)              | 1–2 weeks     |
| 2     | UX Polish & Resilience        | Streaming, history, export, multi-provider       | 1 week        |
| 3     | AI Image Generation           | Auto-generated illustrations per scene           | 1–2 weeks     |
| 4     | AI Video Generation           | Full animated story video with narration         | 2–3 weeks     |

---

## Phase 1 — Foundation & Core Story Generation

**Goal:** A working end-to-end application where a user types a topic and receives a complete structured story package in Uzbek.

---

### 1.1 Project Setup

- [ ] **TASK-001** — Initialise Next.js 14 project with TypeScript and App Router
  - `npx create-next-app@latest bolalar-uchun-ertak --typescript --tailwind --app`
  - Confirm folder structure matches `design.md §10`

- [ ] **TASK-002** — Configure Tailwind CSS with custom design tokens
  - Primary colour palette: warm, child-friendly (saffron, sky blue, soft green)
  - Typography: Nunito or Baloo 2 (Google Fonts) — rounded, readable for children's content
  - Dark mode: `class` strategy

- [ ] **TASK-003** — Set up ESLint + Prettier with consistent rules
  - `.eslintrc.json`, `.prettierrc` committed to repo

- [ ] **TASK-004** — Create `.env.example` with all required variables
  ```
  TEXT_AI_PROVIDER=openai
  TEXT_AI_MODEL=gpt-4o
  OPENAI_API_KEY=
  IMAGE_AI_PROVIDER=        # leave blank — Phase 3
  VIDEO_AI_PROVIDER=        # leave blank — Phase 4
  ```

- [ ] **TASK-005** — Install core dependencies
  ```
  next react react-dom typescript tailwindcss
  lucide-react framer-motion
  openai
  uuid
  zod
  ```

---

### 1.2 TypeScript Types & Configuration

- [ ] **TASK-006** — Create `types/index.ts` with all data models from `design.md §5`
  - `AgeCategory`, `EducationalValue`, `Character`, `ImagePrompt`, `VideoScene`, `StoryPackage`
  - `GenerateRequest`, `GenerateResponse`
  - `AppState`, `AppAction` (for useReducer)

- [ ] **TASK-007** — Create `config/educational-values.ts`
  - Map of value ID → Uzbek label → English label → description
  - Used for UI display and prompt injection

- [ ] **TASK-008** — Create `config/ai-providers.ts`
  - Read from environment variables
  - Export `AI_CONFIG` object (see `design.md §7.3`)

---

### 1.3 AI Prompt System

- [ ] **TASK-009** — Create `prompts/system.txt`
  - Expert children's author + educator + psychologist persona in Uzbek
  - Instruction to output valid JSON matching the output schema
  - Embed content from existing `AI_PROMPT.md.txt` safety rules

- [ ] **TASK-010** — Create `prompts/user-template.txt`
  - Template with `{{TOPIC}}`, `{{AGE_CATEGORY}}`, `{{EMPHASIZED_VALUES}}` placeholders
  - Instruct AI to produce full `StoryPackage` JSON

- [ ] **TASK-011** — Create `prompts/output-schema.json`
  - JSON Schema defining the exact structure AI must return
  - All required fields: title, ageCategory, summary, story, moralLesson, characters, imagePrompts, videoScenes, hashtags, parentNote

- [ ] **TASK-012** — Create `prompts/age-profiles.json`
  - Age 4–6: vocabulary ≤ 500 unique words, sentences ≤ 8 words, story ≤ 600 words
  - Age 7–9: moderate vocabulary, story 600–900 words
  - Age 10–12: richer vocabulary, story 900–1300 words

- [ ] **TASK-013** — Create `prompts/values-map.json`
  - Each of the 10 educational values with description, example story elements, and Uzbek keywords

- [ ] **TASK-014** — Create `prompts/safety-rules.txt`
  - All 7 prohibition rules from `requirements.md §3.3` in prompt-ready format
  - Formatted for injection into both system and user prompts

---

### 1.4 Backend — AI Provider Implementation

- [ ] **TASK-015** — Create `lib/ai/providers/openai.ts`
  - Implement `TextAIProvider` interface
  - Use OpenAI SDK with `response_format: { type: 'json_object' }`
  - Handle API errors, timeout, and rate limit errors with typed exceptions

- [ ] **TASK-016** — Create `lib/prompts/builder.ts`
  - `buildSystemPrompt()` — reads and assembles `system.txt` + `safety-rules.txt`
  - `buildUserPrompt(request)` — interpolates template with topic, age, values

- [ ] **TASK-017** — Create `lib/ai/safety-validator.ts`
  - Implement all `SAFETY_RULES` from `design.md §9`
  - `validateStoryPackage(pkg): SafetyCheckResult`
  - Returns list of violations with severity
  - Block-severity violations trigger a retry

- [ ] **TASK-018** — Create `lib/ai/character-consistency.ts`
  - `extractCharacters(story: string): Character[]` — parse character names and descriptions
  - `injectCharacterSeeds(imagePrompts, characters): ImagePrompt[]`
  - Append shared style suffix to all image prompts

- [ ] **TASK-019** — Create `lib/ai/orchestrator.ts`
  - Full `generateStory(request): Promise<StoryPackage>` pipeline
  - Steps: validate → build prompts → call AI → parse JSON → safety check (retry ≤2) → character consistency → return
  - Adds `id` (UUID), `generatedAt`, `metadata.wordCount`, `metadata.readingTimeMinutes`

---

### 1.5 Backend — API Route

- [ ] **TASK-020** — Create `app/api/generate/route.ts`
  - `POST` handler
  - Parse + validate request body using Zod schema
  - Call `orchestrator.generateStory()`
  - Return `GenerateResponse` (success or error)
  - Add basic rate limiting (10 requests/min per IP)

- [ ] **TASK-021** — Create `app/api/health/route.ts`
  - `GET` handler returning `{ status: 'ok', timestamp }` for uptime monitoring

---

### 1.6 Frontend — Layout & Global UI

- [ ] **TASK-022** — Create `app/layout.tsx`
  - Font import (Nunito / Baloo 2)
  - Metadata (Uzbek title, description, og:image)
  - `ThemeProvider` wrapper

- [ ] **TASK-023** — Create `components/ui/ThemeToggle.tsx`
  - Light/dark toggle with sun/moon icons (Lucide)
  - Persists preference to localStorage

- [ ] **TASK-024** — Create `components/layout/Header.tsx`
  - Logo + app name "Bolalar Uchun Ertak"
  - `ThemeToggle` in top-right corner

- [ ] **TASK-025** — Create `components/layout/Footer.tsx`
  - Brief tagline in Uzbek
  - Educational values badge strip

---

### 1.7 Frontend — Generator Panel

- [ ] **TASK-026** — Create `components/generator/TopicInput.tsx`
  - `<textarea>` with Uzbek placeholder: *"Mavzu yoki g'oya kiriting... (masalan: Yaxshilik qilgan bola)"*
  - Character counter (max 500)
  - Subtle animated border on focus

- [ ] **TASK-027** — Create `components/generator/AgeSelector.tsx`
  - Three toggle buttons: "4–6 yosh", "7–9 yosh", "10–12 yosh"
  - Optional — label: *"Yosh toifasini tanlang (ixtiyoriy)"*
  - Active state styling

- [ ] **TASK-028** — Create `components/generator/ValuesPicker.tsx`
  - Grid of 10 chip buttons, one per educational value
  - Multi-select enabled
  - Uzbek label for each value

- [ ] **TASK-029** — Create `components/generator/GenerateButton.tsx`
  - Primary CTA: *"Ertak Yaratish 🪄"*
  - Disabled + spinner state during generation
  - Pulse animation on hover when idle

- [ ] **TASK-030** — Create `components/generator/GeneratorPanel.tsx`
  - Compose TopicInput + AgeSelector + ValuesPicker + GenerateButton
  - Connects to app state

---

### 1.8 Frontend — State Management

- [ ] **TASK-031** — Create `app/context/AppContext.tsx`
  - `AppState` interface and `AppAction` union type
  - `useReducer` with actions: `SET_TOPIC`, `SET_AGE`, `SET_VALUES`, `GENERATE_START`, `GENERATE_SUCCESS`, `GENERATE_ERROR`, `ADD_TO_HISTORY`
  - Export `useApp()` hook

---

### 1.9 Frontend — Output Display

- [ ] **TASK-032** — Create `components/ui/CopyButton.tsx`
  - Icon button (Lucide `Copy` → `Check` on success)
  - Copies provided text to clipboard
  - 2-second success feedback

- [ ] **TASK-033** — Create `components/output/OutputSection.tsx`
  - Reusable section card: title, emoji icon, content area, `CopyButton`
  - Collapsible (open by default)
  - Framer Motion fade-in on mount

- [ ] **TASK-034** — Create `components/output/ImagePromptsSection.tsx`
  - Numbered list of image prompts
  - Each prompt: scene number, story reference badge, full prompt text, copy button
  - Placeholder image thumbnail slot (Phase 3 will fill this)

- [ ] **TASK-035** — Create `components/output/VideoScenesSection.tsx`
  - Card per scene: scene number, duration badge, description, narration text, camera movement, mood
  - Copy full scene button
  - Placeholder video thumbnail slot (Phase 4)

- [ ] **TASK-036** — Create `components/output/HashtagsSection.tsx`
  - Two groups: Uzbek hashtags, English hashtags
  - Pill/tag chips with individual copy-on-click
  - "Copy all hashtags" button

- [ ] **TASK-037** — Create `components/output/StoryOutput.tsx`
  - Orchestrates all output sections in order from `requirements.md §3.5`
  - Framer Motion stagger animation (sections reveal sequentially)
  - Scroll-to-top button

---

### 1.10 Frontend — Main Page

- [ ] **TASK-038** — Create `app/page.tsx`
  - Compose Header + HeroSection + GeneratorPanel + StoryOutput + Footer
  - Wire up `useApp()` context
  - Call `POST /api/generate` on form submit
  - Handle loading, success, and error states

- [ ] **TASK-039** — Create loading overlay component `components/ui/LoadingOverlay.tsx`
  - Animated progress with rotating book/star icon
  - Rotating Uzbek loading messages: *"Ertak yozilmoqda..."*, *"Qahramonlar tanlanmoqda..."*, *"Saboq tayyorlanmoqda..."*

---

### 1.11 Phase 1 — Quality & Testing

- [ ] **TASK-040** — Manual end-to-end test: enter 5 different topics, verify all 9 output sections are populated
- [ ] **TASK-041** — Test content safety validator with intentionally problematic topics, verify blocks work
- [ ] **TASK-042** — Test rate limiting: exceed 10 requests/min, verify 429 response
- [ ] **TASK-043** — Test character consistency: verify all image prompts include character visual seeds
- [ ] **TASK-044** — Cross-browser test: Chrome, Firefox, Safari, mobile viewport

---

## Phase 2 — UX Polish, Resilience & Export

**Goal:** Production-quality UX with streaming responses, session history, PDF/JSON export, section regeneration, and a second AI provider fallback.

---

### 2.1 Streaming AI Responses

- [ ] **TASK-045** — Modify `app/api/generate/route.ts` to use `Response` streaming
  - Stream tokens section-by-section as AI generates them
  - Use `ReadableStream` with server-sent events (SSE) or chunked JSON

- [ ] **TASK-046** — Update `app/page.tsx` to consume streaming response
  - Sections appear progressively as they complete
  - Loading state per-section, not full-page

---

### 2.2 Section Regeneration

- [ ] **TASK-047** — Create `app/api/regenerate-section/route.ts`
  - Accepts `{ storyId, section: keyof StoryPackage, existingPackage }`
  - Regenerates only the requested section using existing story context
  - Returns updated section content

- [ ] **TASK-048** — Add regenerate button (🔄) to each `OutputSection`
  - Triggers section-level regeneration without re-generating the full story

---

### 2.3 Session History

- [ ] **TASK-049** — Create `lib/utils/local-storage.ts`
  - `saveStory(pkg: StoryPackage): void` — prepend to history array (max 20 entries)
  - `loadHistory(): StoryPackage[]`
  - `deleteStory(id: string): void`
  - `clearHistory(): void`

- [ ] **TASK-050** — Create `components/ui/HistoryDrawer.tsx`
  - Slide-out panel from right side
  - List of past stories: title, date, age category chip
  - Click to reload a story into the output panel
  - Delete individual + clear all buttons

- [ ] **TASK-051** — Integrate history: auto-save on successful generation, load on page mount

---

### 2.4 PDF Export

- [ ] **TASK-052** — Install `@react-pdf/renderer`
- [ ] **TASK-053** — Create `lib/utils/export-pdf.ts`
  - PDF document template following `design.md §11.1`
  - Cover page, story sections, moral lesson callout box, image prompts, hashtags, parent note
  - Child-friendly styling: rounded corners, warm colours, readable font

- [ ] **TASK-054** — Add "PDF yuklab olish" button to `ExportBar`
  - Triggers PDF generation and browser download

---

### 2.5 JSON Export

- [ ] **TASK-055** — Create `lib/utils/export-json.ts`
  - Serialise `StoryPackage` to formatted JSON
  - Trigger browser download as `{title}-{date}.json`

- [ ] **TASK-056** — Add "JSON yuklab olish" button to `ExportBar`

---

### 2.6 Create ExportBar Component

- [ ] **TASK-057** — Create `components/output/ExportBar.tsx`
  - Sticky bar at bottom of output panel
  - Buttons: Copy All, Download PDF, Download JSON

---

### 2.7 Multi-Provider Fallback (Gemini)

- [ ] **TASK-058** — Create `lib/ai/providers/gemini.ts`
  - Implement `TextAIProvider` interface using Google Generative AI SDK
  - Same input/output contract as OpenAI provider

- [ ] **TASK-059** — Add fallback logic to `orchestrator.ts`
  - If primary provider fails (timeout / API error), auto-retry with fallback provider
  - Log which provider was used in `metadata.aiModel`

---

### 2.8 Phase 2 Quality

- [ ] **TASK-060** — Test streaming: verify sections appear progressively in browser
- [ ] **TASK-061** — Test PDF export: verify all sections render correctly, Uzbek text displays properly
- [ ] **TASK-062** — Test history: save 5 stories, reload one, delete one, verify localStorage state
- [ ] **TASK-063** — Test Gemini fallback: disable OpenAI key, verify Gemini activates automatically

---

## Phase 3 — AI Image Generation

**Goal:** Automatically generate child-friendly illustrations for each scene using an AI image model.

---

### 3.1 Image Provider Implementation

- [ ] **TASK-064** — Define `ImageAIProvider` interface in `types/index.ts`
  - `generateImage(prompt: string, options: ImageOptions): Promise<ImageResult>`

- [ ] **TASK-065** — Create `lib/ai/providers/dalle.ts`
  - Implement `ImageAIProvider` using OpenAI DALL-E 3 API
  - Options: size `1024x1024`, quality `hd`, style `vivid`

- [ ] **TASK-066** — Create `lib/ai/providers/stable-diffusion.ts`
  - Implement `ImageAIProvider` using Replicate API (Stable Diffusion XL)
  - Alternative to DALL-E for cost optimisation

---

### 3.2 Image Generation API Route

- [ ] **TASK-067** — Create `app/api/generate-images/route.ts`
  - Accepts `{ imagePrompts: ImagePrompt[], characters: Character[] }`
  - For each prompt: inject character seeds → call image provider → return URLs
  - Rate limit: 5 requests/min per IP
  - Return `{ images: ImageResult[] }`

- [ ] **TASK-068** — Add image generation trigger to `app/page.tsx`
  - After story text is displayed, automatically call `/api/generate-images`
  - Images load in background — non-blocking

---

### 3.3 Image Display Components

- [ ] **TASK-069** — Update `components/output/ImagePromptsSection.tsx`
  - Show skeleton loader while image generates
  - Display generated image when ready
  - Image aspect ratio: square (1:1) with rounded corners

- [ ] **TASK-070** — Create `components/output/ImageCard.tsx`
  - Image + prompt text side by side
  - Download image button
  - Regenerate individual image button (🔄)
  - Expand to full-size modal on click

- [ ] **TASK-071** — Create `components/ui/ImageModal.tsx`
  - Full-screen lightbox for viewing images
  - Download + close controls

---

### 3.4 Phase 3 Quality

- [ ] **TASK-072** — Test character consistency: verify same character looks identical across all generated images
- [ ] **TASK-073** — Test image safety: verify child-appropriate imagery only
- [ ] **TASK-074** — Test fallback: if DALL-E fails, verify Stable Diffusion activates
- [ ] **TASK-075** — Performance test: image generation should not block story text display

---

## Phase 4 — AI Video Generation

**Goal:** Generate a complete animated story video with narration, assembled from per-scene AI video clips.

---

### 4.1 Video Provider Implementation

- [ ] **TASK-076** — Define `VideoAIProvider` interface in `types/index.ts`
  - `generateVideoClip(scene: VideoScene, options: VideoOptions): Promise<VideoResult>`

- [ ] **TASK-077** — Create `lib/ai/providers/runway.ts`
  - Implement `VideoAIProvider` using RunwayML Gen-3 API
  - Handle async job submission + polling for completion

- [ ] **TASK-078** — Create `lib/ai/providers/kling.ts`
  - Implement `VideoAIProvider` using Kling AI API
  - Alternative video provider

---

### 4.2 Text-to-Speech Narration

- [ ] **TASK-079** — Create `lib/ai/providers/tts-elevenlabs.ts`
  - `generateNarration(text: string, voice: string): Promise<AudioResult>`
  - Select a warm, child-friendly Uzbek voice

- [ ] **TASK-080** — Create `lib/ai/providers/tts-google.ts`
  - Implement same interface using Google Cloud TTS
  - Fallback narration provider

---

### 4.3 Video Assembly API Route

- [ ] **TASK-081** — Create `app/api/generate-video/route.ts`
  - Accepts `{ videoScenes: VideoScene[], storyId: string }`
  - Submits job to video AI — returns `{ jobId, status: 'processing' }`
  - Rate limit: 2 requests/min per IP

- [ ] **TASK-082** — Create `app/api/video-status/route.ts`
  - `GET /api/video-status?jobId=xxx`
  - Polls provider for completion, returns current status + video URL when ready

- [ ] **TASK-083** — Implement video assembly service `lib/ai/video-assembler.ts`
  - For each scene: generate clip → generate narration audio → merge clip + audio
  - Concatenate all clips in order
  - Add optional background music from child-safe audio library
  - Output final MP4

---

### 4.4 Video Display Components

- [ ] **TASK-084** — Create `components/output/VideoPlayer.tsx`
  - Embedded HTML5 video player (or React player)
  - Controls: play/pause, seek, volume, fullscreen, download

- [ ] **TASK-085** — Update `components/output/VideoScenesSection.tsx`
  - Show individual scene thumbnails when clips are ready
  - "Generate Full Video" button triggers assembly
  - Progress bar for multi-clip assembly

- [ ] **TASK-086** — Add video generation status polling to frontend
  - After job submitted, poll `/api/video-status` every 5 seconds
  - Show animated progress: *"Video tayyorlanmoqda... (3/8 sahna)"*

---

### 4.5 Phase 4 Quality

- [ ] **TASK-087** — Test end-to-end video generation for a 5-scene story
- [ ] **TASK-088** — Test narration audio sync with video clips
- [ ] **TASK-089** — Test download: verify MP4 is well-formed and plays on mobile
- [ ] **TASK-090** — Test fallback: if RunwayML fails, verify Kling activates

---

## Cross-Cutting Tasks (All Phases)

### Security & Reliability

- [ ] **TASK-091** — Add Zod validation schema for all API request bodies
- [ ] **TASK-092** — Add global error boundary `components/ui/ErrorBoundary.tsx`
  - Catches frontend crashes, shows friendly Uzbek error message
- [ ] **TASK-093** — Add input profanity filter (Uzbek + English keyword list)
- [ ] **TASK-094** — Add `X-Content-Type-Options`, `X-Frame-Options`, CSP headers in `next.config.ts`

### Accessibility

- [ ] **TASK-095** — Audit all interactive elements for keyboard navigation
- [ ] **TASK-096** — Add `aria-label` to all icon buttons
- [ ] **TASK-097** — Verify colour contrast ratios meet WCAG 2.1 AA

### Monitoring

- [ ] **TASK-098** — Integrate Sentry for error tracking (frontend + API routes)
- [ ] **TASK-099** — Add Vercel Analytics for page view and generation event tracking
- [ ] **TASK-100** — Add custom logging for AI provider usage, cost tracking, and rate limit hits

### Documentation

- [ ] **TASK-101** — Update `README.md` with setup instructions, environment variables, and deployment guide
- [ ] **TASK-102** — Add inline JSDoc comments to all public functions in `lib/`
- [ ] **TASK-103** — Create `CONTRIBUTING.md` with code style guide and PR workflow

---

## Dependency Map

```
TASK-001 → TASK-002 → TASK-003 → TASK-004 → TASK-005
TASK-006 → TASK-007 → TASK-008
TASK-009 → TASK-010 → TASK-011 → TASK-012 → TASK-013 → TASK-014

TASK-015 ─┐
TASK-016 ─┤
TASK-017 ─┼──► TASK-019 ──► TASK-020  (API route ready)
TASK-018 ─┘

TASK-022 → TASK-023 → TASK-024 → TASK-025
TASK-026 → TASK-027 → TASK-028 → TASK-029 → TASK-030
TASK-031 (context)
TASK-032 → TASK-033 → TASK-034 → TASK-035 → TASK-036 → TASK-037

TASK-020 + TASK-037 + TASK-031 → TASK-038 → TASK-039  (Phase 1 complete)

TASK-038 → TASK-045 → TASK-046  (streaming)
TASK-047 → TASK-048  (section regen)
TASK-049 → TASK-050 → TASK-051  (history)
TASK-052 → TASK-053 → TASK-054  (PDF)
TASK-058 → TASK-059  (Gemini fallback)         (Phase 2 complete)

TASK-064 → TASK-065 → TASK-066 → TASK-067 → TASK-068
TASK-069 → TASK-070 → TASK-071                 (Phase 3 complete)

TASK-076 → TASK-077 → TASK-078
TASK-079 → TASK-080
TASK-081 → TASK-082 → TASK-083
TASK-084 → TASK-085 → TASK-086                 (Phase 4 complete)
```

---

## Definition of Done

A task is considered **done** when:

1. ✅ Code is written and committed
2. ✅ Manual smoke test passes (the feature works as described)
3. ✅ No TypeScript errors (`tsc --noEmit` passes)
4. ✅ No ESLint errors
5. ✅ Uzbek text displays correctly in the browser
6. ✅ Mobile viewport looks correct (375px width minimum)
