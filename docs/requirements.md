# Requirements — AI-Powered Uzbek Children's Story Generator

## 1. Project Overview

The **Bolalar Uchun Ertak** platform is an AI-powered web application that generates original, educational fairy tales in the Uzbek language. A user provides a topic or idea; the system produces a complete, structured story package including the title, age category, summary, full story, moral lesson, image prompts, video scene descriptions, and hashtags — all aligned with child-safe educational values rooted in Uzbek culture.

---

## 2. Stakeholders

| Role              | Description                                                        |
|-------------------|--------------------------------------------------------------------|
| Child Reader      | Primary consumer of stories (ages 4–12)                           |
| Parent / Guardian | Reviews content, reads stories to younger children                |
| Teacher / Educator| Uses stories in classroom settings                                 |
| Content Creator   | Uses image/video prompts to produce media content                  |
| Platform Admin    | Manages the system, monitors usage, curates quality                |

---

## 3. Functional Requirements

### 3.1 Story Generation (Core)

| ID     | Requirement                                                                                       | Priority |
|--------|---------------------------------------------------------------------------------------------------|----------|
| FR-01  | User can enter a free-text topic or idea in Uzbek or English                                      | MUST     |
| FR-02  | System generates an improved, engaging story **title** in Uzbek                                   | MUST     |
| FR-03  | System determines and outputs the **age category**: 4–6, 7–9, or 10–12 years                     | MUST     |
| FR-04  | System generates a **short summary** (3–5 sentences) of the story in Uzbek                       | MUST     |
| FR-05  | System generates a complete, **original full story** in simple Uzbek (min. 500 words)             | MUST     |
| FR-06  | System generates a clear **moral lesson** derived from the story                                  | MUST     |
| FR-07  | System generates **5–15 relevant hashtags** in Uzbek and English                                  | MUST     |
| FR-08  | System generates **3–10 image prompts** in English suitable for AI image generation tools         | MUST     |
| FR-09  | System generates **3–8 video scene descriptions** in English for AI video generation              | MUST     |
| FR-10  | All image prompts maintain **character consistency** (same visual description of each character)  | MUST     |
| FR-11  | A **parent note** is generated with each story explaining the educational value                   | MUST     |

### 3.2 Educational Value Enforcement

| ID     | Requirement                                                                                          | Priority |
|--------|------------------------------------------------------------------------------------------------------|----------|
| FR-12  | Every story must embed **at least one** of the ten core educational values                           | MUST     |
| FR-13  | Stories must always have a **positive ending** (good triumphs over evil)                             | MUST     |
| FR-14  | Language must be **simple, clear, and age-appropriate** for the selected age category                | MUST     |
| FR-15  | Heroes/protagonists must model **exemplary moral behaviour**                                         | MUST     |
| FR-16  | Stories must align with **Uzbek national and universal human values**                                | MUST     |

**Ten Core Educational Values:**

