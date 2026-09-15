import { access, readFile } from "node:fs/promises";
import path from "node:path";
import type { TrialDogPdfPayload } from "@contracts";
import { PDFDocument, type PDFFont, StandardFonts } from "pdf-lib";
import { resolveTrialDogPdfRuleSet } from "./rule-sets";

const PDF_LAYOUT_CHARACTERS = new Set(["\t", "\n", "\r"]);

export type TrialDogPdfSanitization = {
  registrationNo: string;
  trialRuleWindowId: string | null;
  removedCharacterCount: number;
};

export { DOG_REGISTRATION_NO_FIELD } from "./rule-sets/legacy-2011-2023/koiran-tiedot";
export {
  canRenderTrialDogPdf,
  getSeededTrialDogPdfRuleWindowIds,
  getTrialDogPdfRuleSetId,
  getTrialDogPdfRuleSetStatus,
  TRIAL_RULE_WINDOW_IDS,
} from "./rule-sets";

export function getTrialDogPdfTemplateFileName(
  ruleWindowId: string | null,
): string | null {
  const templateRelativePath =
    resolveTrialDogPdfRuleSet(ruleWindowId).templateRelativePath;

  return templateRelativePath ? path.basename(templateRelativePath) : null;
}

async function resolveTemplatePath(
  ruleWindowId: string | null,
): Promise<string> {
  const ruleSet = resolveTrialDogPdfRuleSet(ruleWindowId);
  const templateRelativePath = ruleSet.templateRelativePath;

  if (!templateRelativePath) {
    throw new Error(`PDF rule set ${ruleSet.id} has no template.`);
  }

  const candidates = [
    path.join(process.cwd(), templateRelativePath),
    path.join(process.cwd(), "apps", "web", templateRelativePath),
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

function sanitizePdfString(
  value: string,
  font: PDFFont,
): { value: string; removedCharacterCount: number } {
  let removedCharacterCount = 0;
  const sanitizedValue = Array.from(value)
    .filter((character) => {
      if (PDF_LAYOUT_CHARACTERS.has(character)) {
        return true;
      }

      try {
        font.encodeText(character);
        return true;
      } catch {
        removedCharacterCount += 1;
        return false;
      }
    })
    .join("");

  return { value: sanitizedValue, removedCharacterCount };
}

export function sanitizeTrialDogPdfPayload(
  input: TrialDogPdfPayload,
  font: PDFFont,
  onSanitized?: (details: TrialDogPdfSanitization) => void,
): TrialDogPdfPayload {
  let removedCharacterCount = 0;
  const sanitizedInput = Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      key,
      typeof value === "string"
        ? (() => {
            const sanitized = sanitizePdfString(value, font);
            removedCharacterCount += sanitized.removedCharacterCount;
            return sanitized.value;
          })()
        : Array.isArray(value)
          ? value.map((row) =>
              Object.fromEntries(
                Object.entries(row).map(([rowKey, rowValue]) => {
                  if (typeof rowValue !== "string") {
                    return [rowKey, rowValue];
                  }

                  const sanitized = sanitizePdfString(rowValue, font);
                  removedCharacterCount += sanitized.removedCharacterCount;
                  return [rowKey, sanitized.value];
                }),
              ),
            )
          : value,
    ]),
  ) as TrialDogPdfPayload;

  if (removedCharacterCount > 0 && onSanitized) {
    onSanitized({
      registrationNo: sanitizedInput.registrationNo,
      trialRuleWindowId: input.trialRuleWindowId,
      removedCharacterCount,
    });
  }

  return sanitizedInput;
}

// Renders trial row data onto the static AJOK dog-specific protocol template.
export async function renderTrialDogPdf(
  input: TrialDogPdfPayload,
  onSanitized?: (details: TrialDogPdfSanitization) => void,
): Promise<Uint8Array> {
  const ruleSet = resolveTrialDogPdfRuleSet(input.trialRuleWindowId);
  const templatePath = await resolveTemplatePath(input.trialRuleWindowId);
  const templateBytes = await readFile(templatePath);
  const pdfDocument = await PDFDocument.load(templateBytes);

  if (!ruleSet.renderFields) {
    throw new Error(`PDF rule set ${ruleSet.id} is missing a field renderer.`);
  }

  const font = await pdfDocument.embedFont(StandardFonts.Helvetica);
  const page = pdfDocument.getPage(0);
  const sanitizedInput = sanitizeTrialDogPdfPayload(input, font, onSanitized);

  ruleSet.renderFields({
    pdfDocument,
    page,
    font,
    input: sanitizedInput,
  });

  return pdfDocument.save();
}
