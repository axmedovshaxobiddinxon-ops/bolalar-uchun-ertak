# Design — AI-Powered Uzbek Children's Story Generator

## 1. System Overview

The **Bolalar Uchun Ertak** platform is a full-stack web application with a React-based frontend, a Node.js/Next.js API layer, and a pluggable AI provider system. The architecture is designed to be:

- **Modular** — each generation task (story, images, video) is handled by an independent service module
- **Provider-agnostic** — AI providers can be swapped or combined without rewriting business logic
- **Extensible** — image generation (Phase 3) and video generation (Phase 4) are built into the architecture from day one, even if not yet activated
- **Serverless-ready** — deployable to Vercel, Netlify, or any edge-compute platform

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                             │
│                                                                     │
│   ┌──────────────┐   ┌─────────────────────────────────────────┐   │
│   │  Input Panel │   │           Output Panel                  │   │
│   │  - Topic     │   │  Title │ Age │ Summary │ Story │ Moral  │   │
│   │  - Age select│   │  Hashtags │ Image Prompts │ Video Scenes│   │
│   │  - Values    │   │  Parent Note │ Export (PDF/JSON)        │   │
│   └──────┬───────┘   └─────────────────────────────────────────┘   │
└──────────┼──────────────────────────────────────────────────────────┘
           │ HTTPS POST /api/generate
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     API LAYER (Next.js / Node.js)                   │
│                                                                     │
│   ┌─────────────────────┐    ┌──────────────────────────────────┐  │
│   │  Request Validator  │    │       Rate Limiter               │  │
│   │  - Sanitise input   │    │  - Per-IP throttling             │  │
│   │  - Schema validate  │    │  - Abuse prevention              │  │
│   └─────────┬───────────┘    └──────────────────────────────────┘  │
│             │                                                        │
│             ▼                                                        │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │              Story Orchestrator                             │  │
│   │   Builds system + user prompts → calls AI providers        │  │
│   │   Parses structured JSON response → validates content      │  │
│   └──────┬──────────────────────────────────┬───────────────────┘  │
│          │                                  │                        │
│          ▼ (Phase 1–2)                      ▼ (Phase 3–4 future)    │
│   ┌──────────────────┐            ┌─────────────────────────────┐  │
│   │  Text AI Service │            │    Media AI Service         │  │
│   │  - OpenAI GPT-4o │            │  - Image: DALL-E / SD / etc │  │
│   │  - Gemini (swap) │            │  - Video: RunwayML / Kling  │  │
│   └──────────────────┘            └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Frontend Architecture

### 3.1 Technology Stack

| Layer        | Technology                         | Reason                                             |
|--------------|------------------------------------|----------------------------------------------------|
| Framework    | Next.js 14 (App Router)            | SSR/SSG + API routes in one project                |
| UI Library   | React 18                           | Component model, streaming support                 |
| Styling      | Tailwind CSS                       | Rapid UI, responsive, dark mode built-in           |
| Icons        | Lucide React                       | Lightweight, consistent icon set                   |
| Animations   | Framer Motion                      | Smooth loading states and section reveals          |
| PDF Export   | react-pdf / jsPDF                  | Client-side PDF generation                         |
| State        | React Context + useReducer         | Lightweight, no external lib needed for MVP        |
| HTTP Client  | Native fetch (with SWR for future) | Minimal dependency, streaming-compatible           |

### 3.2 Component Tree

