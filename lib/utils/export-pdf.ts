// ============================================================
// PDF Export — Children's Book PDF Generator
// Uses jsPDF (client-side only) to produce a professional A4
// children's book with cover, TOC, story pages, moral page,
// page numbers, decorative elements, and metadata.
// ============================================================
// Install: npm install jspdf
// ============================================================

import type { StoryPackage } from "@/types";
import { generateBook, type Book, type BookPage } from "./book-generator";

// ── Config ────────────────────────────────────────────────

const PAGE_W = 210; // A4 width mm
const PAGE_H = 297; // A4 height mm
const MARGIN = 18; // page margin mm
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_Y = PAGE_H - 12;

// Brand colours (RGB)
const COLOR = {
  amber: [251, 176, 34] as [number, number, number],
  amberLight: [255, 243, 200] as [number, number, number],
  amberDark: [180, 100, 10] as [number, number, number],
  orange: [249, 115, 22] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  black: [20, 20, 20] as [number, number, number],
  gray: [100, 100, 100] as [number, number, number],
  grayLight: [240, 240, 235] as [number, number, number],
  green: [34, 197, 94] as [number, number, number],
  greenLight: [220, 252, 231] as [number, number, number],
  sky: [14, 165, 233] as [number, number, number],
  skyLight: [224, 242, 254] as [number, number, number],
};

// ── Progress callback type ────────────────────────────────

export type PdfProgressCallback = (step: string, percent: number) => void;

// ── Dynamic import helper ─────────────────────────────────

async function getJsPDF() {
  const { jsPDF } = await import("jspdf");
  return jsPDF;
}

// ── Drawing primitives ────────────────────────────────────

type JsPDFInstance = InstanceType<Awaited<ReturnType<typeof getJsPDF>>>;

function setFill(doc: JsPDFInstance, color: [number, number, number]) {
  doc.setFillColor(color[0], color[1], color[2]);
}

function setDraw(doc: JsPDFInstance, color: [number, number, number]) {
  doc.setDrawColor(color[0], color[1], color[2]);
}

function setTextColor(doc: JsPDFInstance, color: [number, number, number]) {
  doc.setTextColor(color[0], color[1], color[2]);
}

function rect(
  doc: JsPDFInstance,
  x: number,
  y: number,
  w: number,
  h: number,
  style: "F" | "S" | "FD" = "F"
) {
  doc.rect(x, y, w, h, style);
}

function roundedRect(
  doc: JsPDFInstance,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  style: "F" | "S" | "FD" = "F"
) {
  doc.roundedRect(x, y, w, h, r, r, style);
}

/**
 * Wraps text to fit within maxWidth using doc.splitTextToSize,
 * then renders each line.  Returns the Y position after the last line.
 */
function wrappedText(
  doc: JsPDFInstance,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const lines: string[] = doc.splitTextToSize(text, maxWidth);
  lines.forEach((line: string, i: number) => {
    doc.text(line, x, y + i * lineHeight);
  });
  return y + lines.length * lineHeight;
}

/** Draws a light horizontal rule */
function hRule(
  doc: JsPDFInstance,
  y: number,
  color: [number, number, number] = COLOR.amberLight
) {
  setDraw(doc, color);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  doc.setLineWidth(0.2);
}

/** Decorative corner stars / dots */
function decorativeCorners(doc: JsPDFInstance) {
  const stars = ["✦", "✦", "✦", "✦"];
  const positions = [
    [MARGIN - 6, MARGIN - 2],
    [PAGE_W - MARGIN + 2, MARGIN - 2],
    [MARGIN - 6, PAGE_H - MARGIN + 4],
    [PAGE_W - MARGIN + 2, PAGE_H - MARGIN + 4],
  ];
  setTextColor(doc, COLOR.amberLight);
  doc.setFontSize(8);
  positions.forEach(([x, y], i) => {
    doc.text(stars[i], x, y);
  });
}