1. Kindness (Ezgulik)
2. Honesty (Halollik)
3. Good Manners (Odob-axloq)
4. Education & Knowledge (Ilm-ma'rifat)
5. Love of Reading (Kitobxonlik)
6. Patriotism (Vatanparvarlik)
7. Respect for Parents (Ota-onaga hurmat)
8. Respect for Teachers (Ustozga ehtirom)
9. Friendship (Do'stlik)
10. Hard Work & Perseverance (Mehnatsevarlik)

### 3.3 Content Safety (Strict Prohibitions)

| ID     | Prohibited Content                                                        | Priority |
|--------|---------------------------------------------------------------------------|----------|
| FR-17  | No violence or promotion of violent behaviour                             | MUST     |
| FR-18  | No horror, frightening, or psychologically harmful scenes                 | MUST     |
| FR-19  | No crude language, insults, or offensive expressions                      | MUST     |
| FR-20  | No age-inappropriate themes or content                                    | MUST     |
| FR-21  | No negative, hopeless, or depressing endings                              | MUST     |
| FR-22  | No portrayal of deception or bad behaviour as heroic                      | MUST     |
| FR-23  | No politically sensitive or controversial content                         | MUST     |

### 3.4 Story Structure Requirements

Every generated story must follow this mandatory narrative arc:

1. **Introduction** — Engaging opening that introduces the setting and main character(s)
2. **Main Event** — The central activity or situation
3. **Challenge / Trial** — A problem the hero must face
4. **Hero's Right Decision** — The protagonist makes a morally correct choice
5. **Resolution** — The challenge is resolved positively
6. **Educational Conclusion** — An explicit moral takeaway

### 3.5 Output Format

Each generation request produces a structured output package:

```
1.  📖 Title (Sarlavha)
2.  👶 Age Category (Yosh toifasi)
3.  📝 Summary (Qisqa mazmun)
4.  📚 Full Story (Ertak matni)
5.  🌟 Moral Lesson (Saboq)
6.  🖼️  Image Prompts (Rasm uchun tavsiflar)
7.  🎬 Video Scene Descriptions (Video sahnalar)
8.  📣 Hashtags (Xeshteglar)
9.  👨‍👩‍👧 Parent Note (Ota-onalar uchun izoh)
```

### 3.6 User Interface

| ID     | Requirement                                                                                  | Priority |
|--------|----------------------------------------------------------------------------------------------|----------|
| FR-24  | Single-page web interface accessible via browser                                              | MUST     |
| FR-25  | Topic input field with placeholder guidance in Uzbek                                          | MUST     |
| FR-26  | Generate button triggers story creation                                                        | MUST     |
| FR-27  | Loading state displayed during generation (with animated indicator)                            | MUST     |
| FR-28  | Results displayed in clearly labelled, collapsible sections                                    | MUST     |
| FR-29  | Each section has a one-click **copy to clipboard** button                                     | MUST     |
| FR-30  | Full output can be exported as a formatted **PDF**                                            | SHOULD   |
| FR-31  | Full output can be exported as **JSON**                                                        | SHOULD   |
| FR-32  | User can regenerate any individual section without regenerating the full story                 | SHOULD   |
| FR-33  | Previous generations are saved in **browser local storage** (session history)                 | SHOULD   |
| FR-34  | User can select preferred age category manually (overrides AI suggestion)                      | SHOULD   |
| FR-35  | User can select one or more educational values to emphasise                                    | COULD    |
| FR-36  | Dark mode / light mode toggle                                                                  | COULD    |

### 3.7 AI Image Generation (Future — Phase 3)

| ID     | Requirement                                                                                     | Priority |
|--------|-------------------------------------------------------------------------------------------------|----------|
| FR-37  | Platform can submit image prompts directly to an integrated AI image API (e.g., DALL-E, Stable Diffusion) | FUTURE |
| FR-38  | Generated images are displayed alongside corresponding story sections                           | FUTURE   |
| FR-39  | User can download individual images                                                              | FUTURE   |
| FR-40  | Character seed/reference image can be locked across all generations for consistency             | FUTURE   |

### 3.8 AI Video Generation (Future — Phase 4)

| ID     | Requirement                                                                                    | Priority |
|--------|------------------------------------------------------------------------------------------------|----------|
| FR-41  | Platform can submit video scene descriptions to an AI video API (e.g., RunwayML, Kling)       | FUTURE   |
| FR-42  | Generated video clips are assembled into a sequential story video                              | FUTURE   |
| FR-43  | Background music (child-safe) can be added to generated videos                                 | FUTURE   |
| FR-44  | Final video can be downloaded in MP4 format                                                    | FUTURE   |

---

## 4. Non-Functional Requirements

### 4.1 Performance

| ID      | Requirement                                                                  |
|---------|------------------------------------------------------------------------------|
| NFR-01  | Story generation must complete within **30 seconds** under normal conditions |
| NFR-02  | UI must remain responsive during AI generation (non-blocking)                |
| NFR-03  | Page initial load time must be **under 3 seconds** on a standard connection  |

### 4.2 Reliability

| ID      | Requirement                                                                    |
|---------|--------------------------------------------------------------------------------|
| NFR-04  | System must handle AI API timeouts gracefully with a user-friendly error message |
| NFR-05  | Partial failures (e.g., one section fails) must not block the rest of the output |
| NFR-06  | System must validate AI output against content-safety rules before displaying   |

### 4.3 Security

| ID      | Requirement                                                                      |
|---------|----------------------------------------------------------------------------------|
| NFR-07  | AI API keys must never be exposed to the client/browser                          |
| NFR-08  | All API calls must be proxied through a secure server-side layer                 |
| NFR-09  | User inputs must be sanitised before being sent to the AI model                  |
| NFR-10  | Rate limiting must be applied per IP to prevent abuse                            |

### 4.4 Scalability

| ID      | Requirement                                                                          |
|---------|--------------------------------------------------------------------------------------|
| NFR-11  | Backend must support horizontal scaling to handle concurrent generation requests     |
| NFR-12  | Architecture must support swapping AI providers without major code changes           |
| NFR-13  | System must be deployable on serverless platforms (Vercel, Netlify Functions, etc.)  |

### 4.5 Accessibility

| ID      | Requirement                                                            |
|---------|------------------------------------------------------------------------|
| NFR-14  | UI must meet **WCAG 2.1 AA** accessibility standards                   |
| NFR-15  | All interactive elements must be keyboard-navigable                    |
| NFR-16  | Sufficient colour contrast for child and elderly readers               |

### 4.6 Localisation

| ID      | Requirement                                                                   |
|---------|-------------------------------------------------------------------------------|
| NFR-17  | Primary language of the UI and stories is **Uzbek (Latin script)**            |
| NFR-18  | Image and video prompts are generated in **English** for AI tool compatibility|
| NFR-19  | System must support Uzbek Cyrillic script as a future extension               |

### 4.7 Maintainability

| ID      | Requirement                                                                     |
|---------|---------------------------------------------------------------------------------|
| NFR-20  | All AI prompts must be stored in separate, editable configuration files         |
| NFR-21  | Codebase must follow consistent formatting and linting rules                    |
| NFR-22  | All modules must be independently testable                                      |

---

## 5. Constraints

- Stories must be generated entirely in the **Uzbek language** (Latin script)
- The AI model used must support high-quality Uzbek text generation
- Content must strictly comply with child-safety standards
- No user authentication required for MVP (Phase 1)
- API keys must be managed via environment variables

---

## 6. Assumptions

- The primary AI provider for text generation is **OpenAI GPT-4o** (or compatible)
- The application is a web-based single-page app (SPA)
- Internet connectivity is required for AI generation
- No offline mode required in MVP

---

## 7. Glossary

| Term              | Definition                                                                    |
|-------------------|-------------------------------------------------------------------------------|
| Ertak             | Fairy tale / story (Uzbek)                                                    |
| Sarlavha          | Title (Uzbek)                                                                 |
| Saboq             | Lesson / moral (Uzbek)                                                        |
| Yosh toifasi      | Age category (Uzbek)                                                          |
| Image Prompt      | A descriptive text instruction used to generate an image via an AI image model|
| Video Scene       | A textual description of a visual scene used as input for AI video generation |
| Character Seed    | A fixed visual description anchoring character appearance across all prompts  |
| Educational Value | One of ten core moral/ethical qualities embedded in each story                |