```
<App>
 ├── <ThemeProvider>               ← Dark/light mode context
 ├── <Layout>
 │    ├── <Header>                 ← Logo, language toggle, theme toggle
 │    ├── <main>
 │    │    ├── <HeroSection>       ← Welcome text, platform purpose
 │    │    ├── <GeneratorPanel>    ← Core interaction area
 │    │    │    ├── <TopicInput>   ← Free-text topic entry
 │    │    │    ├── <AgeSelector>  ← Optional age override (4-6, 7-9, 10-12)
 │    │    │    ├── <ValuesPicker> ← Optional educational value emphasis
 │    │    │    └── <GenerateBtn>  ← Submit + loading state
 │    │    ├── <LoadingOverlay>    ← Animated generation progress
 │    │    └── <StoryOutput>       ← Shown after generation completes
 │    │         ├── <OutputSection id="title">
 │    │         ├── <OutputSection id="age">
 │    │         ├── <OutputSection id="summary">
 │    │         ├── <OutputSection id="story">
 │    │         ├── <OutputSection id="moral">
 │    │         ├── <ImagePromptsSection>
 │    │         ├── <VideoScenesSection>
 │    │         ├── <HashtagsSection>
 │    │         ├── <ParentNoteSection>
 │    │         └── <ExportBar>    ← PDF / JSON export buttons
 │    ├── <HistoryDrawer>          ← Slide-out panel with past generations
 │    └── <Footer>
```

### 3.3 State Shape

```typescript
interface AppState {
  // Input
  topic: string;
  ageOverride: AgeCategory | null;       // '4-6' | '7-9' | '10-12' | null
  emphasizedValues: EducationalValue[];

  // Generation status
  status: 'idle' | 'loading' | 'success' | 'error';
  errorMessage: string | null;

  // Output
  storyPackage: StoryPackage | null;

  // History (persisted to localStorage)
  history: StoryPackage[];

  // UI
  theme: 'light' | 'dark';
  activeSection: string | null;         // for scroll tracking
}
```

---

## 4. Backend / API Layer Architecture

### 4.1 API Routes

| Method | Route                    | Description                                  |
|--------|--------------------------|----------------------------------------------|
| POST   | `/api/generate`          | Main story generation endpoint               |
| POST   | `/api/regenerate-section`| Regenerate a single section of a story       |
| POST   | `/api/generate-images`   | (Phase 3) Submit image prompts to image AI   |
| POST   | `/api/generate-video`    | (Phase 4) Submit video scenes to video AI    |
| GET    | `/api/health`            | Health check for monitoring                  |

### 4.2 `/api/generate` Request & Response

**Request Body:**
```typescript
interface GenerateRequest {
  topic: string;                          // User-provided topic (max 500 chars)
  ageOverride?: '4-6' | '7-9' | '10-12'; // Optional age override
  emphasizedValues?: EducationalValue[];  // Optional value emphasis
  language?: 'uz-latn' | 'uz-cyrl';      // Default: 'uz-latn'
}
```

**Response Body:**
```typescript
interface GenerateResponse {
  success: boolean;
  data?: StoryPackage;
  error?: string;
}
```

### 4.3 Story Orchestrator Flow

```
generateStory(request)
  │
  ├── 1. validateInput(request)
  │        └── throws ValidationError if invalid
  │
  ├── 2. buildSystemPrompt()
  │        └── Loads from /prompts/system.txt (editable config file)
  │
  ├── 3. buildUserPrompt(request)
  │        └── Interpolates topic, age, values into template
  │
  ├── 4. callTextAI(systemPrompt, userPrompt)
  │        └── Returns raw JSON string from AI
  │
  ├── 5. parseResponse(rawJson)
  │        └── Validates JSON structure, required fields
  │
  ├── 6. enforceContentSafety(parsed)
  │        └── Checks against prohibited content rules
  │        └── Flags if safety rules are violated
  │
  ├── 7. enforceCharacterConsistency(parsed)
  │        └── Extracts character descriptions from story
  │        └── Injects consistent character seeds into all image prompts
  │
  └── 8. return StoryPackage
```

---

## 5. Data Models

### 5.1 Core Types

