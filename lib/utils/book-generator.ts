// ============================================================
// Book Generator — splits a StoryPackage into logical book pages
// with a structured Table of Contents
// ============================================================

import type { StoryPackage } from "@/types";

// ── Types ─────────────────────────────────────────────────

export type PageType =
  | "cover"
  | "author"
  | "toc"
  | "dedication"
  | "story-opening"
  | "story-body"
  | "story-closing"
  | "moral"
  | "characters"
  | "image-prompts"
  | "hashtags"
  | "back-cover";

export interface BookPage {
  /** 1-based page number (cover = 0, not counted in page numbering) */
  pageNumber: number;
  type: PageType;
  /** Display title for this page / TOC entry */
  title: string;
  /** Main text content for this page */
  content: string;
  /** Optional secondary content (e.g. subtitle on cover) */
  subtitle?: string;
  /** Whether this page appears in the TOC */
  inToc: boolean;
  /** Word count of content on this page */
  wordCount: number;
}

export interface TocEntry {
  title: string;
  pageNumber: number;
  type: PageType;
}

export interface Book {
  title: string;
  author: string;
  ageCategory: string;
  generatedAt: string;
  pages: BookPage[];
  toc: TocEntry[];
  totalPages: number;
  totalWords: number;
  readingTimeMinutes: number;
}

// ── Constants ─────────────────────────────────────────────

/** Approximate words that comfortably fit on one A4 story page */
const WORDS_PER_STORY_PAGE = 180;

/** Approximate characters per line for wrapping estimates */
const CHARS_PER_LINE = 70;

// ── Helpers ───────────────────────────────────────────────

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

/**
 * Splits a long text into chunks of approximately `wordsPerChunk` words,
 * always breaking on paragraph boundaries first, then sentence boundaries.
 */
function splitIntoParagraphChunks(
  text: string,
  wordsPerChunk: number
): string[] {
  // First split on blank lines (paragraph breaks)
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentWords = 0;

  for (const para of paragraphs) {
    const paraWords = countWords(para);

    // If this single paragraph is bigger than the limit, split by sentences
    if (paraWords > wordsPerChunk) {
      // Flush current chunk first
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.join("\n\n"));
        currentChunk = [];
        currentWords = 0;
      }
      // Split paragraph into sentences
      const sentences = para.match(/[^.!?]+[.!?]+/g) ?? [para];
      let sentenceChunk: string[] = [];
      let sentenceWords = 0;
      for (const sentence of sentences) {
        const sw = countWords(sentence);
        if (sentenceWords + sw > wordsPerChunk && sentenceChunk.length > 0) {
          chunks.push(sentenceChunk.join(" "));
          sentenceChunk = [];
          sentenceWords = 0;
        }
        sentenceChunk.push(sentence.trim());
        sentenceWords += sw;
      }
      if (sentenceChunk.length > 0) {
        chunks.push(sentenceChunk.join(" "));
      }
      continue;
    }

    if (currentWords + paraWords > wordsPerChunk && currentChunk.length > 0) {
      chunks.push(currentChunk.join("\n\n"));
      currentChunk = [];
      currentWords = 0;
    }

    currentChunk.push(para);
    currentWords += paraWords;
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join("\n\n"));
  }

  return chunks.filter(Boolean);
}

/**
 * Detects a natural story opening (first paragraph / intro section).
 * Returns [opening, rest].
 */
function extractStoryOpening(story: string): [string, string] {
  const paragraphs = story
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length <= 2) {
    return [story, ""];
  }

  // Opening = first 1–2 paragraphs (up to ~80 words)
  let openingWords = 0;
  let openingEnd = 0;
  for (let i = 0; i < Math.min(2, paragraphs.length); i++) {
    openingWords += countWords(paragraphs[i]);
    openingEnd = i + 1;
    if (openingWords >= 60) break;
  }

  const opening = paragraphs.slice(0, openingEnd).join("\n\n");
  const rest = paragraphs.slice(openingEnd).join("\n\n");
  return [opening, rest];
}

/**
 * Detects a natural story closing (last paragraph).
 * Returns [bodyText, closing].
 */
