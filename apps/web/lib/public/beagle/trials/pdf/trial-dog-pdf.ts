import { access, readFile } from "node:fs/promises";
import path from "node:path";
import type { TrialDogPdfPayload } from "@contracts";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { resolveTrialDogPdfRuleSet } from "./rule-sets";

export { DOG_REGISTRATION_NO_FIELD } from "./internal/koiran-tiedot";
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

// Renders trial row data onto the static AJOK dog-specific protocol template.
export async function renderTrialDogPdf(
  input: TrialDogPdfPayload,
): Promise<Uint8Array> {
  const ruleSet = resolveTrialDogPdfRuleSet(input.trialRuleWindowId);
  const templatePath = await resolveTemplatePath(input.trialRuleWindowId);
  const templateBytes = await readFile(templatePath);
  const pdfDocument = await PDFDocument.load(templateBytes);

  if (ruleSet.status === "blank-only") {
    return pdfDocument.save();
  }

  if (!ruleSet.renderFields) {
    throw new Error(`PDF rule set ${ruleSet.id} is missing a field renderer.`);
  }

  const font = await pdfDocument.embedFont(StandardFonts.Helvetica);
  const page = pdfDocument.getPage(0);

  ruleSet.renderFields({
    pdfDocument,
    page,
    font,
    input,
  });

  return pdfDocument.save();
}