/** Page footer with page number and book title */
function drawFooter(
  doc: JsPDFInstance,
  pageNum: number,
  bookTitle: string,
  totalPages: number
) {
  hRule(doc, FOOTER_Y - 4, COLOR.amberLight);
  doc.setFontSize(8);
  setTextColor(doc, COLOR.gray);
  doc.setFont("helvetica", "normal");

  // Left: book title (truncated)
  const shortTitle =
    bookTitle.length > 40 ? bookTitle.slice(0, 38) + "…" : bookTitle;
  doc.text(shortTitle, MARGIN, FOOTER_Y);

  // Right: page number
  doc.text(`${pageNum} / ${totalPages}`, PAGE_W - MARGIN, FOOTER_Y, {
    align: "right",
  });

  // Centre: decorative dot
  setTextColor(doc, COLOR.amber);
  doc.text("✦", PAGE_W / 2, FOOTER_Y, { align: "center" });
}

// ── Page renderers ────────────────────────────────────────

function renderCoverPage(doc: JsPDFInstance, book: Book) {
  // Full-page amber gradient background
  setFill(doc, COLOR.amber);
  rect(doc, 0, 0, PAGE_W, PAGE_H);

  // Decorative top stripe
  setFill(doc, COLOR.orange);
  rect(doc, 0, 0, PAGE_W, 8);
  rect(doc, 0, PAGE_H - 8, PAGE_W, 8);

  // White content card
  setFill(doc, COLOR.white);
  roundedRect(doc, MARGIN, 30, CONTENT_W, PAGE_H - 60, 8);

  // Big emoji / icon area
  doc.setFontSize(52);
  doc.text("📚", PAGE_W / 2, 72, { align: "center" });

  // Title
  setTextColor(doc, COLOR.black);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  const titleLines: string[] = doc.splitTextToSize(book.title, CONTENT_W - 16);
  let y = 95;
  titleLines.forEach((line: string) => {
    doc.text(line, PAGE_W / 2, y, { align: "center" });
    y += 10;
  });

  // Subtitle — age category
  y += 6;
  setFill(doc, COLOR.amberLight);
  roundedRect(doc, PAGE_W / 2 - 30, y - 5, 60, 10, 3);
  setTextColor(doc, COLOR.amberDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`${book.ageCategory} yosh uchun`, PAGE_W / 2, y + 1, {
    align: "center",
  });

  y += 22;
  hRule(doc, y, COLOR.amberLight);
  y += 10;

  // Summary preview
  setTextColor(doc, COLOR.gray);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const summaryLines: string[] = doc.splitTextToSize(
    book.pages.find((p) => p.type === "cover")?.content ?? "",
    CONTENT_W - 20
  );
  const previewLines = summaryLines.slice(0, 6);
  previewLines.forEach((line: string) => {
    doc.text(line, PAGE_W / 2, y, { align: "center" });
    y += 6;
  });

  y += 10;
  hRule(doc, y, COLOR.amberLight);
  y += 12;

  // Publisher line
  setTextColor(doc, COLOR.amberDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Bolalar Uchun Ertak · AI Ertak Yaratuvchi", PAGE_W / 2, y, {
    align: "center",
  });

  // Footer strip text
  setTextColor(doc, COLOR.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("O'zbek tilida · Ta'limiy kontent · Bolalar uchun", PAGE_W / 2, PAGE_H - 4, {
    align: "center",
  });
}

function renderAuthorPage(doc: JsPDFInstance, page: BookPage, book: Book) {
  decorativeCorners(doc);

  // Section accent
  setFill(doc, COLOR.amberLight);
  rect(doc, MARGIN, 20, CONTENT_W, 1.5);
  rect(doc, MARGIN, 22, 4, 22);
  setFill(doc, COLOR.amber);
  rect(doc, MARGIN, 22, 4, 22);

  // Title
  setTextColor(doc, COLOR.black);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Muallif sahifasi", MARGIN + 10, 36);

  setFill(doc, COLOR.amberLight);
  roundedRect(doc, MARGIN, 50, CONTENT_W, PAGE_H - 80, 6);

  let y = 66;
  const lines = page.content.split("\n").filter(Boolean);
  lines.forEach((line) => {
    const isLabel = line.includes(":");
    if (isLabel) {
      const [label, ...rest] = line.split(":");
      const value = rest.join(":").trim();
      setTextColor(doc, COLOR.amberDark);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(label + ":", MARGIN + 8, y);
      setTextColor(doc, COLOR.black);
      doc.setFont("helvetica", "normal");
      const valLines: string[] = doc.splitTextToSize(value, CONTENT_W - 70);
      valLines.forEach((vl: string, vi: number) => {
        doc.text(vl, MARGIN + 55, y + vi * 5);
      });
      y += Math.max(8, valLines.length * 5 + 3);
    } else {
      y += 4;
      setTextColor(doc, COLOR.gray);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      const wrapped: string[] = doc.splitTextToSize(line, CONTENT_W - 16);
      wrapped.forEach((wl: string) => {
        doc.text(wl, MARGIN + 8, y);
        y += 5;
      });
      y += 2;
    }
  });

  drawFooter(doc, page.pageNumber, book.title, book.totalPages);
}