function extractStoryClosing(text: string): [string, string] {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length <= 1) {
    return [text, ""];
  }

  const closing = paragraphs[paragraphs.length - 1];
  const body = paragraphs.slice(0, -1).join("\n\n");
  return [body, closing];
}

// ── Main generator ────────────────────────────────────────

/**
 * Converts a StoryPackage into a structured Book with pages and TOC.
 *
 * Page order:
 *  0. Cover (no page number)
 *  1. Author / Credits page
 *  2. Table of Contents
 *  3. Dedication / Summary page
 *  4. Story opening page
 *  5…N. Story body pages (auto-paginated)
 *  N+1. Story closing page
 *  N+2. Moral lesson page
 *  N+3. Characters page (if any)
 *  N+4. Image prompts page (if any)
 *  N+5. Hashtags page (if any)
 *  Last. Back cover
 */
export function generateBook(pkg: StoryPackage): Book {
  const pages: BookPage[] = [];
  let pageCounter = 0; // increments for numbered pages only

  // ── Helper to add a page ──────────────────────────────
  function addPage(
    opts: Omit<BookPage, "pageNumber" | "wordCount"> & { numbered?: boolean }
  ): BookPage {
    const numbered = opts.numbered !== false && opts.type !== "cover" && opts.type !== "back-cover";
    if (numbered) pageCounter += 1;
    const page: BookPage = {
      ...opts,
      pageNumber: numbered ? pageCounter : 0,
      wordCount: countWords(opts.content),
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { numbered: _n, ...rest } = page as typeof page & { numbered?: boolean };
    pages.push(rest as BookPage);
    return rest as BookPage;
  }

  // ── Page 0: Cover ─────────────────────────────────────
  addPage({
    type: "cover",
    title: pkg.title,
    subtitle: `${pkg.ageCategory} yosh uchun ertak`,
    content: pkg.summary,
    inToc: false,
    numbered: false,
  });

  // ── Page 1: Author / Credits ──────────────────────────
  const generatedDate = new Date(pkg.generatedAt).toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const valueLabels =
    pkg.educationalValues?.length > 0
      ? pkg.educationalValues.join(", ")
      : "—";

  addPage({
    type: "author",
    title: "Muallif sahifasi",
    content: [
      `Sarlavha: ${pkg.title}`,
      `Yosh toifasi: ${pkg.ageCategory} yosh`,
      `Mavzu: ${pkg.topic}`,
      `Ta'lim qiymatlari: ${valueLabels}`,
      `So'zlar soni: ${pkg.metadata?.wordCount ?? countWords(pkg.story)}`,
      `O'qish vaqti: ${pkg.metadata?.readingTimeMinutes ?? 1} daqiqa`,
      `Yaratilgan sana: ${generatedDate}`,
      `Yaratuvchi model: ${pkg.metadata?.aiModel ?? "AI"}`,
      "",
      "Bu ertak sun'iy intellekt (AI) yordamida bolalar uchun yaratilgan.",
      "Barcha huquqlar himoyalangan. Faqat ta'lim maqsadida foydalanish mumkin.",
    ].join("\n"),
    inToc: false,
  });

  // ── Page 2: Table of Contents (placeholder — filled after all pages known) ──
  const tocPageIndex = pages.length;
  addPage({
    type: "toc",
    title: "Mundarija",
    content: "__TOC_PLACEHOLDER__",
    inToc: false,
  });

  // ── Page 3: Dedication / Summary ─────────────────────
  addPage({
    type: "dedication",
    title: "Qisqa mazmun",
    content: pkg.summary,
    inToc: true,
  });

  // ── Story pages ───────────────────────────────────────
  const [storyOpening, storyRest] = extractStoryOpening(pkg.story);
  const [storyBody, storyClosing] = extractStoryClosing(storyRest);

  // Opening page
  addPage({
    type: "story-opening",
    title: "Ertak boshlanishi",
    subtitle: pkg.title,
    content: storyOpening,
    inToc: true,
  });

  // Body pages — auto-paginated
  if (storyBody.trim()) {
    const bodyChunks = splitIntoParagraphChunks(storyBody, WORDS_PER_STORY_PAGE);
    bodyChunks.forEach((chunk, idx) => {
      addPage({
        type: "story-body",
        title: idx === 0 ? "Ertak davomi" : `Ertak (davom — ${idx + 1})`,
        content: chunk,
        inToc: idx === 0,
      });
    });
  }

  // Closing page
  if (storyClosing.trim()) {
    addPage({
      type: "story-closing",
      title: "Ertak yakuni",
      content: storyClosing,
      inToc: true,
    });
  }

  // ── Moral lesson ──────────────────────────────────────
  addPage({
    type: "moral",
    title: "Saboq va xulosa",
    content: pkg.moralLesson,
    subtitle: pkg.parentNote ?? "",
    inToc: true,
  });

  // ── Characters page ───────────────────────────────────
  if (pkg.characters?.length > 0) {
    const charLines = pkg.characters.map(
      (c) =>
        `${c.name} (${
          c.role === "protagonist"
            ? "Asosiy qahramon"
            : c.role === "mentor"
            ? "Ustoz"
            : c.role === "antagonist"
            ? "Raqib"
            : "Yordamchi"
        }):\n${c.visualSeed}`
    );
    addPage({
      type: "characters",
      title: "Qahramonlar",
      content: charLines.join("\n\n"),
      inToc: true,
    });
  }

  // ── Image prompts page ────────────────────────────────
  if (pkg.imagePrompts?.length > 0) {
    const promptLines = pkg.imagePrompts.map(
      (p) => `Sahna ${p.scene}: ${p.storyReference}\n${p.prompt}`
    );
    addPage({
      type: "image-prompts",
      title: "Rasm tavsiflar",
      content: promptLines.join("\n\n"),
      inToc: true,
    });
  }

  // ── Hashtags page ─────────────────────────────────────
  if (pkg.hashtags) {
    const allTags = [
      ...(pkg.hashtags.uzbek ?? []),
      ...(pkg.hashtags.english ?? []),
    ].join("  ");
    addPage({
      type: "hashtags",
      title: "Xeshteglar",
      content: allTags,
      inToc: false,
    });
  }

  // ── Back cover ────────────────────────────────────────
  addPage({
    type: "back-cover",
    title: "Orqa muqova",
    content: pkg.moralLesson,
    subtitle: pkg.title,
    inToc: false,
    numbered: false,
  });

  // ── Build TOC entries ─────────────────────────────────
  const toc: TocEntry[] = pages
    .filter((p) => p.inToc && p.pageNumber > 0)
    .map((p) => ({
      title: p.title,
      pageNumber: p.pageNumber,
      type: p.type,
    }));

  // ── Fill TOC placeholder page ─────────────────────────
  const tocLines = toc.map(
    (entry) => `${entry.title}${"·".repeat(Math.max(2, 40 - entry.title.length))}${entry.pageNumber}`
  );
  pages[tocPageIndex] = {
    ...pages[tocPageIndex],
    content: tocLines.join("\n"),
  };

  const totalWords = countWords(pkg.story);
  const readingTimeMinutes = Math.max(1, Math.ceil(totalWords / 150));

  return {
    title: pkg.title,
    author: "Bolalar Uchun Ertak — AI",
    ageCategory: pkg.ageCategory,
    generatedAt: pkg.generatedAt,
    pages,
    toc,
    totalPages: pageCounter,
    totalWords,
    readingTimeMinutes,
  };
}

// ── Utility: find a page by type ─────────────────────────
export function getPagesByType(book: Book, type: PageType): BookPage[] {
  return book.pages.filter((p) => p.type === type);
}

// ── Utility: get reading-order story text ────────────────
export function getFullStoryText(book: Book): string {
  return book.pages
    .filter((p) =>
      ["story-opening", "story-body", "story-closing"].includes(p.type)
    )
    .map((p) => p.content)
    .join("\n\n");
}

// ── Utility: estimate line count for a text ──────────────
export function estimateLineCount(text: string): number {
  return text
    .split("\n")
    .reduce(
      (acc, line) => acc + Math.ceil((line.length || 1) / CHARS_PER_LINE),
      0
    );
}