```typescript
type AgeCategory = '4-6' | '7-9' | '10-12';

type EducationalValue =
  | 'ezgulik'        // Kindness
  | 'halollik'       // Honesty
  | 'odob-axloq'     // Good Manners
  | 'ilm-marifat'    // Education & Knowledge
  | 'kitobxonlik'    // Love of Reading
  | 'vatanparvarlik' // Patriotism
  | 'ota-ona-hurmat' // Respect for Parents
  | 'ustoz-ehtirom'  // Respect for Teachers
  | 'dostlik'        // Friendship
  | 'mehnatsevarlik' // Hard Work;

interface Character {
  name: string;             // Character's name in Uzbek
  role: string;             // 'protagonist' | 'mentor' | 'antagonist' | 'supporting'
  visualSeed: string;       // Stable English description for image prompts
                            // e.g. "a 7-year-old Uzbek boy with dark hair,
                            //       wearing a traditional doppi hat and blue chapan"
}

interface ImagePrompt {
  scene: number;            // Scene index (1-based)
  storyReference: string;   // Which part of the story this illustrates
  prompt: string;           // Full English prompt for image AI
  style: string;            // e.g. "warm watercolor illustration, child-friendly"
  characters: string[];     // Names of characters appearing in this scene
}

interface VideoScene {
  scene: number;
  duration: string;         // Suggested duration e.g. "5-8 seconds"
  description: string;      // English description for video AI
  narration: string;        // Uzbek narration text for this scene
  cameraMovement: string;   // e.g. "slow pan left to right"
  mood: string;             // e.g. "warm, hopeful, gentle"
}

interface StoryPackage {
  id: string;               // UUID
  generatedAt: string;      // ISO 8601 timestamp
  topic: string;            // Original user input
  title: string;            // Generated Uzbek title
  ageCategory: AgeCategory;
  summary: string;          // 3–5 sentence Uzbek summary
  story: string;            // Full Uzbek story text
  moralLesson: string;      // Moral lesson in Uzbek
  educationalValues: EducationalValue[];  // Values embedded in the story
  characters: Character[];  // Extracted characters with visual seeds
  imagePrompts: ImagePrompt[];
  videoScenes: VideoScene[];
  hashtags: {
    uzbek: string[];        // e.g. ["#bolalaruchun", "#ertak"]
    english: string[];      // e.g. ["#uzbekfairytale", "#kidsbooks"]
  };
  parentNote: string;       // Uzbek note explaining educational value
  metadata: {
    wordCount: number;
    readingTimeMinutes: number;
    aiModel: string;        // e.g. "gpt-4o"
    promptVersion: string;  // e.g. "v1.2.0"
  };
}
```

---

## 6. AI Prompt Architecture

### 6.1 Prompt File Structure

```
/prompts/
  ├── system.txt              ← Master system prompt (editable)
  ├── user-template.txt       ← User prompt template with {{placeholders}}
  ├── safety-rules.txt        ← Injected safety constraints
  ├── values-map.json         ← Value name → description mapping
  ├── age-profiles.json       ← Age-specific language/complexity guidance
  └── output-schema.json      ← Expected JSON output structure
```

### 6.2 System Prompt Strategy

The system prompt instructs the AI to act as:

> "You are an expert children's author, educator, and psychologist specialising in Uzbek language educational fairy tales. Your stories develop moral character, cultural values, and a love of learning in children aged 4–12. You always output a single valid JSON object matching the provided schema."

Key constraints injected into every prompt:
- Language: Uzbek Latin script only for story content; English for image/video prompts
- Safety rules from `safety-rules.txt`
- Output schema from `output-schema.json`
- Age-specific vocabulary guidance from `age-profiles.json`

### 6.3 Character Consistency Mechanism

```
Step 1: AI generates characters[] with visualSeed for each character
Step 2: Post-processor extracts character names appearing in each image prompt
Step 3: Character visualSeeds are prepended to each image prompt
Step 4: All image prompts receive a shared style suffix:
        "...consistent character design, warm watercolor style,
         Uzbek cultural setting, child-friendly illustration"
```

This ensures that even across 10 different image generation calls, the same character looks identical.

---

## 7. AI Provider Abstraction Layer

### 7.1 Design Pattern: Provider Interface

