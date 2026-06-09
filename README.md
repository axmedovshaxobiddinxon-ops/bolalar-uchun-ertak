# 📚 Bolalar Uchun Ertak — AI-Powered Uzbek Children's Story Generator

An AI-powered web application that generates original, educational fairy tales in the Uzbek language. Built with Next.js 14, TypeScript, Tailwind CSS, and OpenAI GPT-4o.

---

## ✨ Features (Phase 1)

- 📝 **Topic input** with Uzbek example suggestions
- 👶 **Age category selector** (4–6, 7–9, 10–12 years)
- 📏 **Story length selector** (Short / Medium / Long)
- 🌟 **Educational values picker** (10 core values)
- 📖 **Full story generation** in Uzbek (original, child-safe)
- 🌟 **Moral lesson** extraction
- 🖼️ **Image prompts** (English, ready for DALL-E / Stable Diffusion)
- 🎬 **Video scene descriptions** (English, ready for RunwayML / Kling)
- 📣 **Hashtags** (Uzbek + English)
- 👨‍👩‍👧 **Parent note** explaining educational value
- 🛡️ **Content safety validator** (7 strict rules)
- 🎨 **Character consistency** across all image prompts
- 💾 **Session history** (localStorage, up to 20 stories)
- 📤 **JSON export**
- 🌙 **Dark/light mode**

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/axmedovshaxobiddinxon-ops/bolalar-uchun-ertak.git
cd bolalar-uchun-ertak
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
OPENAI_API_KEY=sk-...your-key-here...
TEXT_AI_PROVIDER=openai
TEXT_AI_MODEL=gpt-4o
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Project Structure

```
bolalar-uchun-ertak/
├── app/
│   ├── page.tsx              ← Main page
│   ├── layout.tsx            ← Root layout with fonts & providers
│   ├── globals.css           ← Tailwind + custom styles
│   ├── context/
│   │   └── AppContext.tsx    ← Global state (useReducer)
│   └── api/
│       ├── generate/route.ts ← POST /api/generate
│       └── health/route.ts   ← GET /api/health
├── components/
│   ├── layout/               ← Header, Footer
│   ├── generator/            ← TopicInput, AgeSelector, StoryLengthSelector, ValuesPicker, GeneratorPanel
│   ├── output/               ← StoryOutput, OutputSection, ImagePromptsSection, VideoScenesSection, HashtagsSection, ExportBar
│   └── ui/                   ← CopyButton, ThemeToggle, LoadingOverlay, HistoryDrawer
├── lib/
│   ├── ai/
│   │   ├── orchestrator.ts          ← Story generation pipeline
│   │   ├── safety-validator.ts      ← Content safety checks
│   │   ├── character-consistency.ts ← Visual seed injection
│   │   └── providers/openai.ts      ← OpenAI provider
│   ├── prompts/builder.ts           ← Prompt assembly
│   └── utils/                       ← sanitise, local-storage, export-json, cn
├── config/                   ← AI providers, rate limits, educational values
├── types/index.ts            ← All TypeScript types
├── prompts/                  ← Editable AI prompt files (.txt)
└── docs/                     ← Specification documents
```

---

## 🔑 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | ✅ Yes | — | Your OpenAI API key |
| `TEXT_AI_PROVIDER` | No | `openai` | AI provider (`openai`) |
| `TEXT_AI_MODEL` | No | `gpt-4o` | Model to use |
| `RATE_LIMIT_GENERATE` | No | `10` | Max requests/min per IP |

---

## 🛡️ Content Safety

Every generated story passes through a 7-rule validator:

1. **NO_VIOLENCE** — No fighting, weapons, or physical harm
2. **NO_HORROR** — No frightening scenes or monsters
3. **NO_CRUDE_LANGUAGE** — No offensive language
4. **NO_AGE_INAPPROPRIATE** — No adult content
5. **NO_NEGATIVE_ENDING** — Stories must end positively
6. **HAS_MORAL_LESSON** — Every story must have a lesson
7. **HAS_EDUCATIONAL_VALUE** — At least one core value

If a violation is detected, generation is retried up to 2 times automatically.

---

## 🗺️ Roadmap

| Phase | Status | Features |
|-------|--------|----------|
| Phase 1 | ✅ **Complete** | Core generation, all output sections, UI |
| Phase 2 | 🔄 Planned | Streaming, history, PDF export, Gemini fallback |
| Phase 3 | 🔮 Future | AI image generation (DALL-E / Stable Diffusion) |
| Phase 4 | 🔮 Future | AI video generation + narration audio |

---

## 🧑‍💻 Development

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run type-check # TypeScript check
npm run lint      # ESLint
```

---

## 📄 License

MIT — Free for educational and commercial use.
