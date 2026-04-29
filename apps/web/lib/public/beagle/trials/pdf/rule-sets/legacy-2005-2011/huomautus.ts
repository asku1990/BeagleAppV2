// Renders the free-text note for the AJOK 2005-2011 PDF.
// Coordinates are intentionally local so the template fit can be tuned in one place.
import type { TrialDogPdfHuomautus } from "@contracts";
import type { PDFFont, PDFPage } from "pdf-lib";
import { rgb } from "pdf-lib";

export const LEGACY_2005_2011_HUOMAUTUS_BLOCK = {
  x: 35.5,
  y: 286,
  maxWidth: 365,
  maxHeight: 52,
  size: 10,
  lineHeight: 14,
} as const;

function wrapLegacy2005To2011Text(
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

export function drawLegacy2005To2011Huomautus(
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
    Math.floor(
      LEGACY_2005_2011_HUOMAUTUS_BLOCK.maxHeight /
        LEGACY_2005_2011_HUOMAUTUS_BLOCK.lineHeight,
    ),
  );
  const lines = wrapLegacy2005To2011Text(
    input.huomautusTeksti,
    input.font,
    LEGACY_2005_2011_HUOMAUTUS_BLOCK.size,
    LEGACY_2005_2011_HUOMAUTUS_BLOCK.maxWidth,
  );
  const visibleLines = lines.slice(0, maxLines);

  input.page.drawText(visibleLines.join("\n"), {
    x: LEGACY_2005_2011_HUOMAUTUS_BLOCK.x,
    y: LEGACY_2005_2011_HUOMAUTUS_BLOCK.y,
    size: LEGACY_2005_2011_HUOMAUTUS_BLOCK.size,
    font: input.font,
    color: rgb(0, 0, 0),
    lineHeight: LEGACY_2005_2011_HUOMAUTUS_BLOCK.lineHeight,
  });
}
