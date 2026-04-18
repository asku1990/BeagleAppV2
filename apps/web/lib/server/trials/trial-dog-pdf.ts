import { access, readFile } from "node:fs/promises";
import path from "node:path";
import type { TrialDogPdfData } from "@contracts";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { drawTrialDogPdfKoeErat } from "./internal/koe-erat";
import { drawTrialDogPdfKokeenTiedot } from "./internal/kokeen-tiedot";
import { drawTrialDogPdfKoiranTiedot } from "./internal/koiran-tiedot";
import { drawTrialDogPdfKoiranTausta } from "./internal/koiran-tausta";

export { DOG_REGISTRATION_NO_FIELD } from "./internal/koiran-tiedot";

const AJOK_TEMPLATE_RELATIVE_PATH = path.join(
  "public",
  "templates",
  "ajok-koirakohtainen-poytakirja.pdf",
);

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
export async function renderTrialDogPdf(
  input: TrialDogPdfData,
): Promise<Uint8Array> {
  const templatePath = await resolveTemplatePath();
  const templateBytes = await readFile(templatePath);
  const pdfDocument = await PDFDocument.load(templateBytes);
  const font = await pdfDocument.embedFont(StandardFonts.Helvetica);
  const page = pdfDocument.getPage(0);

  drawTrialDogPdfKokeenTiedot({
    kennelpiiri: input.kennelpiiri,
    kennelpiirinro: input.kennelpiirinro,
    koekunta: input.koekunta,
    koepaiva: input.koepaiva,
    jarjestaja: input.jarjestaja,
    page,
    font,
  });

  drawTrialDogPdfKoiranTiedot({
    registrationNo: input.registrationNo,
    dogName: input.dogName,
    dogSex: input.dogSex,
    page,
    font,
  });

  drawTrialDogPdfKoiranTausta({
    sireName: input.sireName,
    sireRegistrationNo: input.sireRegistrationNo,
    damName: input.damName,
    damRegistrationNo: input.damRegistrationNo,
    omistaja: input.omistaja,
    omistajanKotikunta: input.omistajanKotikunta,
    page,
    font,
  });

  drawTrialDogPdfKoeErat({
    era1Alkoi: input.era1Alkoi,
    era2Alkoi: input.era2Alkoi,
    hakuMin1: input.hakuMin1,
    hakuMin2: input.hakuMin2,
    ajoMin1: input.ajoMin1,
    ajoMin2: input.ajoMin2,
    hyvaksytytAjominuutit: input.hyvaksytytAjominuutit,
    ajoajanPisteet: input.ajoajanPisteet,
    hakuEra1: input.hakuEra1,
    hakuEra2: input.hakuEra2,
    hakuKeskiarvo: input.hakuKeskiarvo,
    haukkuEra1: input.haukkuEra1,
    haukkuEra2: input.haukkuEra2,
    haukkuKeskiarvo: input.haukkuKeskiarvo,
    ajotaitoEra1: input.ajotaitoEra1,
    ajotaitoEra2: input.ajotaitoEra2,
    ajotaitoKeskiarvo: input.ajotaitoKeskiarvo,
    page,
    font,
  });

  return pdfDocument.save();
}
