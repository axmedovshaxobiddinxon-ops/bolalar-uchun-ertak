// ============================================================
// DOCX Export — Microsoft Word children's book generator
// Uses the `docx` npm library (client-side via dynamic import).
// Produces a print-ready A4 document with cover, TOC, story,
// moral lesson, characters, image prompts, and hashtags.
// ============================================================
// Install: npm install docx file-saver
// ============================================================

import type { StoryPackage } from "@/types";
import { generateBook, type Book, type BookPage } from "./book-generator";

export type DocxProgressCallback = (step: string, percent: number) => void;

// ── Dynamic imports ───────────────────────────────────────

async function getDocxModule() {
  return await import("docx");
}

async function getFileSaver() {
  return await import("file-saver");
}

// ── Colour palette (hex strings for docx) ────────────────

const PALETTE = {
  amber: "F59E0B",
  amberLight: "FEF3C7",
  amberDark: "92400E",
  orange: "F97316",
  black: "111827",
  gray: "6B7280",
  grayLight: "F3F4F6",
  green: "16A34A",
  greenLight: "DCFCE7",
  white: "FFFFFF",
  sky: "0EA5E9",
  skyLight: "E0F2FE",
  purple: "7C3AED",
  purpleLight: "EDE9FE",
};

// ── Filename helper ───────────────────────────────────────

function buildFilename(pkg: StoryPackage): string {
  const safe = pkg.title
    .replace(/[^\w\s\u0400-\u04FF\u00C0-\u024F]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 40);
  const date = new Date(pkg.generatedAt).toISOString().slice(0, 10);
  return `${safe || "ertak"}-${date}.docx`;
}

// ── Section builders ──────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DocxModule = any; // docx types are complex; use any for flexibility