function renderTocPage(doc: JsPDFInstance, page: BookPage, book: Book) {
  decorativeCorners(doc);

  // Header background
  setFill(doc, COLOR.amber);
  rect(doc, 0, 0, PAGE_W, 36);

  setTextColor(doc, COLOR.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Mundarija", PAGE_W / 2, 24, { align: "center" });

  let y = 54;

  book.toc.forEach((entry, idx) => {
    const isEven = idx % 2 === 0;
    if (isEven) {
      setFill(doc, COLOR.grayLight);
      rect(doc, MARGIN - 2, y - 5, CONTENT_W + 4, 9);
    }

    // Type icon
    const icons: Record<string, string> = {
      dedication: "📝",
      "story-opening": "📖",
      "story-body": "📄",
      "story-closing": "🌅",
      moral: "🌟",
      characters: "👥",
      "image-prompts": "🖼️",
    };
    const icon = icons[entry.type] ?? "•";

    setTextColor(doc, COLOR.black);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(icon, MARGIN + 2, y);

    doc.text(entry.title, MARGIN + 10, y);

    // Dots
    setTextColor(doc, COLOR.gray);
    doc.setFontSize(8);
    const dots =
      "· · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·";
    const titleWidth = doc.getTextWidth(entry.title);
    const dotsX = MARGIN + 10 + titleWidth + 3;
    const dotsWidth = PAGE_W - MARGIN - 22 - dotsX;
    if (dotsWidth > 10) {
      const dotsStr = doc.splitTextToSize(dots, dotsWidth)[0];
      doc.text(dotsStr, dotsX, y);
    }

    // Page number
    setTextColor(doc, COLOR.amberDark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(String(entry.pageNumber), PAGE_W - MARGIN, y, { align: "right" });

    y += 10;
  });

  drawFooter(doc, page.pageNumber, book.title, book.totalPages);
}

function renderDedicationPage(doc: JsPDFInstance, page: BookPage, book: Book) {
  decorativeCorners(doc);

  // Amber top bar
  setFill(doc, COLOR.amber);
  rect(doc, 0, 0, PAGE_W, 4);

  setTextColor(doc, COLOR.amberDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Qisqa mazmun", MARGIN, 22);

  hRule(doc, 26);

  setFill(doc, COLOR.amberLight);
  roundedRect(doc, MARGIN, 32, CONTENT_W, 8 + doc.splitTextToSize(page.content, CONTENT_W - 10).length * 6.5, 5);

  setTextColor(doc, COLOR.black);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(11);
  wrappedText(doc, page.content, MARGIN + 6, 44, CONTENT_W - 12, 6.5);

  drawFooter(doc, page.pageNumber, book.title, book.totalPages);
}

function renderStoryPage(doc: JsPDFInstance, page: BookPage, book: Book) {
  decorativeCorners(doc);

  // Top accent bar
  setFill(doc, COLOR.amber);
  rect(doc, 0, 0, PAGE_W, 4);

  // Chapter heading (only for opening and closing pages)
  if (page.type === "story-opening" || page.type === "story-closing") {
    const headings: Record<string, string> = {
      "story-opening": "🌅  Boshlanish",
      "story-closing": "🌟  Yakun",
    };
    setTextColor(doc, COLOR.amberDark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(headings[page.type] ?? page.title, MARGIN, 20);
    hRule(doc, 24);
  }

  const textStartY = page.type === "story-opening" || page.type === "story-closing" ? 34 : 20;

  // Story subtitle on opening page
  if (page.type === "story-opening" && page.subtitle) {
    setTextColor(doc, COLOR.black);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    const subLines: string[] = doc.splitTextToSize(page.subtitle, CONTENT_W);
    subLines.slice(0, 2).forEach((line: string, i: number) => {
      doc.text(line, PAGE_W / 2, textStartY + i * 8, { align: "center" });
    });
    hRule(doc, textStartY + subLines.length * 8 + 2);
  }

  const bodyY =
    page.type === "story-opening" && page.subtitle
      ? textStartY +
        Math.min(2, doc.splitTextToSize(page.subtitle, CONTENT_W).length) * 8 + 12
      : textStartY + 6;

  // Story body text
  setTextColor(doc, COLOR.black);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const paragraphs = page.content.split(/\n{1,}/).filter(Boolean);
  let y = bodyY;
  for (const para of paragraphs) {
    if (y > FOOTER_Y - 20) break; // safety: don't overflow into footer
    const lines: string[] = doc.splitTextToSize(para, CONTENT_W);
    lines.forEach((line: string) => {
      if (y <= FOOTER_Y - 16) {
        doc.text(line, MARGIN, y);
        y += 6.5;
      }
    });
    y += 3; // paragraph spacing
  }

  drawFooter(doc, page.pageNumber, book.title, book.totalPages);
}

function renderMoralPage(doc: JsPDFInstance, page: BookPage, book: Book) {
  decorativeCorners(doc);

  // Green accent header
  setFill(doc, COLOR.green);
  rect(doc, 0, 0, PAGE_W, 4);

  // Star icon
  doc.setFontSize(32);
  doc.text("🌟", PAGE_W / 2, 30, { align: "center" });

  setTextColor(doc, COLOR.black);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Saboq va Xulosa", PAGE_W / 2, 45, { align: "center" });

  hRule(doc, 50, COLOR.greenLight);

  // Moral text in a coloured box
  const moralLines: string[] = doc.splitTextToSize(page.content, CONTENT_W - 20);
  const boxH = moralLines.length * 7 + 20;

  setFill(doc, COLOR.greenLight);
  roundedRect(doc, MARGIN, 58, CONTENT_W, boxH, 6);
  setDraw(doc, COLOR.green);
  doc.setLineWidth(0.5);
  roundedRect(doc, MARGIN, 58, CONTENT_W, boxH, 6, "S");
  doc.setLineWidth(0.2);

  setTextColor(doc, [15, 90, 50] as [number, number, number]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  let y = 72;
  moralLines.forEach((line: string) => {
    doc.text(line, PAGE_W / 2, y, { align: "center" });
    y += 7;
  });

  // Parent note
  if (page.subtitle) {
    y += 8;
    setTextColor(doc, COLOR.gray);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("👨‍👩‍👧  Ota-onalar uchun izoh:", MARGIN, y);
    y += 7;

    setFill(doc, COLOR.skyLight);
    const pNoteLines: string[] = doc.splitTextToSize(page.subtitle, CONTENT_W - 16);
    const pNoteH = pNoteLines.length * 6 + 12;
    roundedRect(doc, MARGIN, y - 4, CONTENT_W, pNoteH, 4);

    setTextColor(doc, [20, 80, 120] as [number, number, number]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    pNoteLines.forEach((line: string) => {
      doc.text(line, MARGIN + 8, y + 4);
      y += 6;
    });
  }

  drawFooter(doc, page.pageNumber, book.title, book.totalPages);
}

function renderCharactersPage(doc: JsPDFInstance, page: BookPage, book: Book) {
  decorativeCorners(doc);

  setFill(doc, COLOR.sky);
  rect(doc, 0, 0, PAGE_W, 4);

  doc.setFontSize(22);
  doc.text("👥", MARGIN, 22);

  setTextColor(doc, COLOR.black);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Qahramonlar", MARGIN + 12, 22);

  hRule(doc, 28, COLOR.skyLight);

  let y = 42;
  const blocks = page.content.split(/\n{2,}/);
  blocks.forEach((block, idx) => {
    const [nameLine, ...descLines] = block.split("\n");
    const [name, role] = nameLine.split("(");

    setFill(doc, idx % 2 === 0 ? COLOR.skyLight : COLOR.amberLight);
    const blockH = descLines.length * 5.5 + 18;
    roundedRect(doc, MARGIN, y, CONTENT_W, blockH, 4);

    setTextColor(doc, COLOR.black);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(name?.trim() ?? "", MARGIN + 6, y + 8);

    if (role) {
      setFill(doc, COLOR.amber);
      const roleText = role.replace(")", "").trim();
      const roleW = doc.getTextWidth(roleText) + 6;
      roundedRect(doc, MARGIN + doc.getTextWidth(name?.trim() ?? "") + 10, y + 2, roleW, 7, 2);
      setTextColor(doc, COLOR.white);
      doc.setFontSize(8);
      doc.text(roleText, MARGIN + doc.getTextWidth(name?.trim() ?? "") + 13, y + 7);
    }

    setTextColor(doc, COLOR.gray);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    let dy = y + 14;
    descLines.forEach((dl) => {
      const wrapped: string[] = doc.splitTextToSize(dl, CONTENT_W - 12);
      wrapped.forEach((wl: string) => {
        doc.text(wl, MARGIN + 6, dy);
        dy += 5.5;
      });
    });
    y += blockH + 5;
    if (y > FOOTER_Y - 20) return;
  });

  drawFooter(doc, page.pageNumber, book.title, book.totalPages);
}

function renderImagePromptsPage(
  doc: JsPDFInstance,
  page: BookPage,
  book: Book
) {
  decorativeCorners(doc);

  setFill(doc, [120, 60, 200] as [number, number, number]);
  rect(doc, 0, 0, PAGE_W, 4);

  doc.setFontSize(20);
  doc.text("🖼️", MARGIN, 22);

  setTextColor(doc, COLOR.black);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Rasm Tavsiflar", MARGIN + 12, 22);

  hRule(doc, 28, [220, 200, 250] as [number, number, number]);

  let y = 40;
  const blocks = page.content.split(/\n{2,}/);
  blocks.forEach((block) => {
    const [sceneLine, promptLine] = block.split("\n");
    if (!sceneLine) return;

    // Scene label chip
    setFill(doc, [240, 230, 255] as [number, number, number]);
    const labelW = doc.getTextWidth(sceneLine) + 10;
    roundedRect(doc, MARGIN, y - 4, Math.min(labelW, CONTENT_W), 7, 2);

    setTextColor(doc, [80, 20, 180] as [number, number, number]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(sceneLine, MARGIN + 4, y + 0.5);

    y += 8;

    // Prompt text in mono-style box
    if (promptLine) {
      const promptLines: string[] = doc.splitTextToSize(promptLine, CONTENT_W - 8);
      const boxH = promptLines.length * 5.5 + 8;
      setFill(doc, COLOR.grayLight);
      roundedRect(doc, MARGIN, y, CONTENT_W, boxH, 3);
      setTextColor(doc, COLOR.black);
      doc.setFont("courier", "normal");
      doc.setFontSize(8);
      let py = y + 5;
      promptLines.forEach((pl: string) => {
        doc.text(pl, MARGIN + 4, py);
        py += 5.5;
      });
      y += boxH + 5;
    }

    if (y > FOOTER_Y - 15) return;
  });

  drawFooter(doc, page.pageNumber, book.title, book.totalPages);
}

function renderHashtagsPage(doc: JsPDFInstance, page: BookPage, book: Book) {
  decorativeCorners(doc);

  setFill(doc, COLOR.orange);
  rect(doc, 0, 0, PAGE_W, 4);

  doc.setFontSize(20);
  doc.text("📣", MARGIN, 22);

  setTextColor(doc, COLOR.black);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Xeshteglar", MARGIN + 12, 22);

  hRule(doc, 28, COLOR.amberLight);

  const tags = page.content.split(/\s+/).filter((t) => t.startsWith("#"));
  let x = MARGIN;
  let y = 42;

  tags.forEach((tag) => {
    doc.setFontSize(9);
    const tagW = doc.getTextWidth(tag) + 8;
    if (x + tagW > PAGE_W - MARGIN) {
      x = MARGIN;
      y += 12;
    }
    setFill(doc, COLOR.amberLight);
    roundedRect(doc, x, y - 5, tagW, 8, 2);
    setTextColor(doc, COLOR.amberDark);
    doc.setFont("helvetica", "bold");
    doc.text(tag, x + 4, y + 0.5);
    x += tagW + 4;
  });

  drawFooter(doc, page.pageNumber, book.title, book.totalPages);
}

function renderBackCoverPage(doc: JsPDFInstance, book: Book) {
  // Full amber background
  setFill(doc, COLOR.amber);
  rect(doc, 0, 0, PAGE_W, PAGE_H);

  setFill(doc, COLOR.orange);
  rect(doc, 0, 0, PAGE_W, 8);
  rect(doc, 0, PAGE_H - 8, PAGE_W, 8);

  // White card
  setFill(doc, COLOR.white);
  roundedRect(doc, MARGIN, 40, CONTENT_W, PAGE_H - 80, 8);

  // Big emoji
  doc.setFontSize(36);
  doc.text("🌟", PAGE_W / 2, 78, { align: "center" });

  setTextColor(doc, COLOR.black);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Saboq", PAGE_W / 2, 92, { align: "center" });

  hRule(doc, 96, COLOR.amberLight);

  // Moral lesson
  const moralPage = book.pages.find((p) => p.type === "moral");
  if (moralPage) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    setTextColor(doc, COLOR.black);
    const lines: string[] = doc.splitTextToSize(moralPage.content, CONTENT_W - 20);
    lines.slice(0, 6).forEach((line: string, i: number) => {
      doc.text(line, PAGE_W / 2, 108 + i * 7, { align: "center" });
    });
  }

  // Title
  hRule(doc, PAGE_H - 60, COLOR.amberLight);
  setTextColor(doc, COLOR.amberDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  const titleLines: string[] = doc.splitTextToSize(book.title, CONTENT_W - 10);
  titleLines.slice(0, 2).forEach((line: string, i: number) => {
    doc.text(line, PAGE_W / 2, PAGE_H - 52 + i * 7, { align: "center" });
  });

  // Bottom publisher
  setTextColor(doc, COLOR.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(
    "Bolalar Uchun Ertak · AI Ertak Yaratuvchi · O'zbek tilida",
    PAGE_W / 2,
    PAGE_H - 4,
    { align: "center" }
  );
}

// ── Page dispatch ─────────────────────────────────────────

function renderPage(doc: JsPDFInstance, page: BookPage, book: Book) {
  switch (page.type) {
    case "cover":
      renderCoverPage(doc, book);
      break;
    case "author":
      renderAuthorPage(doc, page, book);
      break;
    case "toc":
      renderTocPage(doc, page, book);
      break;
    case "dedication":
      renderDedicationPage(doc, page, book);
      break;
    case "story-opening":
    case "story-body":
    case "story-closing":
      renderStoryPage(doc, page, book);
      break;
    case "moral":
      renderMoralPage(doc, page, book);
      break;
    case "characters":
      renderCharactersPage(doc, page, book);
      break;
    case "image-prompts":
      renderImagePromptsPage(doc, page, book);
      break;
    case "hashtags":
      renderHashtagsPage(doc, page, book);
      break;
    case "back-cover":
      renderBackCoverPage(doc, book);
      break;
  }
}

// ── Filename helper ───────────────────────────────────────

function buildFilename(pkg: StoryPackage): string {
  const safe = pkg.title
    .replace(/[^\w\s\u0400-\u04FF\u00C0-\u024F]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 40);
  const date = new Date(pkg.generatedAt).toISOString().slice(0, 10);
  return `${safe || "ertak"}-${date}.pdf`;
}

// ── Main export function ──────────────────────────────────

/**
 * Generates a professional children's book PDF from a StoryPackage.
 * Triggers a browser download when complete.
 *
 * @param pkg         The StoryPackage to export
 * @param onProgress  Optional progress callback (step label, 0-100)
 */
export async function exportPdf(
  pkg: StoryPackage,
  onProgress?: PdfProgressCallback
): Promise<void> {
  if (typeof window === "undefined") return;

  onProgress?.("Kitob strukturasi yaratilmoqda…", 5);

  // Build book structure
  const book = generateBook(pkg);

  onProgress?.("PDF yaratilmoqda…", 15);

  // Dynamically load jsPDF (avoids SSR issues)
  const JsPDF = await getJsPDF();
  const doc = new JsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const totalPages = book.pages.length;

  for (let i = 0; i < totalPages; i++) {
    const page = book.pages[i];
    if (i > 0) doc.addPage();

    const percent = 15 + Math.round((i / totalPages) * 75);
    onProgress?.(`Sahifa ${i + 1} / ${totalPages} yozilmoqda…`, percent);

    renderPage(doc, page, book);
  }

  onProgress?.("PDF yuklab olinmoqda…", 95);

  doc.save(buildFilename(pkg));

  onProgress?.("Tayyor!", 100);
}
