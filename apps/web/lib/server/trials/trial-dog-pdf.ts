import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const AJOK_TEMPLATE_RELATIVE_PATH = path.join(
  "public",
  "templates",
  "ajok-koirakohtainen-poytakirja.pdf",
);

export const DOG_REGISTRATION_NO_FIELD = {
  x: 286.3,
  y: 433,
  size: 12,
} as const;

export const DOG_NAME_FIELD = {
  x: 62.3,
  y: 433,
  size: 12,
} as const;

async function resolveTemplatePath(): Promise<string> {
  const candidates = [
    path.join(process.cwd(), AJOK_TEMPLATE_RELATIVE_PATH),
    path.join(process.cwd(), "apps", "web", AJOK_TEMPLATE_RELATIVE_PATH),
  ];

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next supported cwd shape.
    }
  }

  return candidates[0];
}

// Renders trial row data onto the static AJOK dog-specific protocol template.
export async function renderTrialDogPdf(input: {
  registrationNo: string;
  dogName: string | null;
}): Promise<Uint8Array> {
  const templatePath = await resolveTemplatePath();
  const templateBytes = await readFile(templatePath);
  const pdfDocument = await PDFDocument.load(templateBytes);
  const font = await pdfDocument.embedFont(StandardFonts.Helvetica);
  const page = pdfDocument.getPage(0);

  page.drawText(input.registrationNo, {
    x: DOG_REGISTRATION_NO_FIELD.x,
    y: DOG_REGISTRATION_NO_FIELD.y,
    size: DOG_REGISTRATION_NO_FIELD.size,
    font,
    color: rgb(0, 0, 0),
  });

  if (input.dogName) {
    page.drawText(input.dogName, {
      x: DOG_NAME_FIELD.x,
      y: DOG_NAME_FIELD.y,
      size: DOG_NAME_FIELD.size,
      font,
      color: rgb(0, 0, 0),
    });
  }

  return pdfDocument.save();
}