function buildCoverSection(docx: DocxModule, book: Book, pkg: StoryPackage) {
  const {
    Document,
    Paragraph,
    TextRun,
    AlignmentType,
    HeadingLevel,
    PageBreak,
    ShadingType,
    BorderStyle,
  } = docx;

  void Document; // used indirectly
  void BorderStyle;

  const generatedDate = new Date(pkg.generatedAt).toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return [
    new Paragraph({
      children: [new TextRun({ text: "", break: 3 })],
    }),
    new Paragraph({
      text: "📚",
      alignment: AlignmentType.CENTER,
      style: "Normal",
      children: [
        new TextRun({
          text: "📚",
          size: 72,
        }),
      ],
    }),
    new Paragraph({ text: "", style: "Normal" }),
    new Paragraph({
      text: book.title,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      shading: {
        type: ShadingType.SOLID,
        fill: PALETTE.amberLight,
      },
      children: [
        new TextRun({
          text: book.title,
          bold: true,
          size: 52,
          color: PALETTE.amberDark,
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({ text: "", style: "Normal" }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `${pkg.ageCategory} yosh uchun ertak`,
          size: 24,
          color: PALETTE.gray,
          italics: true,
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({ text: "", style: "Normal" }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "━━━━━━━━━━━━━━━━━━━━━━",
          color: PALETTE.amber,
          size: 20,
        }),
      ],
    }),
    new Paragraph({ text: "", style: "Normal" }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: pkg.summary,
          size: 22,
          color: PALETTE.black,
          font: "Calibri",
          italics: true,
        }),
      ],
    }),
    new Paragraph({ text: "", style: "Normal" }),
    new Paragraph({ text: "", style: "Normal" }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "━━━━━━━━━━━━━━━━━━━━━━",
          color: PALETTE.amber,
          size: 20,
        }),
      ],
    }),
    new Paragraph({ text: "", style: "Normal" }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "Bolalar Uchun Ertak · AI Ertak Yaratuvchi",
          size: 18,
          bold: true,
          color: PALETTE.amber,
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Yaratilgan: ${generatedDate}`,
          size: 16,
          color: PALETTE.gray,
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({
      children: [new PageBreak()],
    }),
  ];
}

function buildAuthorSection(docx: DocxModule, pkg: StoryPackage) {
  const { Paragraph, TextRun, AlignmentType, HeadingLevel, PageBreak, ShadingType } = docx;

  const generatedDate = new Date(pkg.generatedAt).toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const fields = [
    ["📖 Sarlavha", pkg.title],
    ["👶 Yosh toifasi", `${pkg.ageCategory} yosh`],
    ["💡 Mavzu", pkg.topic],
    ["🌟 Ta'lim qiymatlari", pkg.educationalValues?.join(", ") || "—"],
    ["📝 So'zlar soni", String(pkg.metadata?.wordCount ?? "—")],
    ["⏱️ O'qish vaqti", `${pkg.metadata?.readingTimeMinutes ?? 1} daqiqa`],
    ["📅 Yaratilgan sana", generatedDate],
    ["🤖 AI modeli", pkg.metadata?.aiModel ?? "GPT-4o"],
  ];

  return [
    new Paragraph({
      text: "Muallif sahifasi",
      heading: HeadingLevel.HEADING_2,
      children: [
        new TextRun({
          text: "Muallif sahifasi",
          bold: true,
          size: 32,
          color: PALETTE.amberDark,
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({ text: "", style: "Normal" }),
    ...fields.map(([label, value]) =>
      new Paragraph({
        shading: { type: ShadingType.SOLID, fill: PALETTE.grayLight },
        spacing: { before: 80, after: 80 },
        children: [
          new TextRun({
            text: `${label}: `,
            bold: true,
            size: 20,
            color: PALETTE.amberDark,
            font: "Calibri",
          }),
          new TextRun({
            text: value,
            size: 20,
            color: PALETTE.black,
            font: "Calibri",
          }),
        ],
      })
    ),
    new Paragraph({ text: "", style: "Normal" }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "Bu ertak sun'iy intellekt (AI) yordamida bolalar uchun yaratilgan.",
          italics: true,
          size: 18,
          color: PALETTE.gray,
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({
      children: [new PageBreak()],
    }),
  ];
}

function buildTocSection(docx: DocxModule, book: Book) {
  const { Paragraph, TextRun, AlignmentType, HeadingLevel, PageBreak, TabStopType, TabStopLeader } = docx;

  const typeIcons: Record<string, string> = {
    dedication: "📝",
    "story-opening": "📖",
    "story-body": "📄",
    "story-closing": "🌅",
    moral: "🌟",
    characters: "👥",
    "image-prompts": "🖼️",
    hashtags: "📣",
  };

  return [
    new Paragraph({
      text: "Mundarija",
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "Mundarija",
          bold: true,
          size: 36,
          color: PALETTE.amberDark,
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({ text: "", style: "Normal" }),
    ...book.toc.map((entry) =>
      new Paragraph({
        spacing: { before: 100, after: 100 },
        tabStops: [
          {
            type: TabStopType.RIGHT,
            leader: TabStopLeader.DOT,
            position: 8500,
          },
        ],
        children: [
          new TextRun({
            text: `${typeIcons[entry.type] ?? "•"}  ${entry.title}`,
            size: 22,
            font: "Calibri",
            color: PALETTE.black,
          }),
          new TextRun({
            text: "\t",
          }),
          new TextRun({
            text: String(entry.pageNumber),
            size: 22,
            bold: true,
            font: "Calibri",
            color: PALETTE.amberDark,
          }),
        ],
      })
    ),
    new Paragraph({
      children: [new PageBreak()],
    }),
  ];
}

function buildSummarySection(docx: DocxModule, pkg: StoryPackage) {
  const { Paragraph, TextRun, AlignmentType, HeadingLevel, PageBreak, ShadingType } = docx;

  return [
    new Paragraph({
      children: [
        new TextRun({
          text: "📝  Qisqa mazmun",
          bold: true,
          size: 28,
          color: PALETTE.amberDark,
          font: "Calibri",
        }),
      ],
      heading: HeadingLevel.HEADING_2,
    }),
    new Paragraph({ text: "", style: "Normal" }),
    new Paragraph({
      shading: { type: ShadingType.SOLID, fill: PALETTE.amberLight },
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 160, after: 160, line: 360 },
      children: [
        new TextRun({
          text: pkg.summary,
          italics: true,
          size: 24,
          color: PALETTE.black,
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({
      children: [new PageBreak()],
    }),
  ];
}

function buildStorySection(docx: DocxModule, book: Book, pkg: StoryPackage) {
  const { Paragraph, TextRun, AlignmentType, HeadingLevel, PageBreak, ShadingType } = docx;

  const storyPages = book.pages.filter((p: BookPage) =>
    ["story-opening", "story-body", "story-closing"].includes(p.type)
  );

  const elements: unknown[] = [];

  elements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `📚  ${pkg.title}`,
          bold: true,
          size: 36,
          color: PALETTE.amberDark,
          font: "Calibri",
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      shading: { type: ShadingType.SOLID, fill: PALETTE.amberLight },
    }),
    new Paragraph({ text: "", style: "Normal" })
  );

  storyPages.forEach((page: BookPage, idx: number) => {
    // Chapter heading for opening and closing
    if (page.type === "story-opening") {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "🌅  Boshlanish",
              bold: true,
              size: 26,
              color: PALETTE.amber,
              font: "Calibri",
            }),
          ],
          spacing: { before: 200, after: 120 },
        })
      );
    } else if (page.type === "story-closing") {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "✨  Yakun",
              bold: true,
              size: 26,
              color: PALETTE.amber,
              font: "Calibri",
            }),
          ],
          spacing: { before: 200, after: 120 },
        })
      );
    }

    // Story paragraphs
    const paragraphs = page.content.split(/\n+/).filter(Boolean);
    paragraphs.forEach((para: string) => {
      elements.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { before: 80, after: 80, line: 360 },
          indent: { firstLine: 360 },
          children: [
            new TextRun({
              text: para,
              size: 24,
              color: PALETTE.black,
              font: "Calibri",
            }),
          ],
        })
      );
    });

    // Page break between story sections (but not after the last)
    if (idx < storyPages.length - 1 && page.type !== "story-body") {
      elements.push(new Paragraph({ children: [new PageBreak()] }));
    }
  });

  elements.push(new Paragraph({ children: [new PageBreak()] }));
  return elements;
}

function buildMoralSection(docx: DocxModule, pkg: StoryPackage) {
  const { Paragraph, TextRun, AlignmentType, HeadingLevel, PageBreak, ShadingType, BorderStyle } = docx;

  const elements: unknown[] = [
    new Paragraph({
      children: [
        new TextRun({
          text: "🌟  Saboq va Xulosa",
          bold: true,
          size: 32,
          color: PALETTE.green,
          font: "Calibri",
        }),
      ],
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ text: "", style: "Normal" }),
    new Paragraph({
      shading: { type: ShadingType.SOLID, fill: PALETTE.greenLight },
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 200, line: 400 },
      border: {
        top: { style: BorderStyle.SINGLE, size: 6, color: PALETTE.green },
        bottom: { style: BorderStyle.SINGLE, size: 6, color: PALETTE.green },
        left: { style: BorderStyle.SINGLE, size: 6, color: PALETTE.green },
        right: { style: BorderStyle.SINGLE, size: 6, color: PALETTE.green },
      },
      children: [
        new TextRun({
          text: pkg.moralLesson,
          bold: true,
          size: 26,
          color: PALETTE.green,
          font: "Calibri",
        }),
      ],
    }),
  ];

  // Parent note
  if (pkg.parentNote) {
    elements.push(
      new Paragraph({ text: "", style: "Normal" }),
      new Paragraph({
        children: [
          new TextRun({
            text: "👨‍👩‍👧  Ota-onalar uchun izoh",
            bold: true,
            size: 22,
            color: PALETTE.sky,
            font: "Calibri",
          }),
        ],
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        shading: { type: ShadingType.SOLID, fill: PALETTE.skyLight },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 120, after: 120, line: 340 },
        children: [
          new TextRun({
            text: pkg.parentNote,
            italics: true,
            size: 20,
            color: PALETTE.black,
            font: "Calibri",
          }),
        ],
      })
    );
  }

  elements.push(new Paragraph({ children: [new PageBreak()] }));
  return elements;
}

function buildCharactersSection(docx: DocxModule, pkg: StoryPackage) {
  const { Paragraph, TextRun, AlignmentType, HeadingLevel, PageBreak, ShadingType } = docx;

  if (!pkg.characters?.length) return [];

  const roleLabels: Record<string, string> = {
    protagonist: "Asosiy qahramon",
    mentor: "Ustoz",
    antagonist: "Raqib",
    supporting: "Yordamchi",
  };

  const elements: unknown[] = [
    new Paragraph({
      children: [
        new TextRun({
          text: "👥  Qahramonlar",
          bold: true,
          size: 32,
          color: PALETTE.sky,
          font: "Calibri",
        }),
      ],
      heading: HeadingLevel.HEADING_2,
    }),
    new Paragraph({ text: "", style: "Normal" }),
  ];

  pkg.characters.forEach((char, idx) => {
    elements.push(
      new Paragraph({
        shading: {
          type: ShadingType.SOLID,
          fill: idx % 2 === 0 ? PALETTE.skyLight : PALETTE.amberLight,
        },
        spacing: { before: 100, after: 0 },
        children: [
          new TextRun({
            text: `  ${char.name}  `,
            bold: true,
            size: 24,
            color: PALETTE.black,
            font: "Calibri",
          }),
          new TextRun({
            text: `[${roleLabels[char.role] ?? char.role}]`,
            size: 18,
            color: PALETTE.gray,
            italics: true,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        shading: {
          type: ShadingType.SOLID,
          fill: idx % 2 === 0 ? PALETTE.skyLight : PALETTE.amberLight,
        },
        spacing: { before: 0, after: 120 },
        indent: { left: 360 },
        children: [
          new TextRun({
            text: char.visualSeed,
            size: 18,
            color: PALETTE.gray,
            italics: true,
            font: "Calibri",
          }),
        ],
      })
    );
  });

  elements.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [new PageBreak()],
    })
  );
  return elements;
}

function buildImagePromptsSection(docx: DocxModule, pkg: StoryPackage) {
  const { Paragraph, TextRun, HeadingLevel, PageBreak, ShadingType } = docx;

  if (!pkg.imagePrompts?.length) return [];

  const elements: unknown[] = [
    new Paragraph({
      children: [
        new TextRun({
          text: "🖼️  Rasm Tavsiflar",
          bold: true,
          size: 32,
          color: PALETTE.purple,
          font: "Calibri",
        }),
      ],
      heading: HeadingLevel.HEADING_2,
    }),
    new Paragraph({ text: "", style: "Normal" }),
  ];

  pkg.imagePrompts.forEach((prompt) => {
    elements.push(
      new Paragraph({
        shading: { type: ShadingType.SOLID, fill: PALETTE.purpleLight },
        spacing: { before: 100, after: 60 },
        children: [
          new TextRun({
            text: `  Sahna ${prompt.scene}: ${prompt.storyReference}`,
            bold: true,
            size: 20,
            color: PALETTE.purple,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        shading: { type: ShadingType.SOLID, fill: PALETTE.grayLight },
        spacing: { before: 0, after: 120 },
        indent: { left: 180 },
        children: [
          new TextRun({
            text: prompt.prompt,
            size: 18,
            color: PALETTE.black,
            font: "Courier New",
          }),
        ],
      })
    );
  });

  elements.push(new Paragraph({ children: [new PageBreak()] }));
  return elements;
}

function buildHashtagsSection(docx: DocxModule, pkg: StoryPackage) {
  const { Paragraph, TextRun, HeadingLevel, ShadingType } = docx;

  if (!pkg.hashtags) return [];

  const uzbekTags = pkg.hashtags.uzbek?.join("  ") ?? "";
  const engTags = pkg.hashtags.english?.join("  ") ?? "";

  return [
    new Paragraph({
      children: [
        new TextRun({
          text: "📣  Xeshteglar",
          bold: true,
          size: 32,
          color: PALETTE.amber,
          font: "Calibri",
        }),
      ],
      heading: HeadingLevel.HEADING_2,
    }),
    new Paragraph({ text: "", style: "Normal" }),
    ...(uzbekTags
      ? [
          new Paragraph({
            children: [
              new TextRun({
                text: "🇺🇿 O'zbek:",
                bold: true,
                size: 20,
                color: PALETTE.amberDark,
                font: "Calibri",
              }),
            ],
            spacing: { before: 100, after: 60 },
          }),
          new Paragraph({
            shading: { type: ShadingType.SOLID, fill: PALETTE.amberLight },
            spacing: { before: 0, after: 120 },
            children: [
              new TextRun({
                text: uzbekTags,
                size: 20,
                color: PALETTE.amberDark,
                font: "Calibri",
                bold: true,
              }),
            ],
          }),
        ]
      : []),
    ...(engTags
      ? [
          new Paragraph({
            children: [
              new TextRun({
                text: "🌐 English:",
                bold: true,
                size: 20,
                color: PALETTE.gray,
                font: "Calibri",
              }),
            ],
            spacing: { before: 100, after: 60 },
          }),
          new Paragraph({
            shading: { type: ShadingType.SOLID, fill: PALETTE.grayLight },
            spacing: { before: 0, after: 120 },
            children: [
              new TextRun({
                text: engTags,
                size: 20,
                color: PALETTE.gray,
                font: "Calibri",
              }),
            ],
          }),
        ]
      : []),
  ];
}

// ── Main export function ──────────────────────────────────

/**
 * Generates a Microsoft Word (.docx) children's book from a StoryPackage.
 * Triggers a browser download when complete.
 *
 * @param pkg         The StoryPackage to export
 * @param onProgress  Optional progress callback (step label, 0-100)
 */
export async function exportDocx(
  pkg: StoryPackage,
  onProgress?: DocxProgressCallback
): Promise<void> {
  if (typeof window === "undefined") return;

  onProgress?.("Kitob strukturasi yaratilmoqda…", 5);
  const book = generateBook(pkg);

  onProgress?.("Word hujjati tayyorlanmoqda…", 15);
  const docx = await getDocxModule();
  const { Document, Packer, SectionType, PageOrientation, convertInchesToTwip } = docx;

  onProgress?.("Muqova sahifasi…", 20);
  const coverContent = buildCoverSection(docx, book, pkg);

  onProgress?.("Muallif sahifasi…", 30);
  const authorContent = buildAuthorSection(docx, pkg);

  onProgress?.("Mundarija…", 38);
  const tocContent = buildTocSection(docx, book);

  onProgress?.("Qisqa mazmun…", 44);
  const summaryContent = buildSummarySection(docx, pkg);

  onProgress?.("Ertak matni…", 55);
  const storyContent = buildStorySection(docx, book, pkg);

  onProgress?.("Saboq…", 68);
  const moralContent = buildMoralSection(docx, pkg);

  onProgress?.("Qahramonlar…", 75);
  const charactersContent = buildCharactersSection(docx, pkg);

  onProgress?.("Rasm tavsiflar…", 82);
  const imageContent = buildImagePromptsSection(docx, pkg);

  onProgress?.("Xeshteglar…", 88);
  const hashtagContent = buildHashtagsSection(docx, pkg);

  onProgress?.("Hujjat yig'ilmoqda…", 92);

  const doc = new Document({
    title: pkg.title,
    description: pkg.summary,
    creator: "Bolalar Uchun Ertak — AI",
    keywords: [
      ...(pkg.hashtags?.uzbek ?? []),
      ...(pkg.hashtags?.english ?? []),
    ].join(", "),
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            size: 24,
            color: "111827",
          },
          paragraph: {
            spacing: { line: 360 },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          type: SectionType.CONTINUOUS,
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1.2),
            },
            size: {
              orientation: PageOrientation.PORTRAIT,
              width: convertInchesToTwip(8.27),  // A4
              height: convertInchesToTwip(11.69), // A4
            },
            pageNumbers: {
              start: 1,
            },
          },
        },
        children: [
          ...coverContent,
          ...authorContent,
          ...tocContent,
          ...summaryContent,
          ...storyContent,
          ...moralContent,
          ...charactersContent,
          ...imageContent,
          ...hashtagContent,
        ],
      },
    ],
  });

  onProgress?.("DOCX yuklab olinmoqda…", 96);

  const { saveAs } = await getFileSaver();
  const buffer = await Packer.toBlob(doc);
  saveAs(buffer, buildFilename(pkg));

  onProgress?.("Tayyor!", 100);
}