All AI providers implement a common interface, enabling zero-friction swaps:

```typescript
// Text Generation Provider Interface
interface TextAIProvider {
  name: string;
  generateStory(systemPrompt: string, userPrompt: string): Promise<string>;
}

// Image Generation Provider Interface (Phase 3)
interface ImageAIProvider {
  name: string;
  generateImage(prompt: string, options: ImageOptions): Promise<ImageResult>;
}

// Video Generation Provider Interface (Phase 4)
interface VideoAIProvider {
  name: string;
  generateVideoClip(scene: VideoScene, options: VideoOptions): Promise<VideoResult>;
}
```

### 7.2 Supported & Planned Providers

**Text Generation:**
| Provider        | Status    | Notes                                    |
|-----------------|-----------|------------------------------------------|
| OpenAI GPT-4o   | ✅ Phase 1 | Primary provider, best Uzbek quality     |
| Google Gemini   | 🔄 Phase 2 | Fallback / cost optimisation             |
| Anthropic Claude| 🔄 Phase 2 | Alternative fallback                     |
| Local LLM (Ollama) | 🔮 Future | Offline / privacy mode                |

**Image Generation:**
| Provider           | Status    | Notes                                    |
|--------------------|-----------|------------------------------------------|
| OpenAI DALL-E 3    | 🔮 Phase 3 | Best quality, easy API                  |
| Stable Diffusion   | 🔮 Phase 3 | Open source, self-hostable              |
| Midjourney         | 🔮 Phase 3 | Via unofficial API wrapper              |
| Ideogram           | 🔮 Phase 3 | Good for illustrated children's art     |

**Video Generation:**
| Provider        | Status    | Notes                                      |
|-----------------|-----------|--------------------------------------------|
| RunwayML Gen-3  | 🔮 Phase 4 | High quality short clips                  |
| Kling AI        | 🔮 Phase 4 | Good motion from text                     |
| Luma Dream Machine | 🔮 Phase 4 | Alternative                             |

### 7.3 Provider Configuration

```typescript
// config/ai-providers.ts
export const AI_CONFIG = {
  text: {
    provider: process.env.TEXT_AI_PROVIDER || 'openai',
    model: process.env.TEXT_AI_MODEL || 'gpt-4o',
    maxTokens: 4000,
    temperature: 0.85,  // Higher creativity for storytelling
  },
  image: {
    provider: process.env.IMAGE_AI_PROVIDER || null,  // null = disabled
    model: process.env.IMAGE_AI_MODEL || 'dall-e-3',
    size: '1024x1024',
    quality: 'hd',
    style: 'vivid',
  },
  video: {
    provider: process.env.VIDEO_AI_PROVIDER || null,  // null = disabled
    model: process.env.VIDEO_AI_MODEL || 'runway-gen3',
    durationSeconds: 5,
    resolution: '1280x720',
  },
};
```

---

## 8. Security Architecture

### 8.1 API Key Protection

```
Browser  ──────►  /api/generate (Next.js Route Handler)
                       │
                       │  (API keys only here, server-side)
                       ▼
               OpenAI / Gemini API
```

- API keys live **only in server-side environment variables**
- Route handlers act as a secure proxy
- No secrets are ever sent to or accessible from the browser

### 8.2 Input Sanitisation Pipeline

```
User Input → Strip HTML tags → Trim whitespace → Length validation (max 500 chars)
          → Profanity filter (Uzbek + English) → Inject into prompt template
```

### 8.3 Rate Limiting Strategy

```typescript
// Per-IP rate limits
const RATE_LIMITS = {
  generate: { requests: 10, windowMs: 60_000 },      // 10/min per IP
  regenerateSection: { requests: 30, windowMs: 60_000 },
  generateImages: { requests: 5, windowMs: 60_000 },  // Phase 3
  generateVideo: { requests: 2, windowMs: 60_000 },   // Phase 4
};
```

---

## 9. Content Safety Validation

After AI generates the story, a server-side safety validator checks:

```typescript
interface SafetyCheckResult {
  passed: boolean;
  violations: SafetyViolation[];
}

interface SafetyViolation {
  rule: string;       // e.g. "NO_NEGATIVE_ENDING"
  severity: 'block' | 'warn';
  detail: string;
}

// Rules checked:
const SAFETY_RULES = [
  { id: 'NO_VIOLENCE',          pattern: /.../,  severity: 'block' },
  { id: 'NO_HORROR',            pattern: /..../,  severity: 'block' },
  { id: 'NO_CRUDE_LANGUAGE',    keywords: [...], severity: 'block' },
  { id: 'POSITIVE_ENDING',      check: 'semantic', severity: 'block' },
  { id: 'HAS_MORAL_LESSON',     check: 'field-present', severity: 'block' },
  { id: 'HAS_EDUCATIONAL_VALUE',check: 'array-non-empty', severity: 'warn' },
];
```

If any `block`-severity rule fails, the generation is retried (up to 2 times) before returning an error to the user.

---

## 10. Folder Structure

```
bolalar-uchun-ertak/
├── app/                          ← Next.js App Router
│   ├── page.tsx                  ← Main page
│   ├── layout.tsx                ← Root layout
│   └── api/
│       ├── generate/route.ts     ← POST /api/generate
│       ├── regenerate-section/route.ts
│       ├── generate-images/route.ts    ← Phase 3
│       └── generate-video/route.ts     ← Phase 4
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── generator/
│   │   ├── GeneratorPanel.tsx
│   │   ├── TopicInput.tsx
│   │   ├── AgeSelector.tsx
│   │   ├── ValuesPicker.tsx
│   │   └── GenerateButton.tsx
│   ├── output/
│   │   ├── StoryOutput.tsx
│   │   ├── OutputSection.tsx
│   │   ├── ImagePromptsSection.tsx
│   │   ├── VideoScenesSection.tsx
│   │   ├── HashtagsSection.tsx
│   │   └── ExportBar.tsx
│   └── ui/
│       ├── CopyButton.tsx
│       ├── LoadingOverlay.tsx
│       ├── HistoryDrawer.tsx
│       └── ThemeToggle.tsx
│
├── lib/
│   ├── ai/
│   │   ├── orchestrator.ts       ← Story generation orchestrator
│   │   ├── providers/
│   │   │   ├── openai.ts         ← OpenAI provider implementation
│   │   │   ├── gemini.ts         ← Gemini provider (Phase 2)
│   │   │   ├── dalle.ts          ← DALL-E image provider (Phase 3)
│   │   │   └── runway.ts         ← RunwayML video provider (Phase 4)
│   │   ├── character-consistency.ts
│   │   └── safety-validator.ts
│   ├── prompts/
│   │   ├── builder.ts            ← Assembles prompts from templates
│   │   └── templates/
│   │       ├── system.txt
│   │       ├── user-template.txt
│   │       └── safety-rules.txt
│   └── utils/
│       ├── sanitise.ts
│       ├── export-pdf.ts
│       ├── export-json.ts
│       └── local-storage.ts
│
├── config/
│   ├── ai-providers.ts
│   ├── rate-limits.ts
│   └── educational-values.ts
│
├── types/
│   └── index.ts                  ← All TypeScript types (StoryPackage, etc.)
│
├── prompts/                      ← Editable AI prompt files
│   ├── system.txt
│   ├── user-template.txt
│   ├── safety-rules.txt
│   ├── values-map.json
│   ├── age-profiles.json
│   └── output-schema.json
│
├── public/
│   ├── logo.svg
│   └── og-image.png
│
├── docs/                         ← Specification documents
│   ├── requirements.md
│   ├── design.md
│   └── tasks.md
│
├── .env.example                  ← Environment variable template
├── .env.local                    ← Local secrets (git-ignored)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 11. Export Architecture

### 11.1 PDF Export

```
StoryPackage → PDF Template (react-pdf) → Rendered PDF
  ├── Cover page: Title + Age Category + Illustration placeholder
  ├── Summary section
  ├── Full story (paginated, child-friendly font)
  ├── Moral lesson (highlighted callout box)
  ├── Image prompts (numbered list)
  ├── Video scenes (table format)
  └── Hashtags + Parent note (back page)
