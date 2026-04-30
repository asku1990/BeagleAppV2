import type { PDFFont, PDFPage } from "pdf-lib";
import { rgb } from "pdf-lib";
import type { TrialDogPdfHuomautus } from "@contracts";

const HUOMAUTUS_BLOCK = {
  x: 35.5,
  y: 68,
  maxWidth: 365,
  maxHeight: 68,
  size: 10,
  lineHeight: 16,
} as const;

function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  const lines: string[] = [];
  const paragraphs = text.replace(/\r/g, "").split("\n");

  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push("");
      continue;
    }

    let currentLine = words[0];
    for (const word of words.slice(1)) {
      const candidate = `${currentLine} ${word}`;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        currentLine = candidate;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }

    lines.push(currentLine);
  }

  return lines;
}

// Renders the free-text note in its own sized block.
export function drawTrialDogPdfHuomautus(
  input: TrialDogPdfHuomautus & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  if (!input.huomautusTeksti) {
    return;
  }

  const maxLines = Math.max(
    1,
    Math.floor(HUOMAUTUS_BLOCK.maxHeight / HUOMAUTUS_BLOCK.lineHeight),
  );
  const lines = wrapText(
    input.huomautusTeksti,
    input.font,
    HUOMAUTUS_BLOCK.size,
    HUOMAUTUS_BLOCK.maxWidth,
  );
  const visibleLines = lines.slice(0, maxLines);
  input.page.drawText(visibleLines.join("\n"), {
    x: HUOMAUTUS_BLOCK.x,
    y: HUOMAUTUS_BLOCK.y,
    size: HUOMAUTUS_BLOCK.size,
    font: input.font,
    color: rgb(0, 0, 0),
    lineHeight: HUOMAUTUS_BLOCK.lineHeight,
  });
}