```

### 11.2 JSON Export

Raw `StoryPackage` object serialised to `{title}-{timestamp}.json` — enables re-import and third-party tool use.

---

## 12. Future Architecture: AI Image Generation (Phase 3)

```
StoryPackage.imagePrompts[]
       │
       ▼
POST /api/generate-images
       │
       ├── For each imagePrompt:
       │    ├── Prepend character visual seeds
       │    ├── Append style consistency suffix
       │    └── Call ImageAIProvider.generateImage()
       │
       ▼
ImageResult[] { url, promptUsed, sceneIndex }
       │
       ▼
Displayed in <ImagePromptsSection> alongside each prompt
User can: View full-size | Download | Regenerate individual image
```

**Character Consistency for Image Generation:**
Each call includes the `visualSeed` for every character in the scene, ensuring a "character sheet" approach where Karim always looks like Karim across 10 different images.

---

## 13. Future Architecture: AI Video Generation (Phase 4)

```
StoryPackage.videoScenes[]
       │
       ▼
POST /api/generate-video
       │
       ├── For each videoScene:
       │    ├── Build video prompt: description + camera + mood
       │    ├── Call VideoAIProvider.generateVideoClip()
       │    └── Store clip URL + metadata
       │
       ├── Assemble clips in scene order
       ├── Add Uzbek narration audio (TTS — Phase 4b)
       ├── Add background music (from child-safe library)
       └── Merge into final MP4
       │
       ▼
Final video: downloadable MP4 / embeddable player
```

**Phase 4b — Narration Audio:**
- Each `videoScene.narration` (Uzbek text) is passed to a TTS provider
- Providers: ElevenLabs (natural voice), Google TTS, or Azure TTS
- Audio is synchronised with corresponding video clip

---

## 14. Deployment Architecture

### 14.1 MVP Deployment (Phase 1)

```
GitHub Repository
       │
       ▼ (CI/CD via GitHub Actions)
  Vercel (Next.js hosting)
       ├── Frontend: Static + SSR pages
       ├── API Routes: Serverless functions
       └── Environment Variables: Managed in Vercel dashboard
```

### 14.2 Scaled Deployment (Phase 3+)

```
GitHub Repository
       │
       ▼
  Vercel (Frontend + API proxy)
       │
       ├── Text AI → OpenAI API
       ├── Image AI → DALL-E / Replicate API
       └── Video AI → RunwayML API
```

---

## 15. Performance Considerations

| Concern                    | Strategy                                                          |
|----------------------------|-------------------------------------------------------------------|
| AI response latency         | Stream tokens to frontend for perceived speed (Phase 2)          |
| Concurrent generation       | Serverless auto-scaling handles concurrency natively             |
| Image generation latency    | Generate images async after story is displayed (Phase 3)         |
| Video generation latency    | Long-running job with webhook callback + polling (Phase 4)       |
| Bundle size                 | Code-split by route; lazy-load PDF/export modules               |
| Caching                     | Cache identical topic+age requests for 24 hours (Redis, Phase 2) |

---

## 16. Monitoring & Observability

| Signal             | Tool                  | What is Tracked                              |
|--------------------|-----------------------|----------------------------------------------|
| Error tracking     | Sentry                | API errors, AI failures, client exceptions   |
| Usage analytics    | Vercel Analytics      | Page views, generation events                |
| AI cost monitoring | OpenAI Usage Dashboard| Token usage per request, daily spend         |
| Performance        | Vercel Web Vitals     | LCP, FID, CLS for Core Web Vitals            |
| Rate limit hits    | Custom logging        | IP addresses hitting rate limits             |
