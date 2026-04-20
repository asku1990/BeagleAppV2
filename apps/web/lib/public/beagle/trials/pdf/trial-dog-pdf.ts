import { access, readFile } from "node:fs/promises";
import path from "node:path";
import type { TrialDogPdfPayload } from "@contracts";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { drawTrialDogPdfAjoajanPisteytys } from "./internal/ajoajan-pisteytys";
import { drawTrialDogPdfAnsiopisteet } from "./internal/ansiopisteet";
import { drawTrialDogPdfKokeenTiedot } from "./internal/kokeen-tiedot";
import { drawTrialDogPdfHuomautus } from "./internal/huomautus";
import { drawTrialDogPdfKoiranTiedot } from "./internal/koiran-tiedot";
import { drawTrialDogPdfKoiranTausta } from "./internal/koiran-tausta";
import { drawTrialDogPdfTappiopisteet } from "./internal/tappiopisteet";
import { drawTrialDogPdfLoppuppisteet } from "./internal/loppupisteet";
import { drawTrialDogPdfAllekirjoitukset } from "./internal/allekirjoitukset";
import {
  drawTrialDogPdfLisatiedotAjo,
  drawTrialDogPdfLisatiedotHaku,
  drawTrialDogPdfLisatiedotHaukku,
  drawTrialDogPdfLisatiedotMetsastysinto,
  drawTrialDogPdfLisatiedotMuutOminaisuudet,
  drawTrialDogPdfLisatiedotOlosuhteet,
} from "./internal/lisatiedot";

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
  input: TrialDogPdfPayload,
): Promise<Uint8Array> {
  const lisatiedotRows = input.lisatiedotRows ?? [];

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

  drawTrialDogPdfAjoajanPisteytys({
    era1Alkoi: input.era1Alkoi,
    era2Alkoi: input.era2Alkoi,
    hakuMin1: input.hakuMin1,
    hakuMin2: input.hakuMin2,
    ajoMin1: input.ajoMin1,
    ajoMin2: input.ajoMin2,
    hyvaksytytAjominuutit: input.hyvaksytytAjominuutit,
    ajoajanPisteet: input.ajoajanPisteet,
    page,
    font,
  });

  drawTrialDogPdfAnsiopisteet({
    hakuEra1: input.hakuEra1,
    hakuEra2: input.hakuEra2,
    hakuKeskiarvo: input.hakuKeskiarvo,
    haukkuEra1: input.haukkuEra1,
    haukkuEra2: input.haukkuEra2,
    haukkuKeskiarvo: input.haukkuKeskiarvo,
    ajotaitoEra1: input.ajotaitoEra1,
    ajotaitoEra2: input.ajotaitoEra2,
    ajotaitoKeskiarvo: input.ajotaitoKeskiarvo,
    ansiopisteetYhteensa: input.ansiopisteetYhteensa,
    page,
    font,
  });

  drawTrialDogPdfTappiopisteet({
    hakuloysyysTappioEra1: input.hakuloysyysTappioEra1,
    hakuloysyysTappioEra2: input.hakuloysyysTappioEra2,
    hakuloysyysTappioYhteensa: input.hakuloysyysTappioYhteensa,
    ajoloysyysTappioEra1: input.ajoloysyysTappioEra1,
    ajoloysyysTappioEra2: input.ajoloysyysTappioEra2,
    ajoloysyysTappioYhteensa: input.ajoloysyysTappioYhteensa,
    tappiopisteetYhteensa: input.tappiopisteetYhteensa,
    page,
    font,
  });

  drawTrialDogPdfLoppuppisteet({
    loppupisteet: input.loppupisteet,
    paljasMaaTaiLumi: input.paljasMaaTaiLumi,
    luopui: input.luopui,
    suljettu: input.suljettu,
    keskeytetty: input.keskeytetty,
    sijoitus: input.sijoitus,
    koiriaLuokassa: input.koiriaLuokassa,
    Palkinto: input.Palkinto,
    page,
    font,
  });

  drawTrialDogPdfHuomautus({
    huomautusTeksti: input.huomautusTeksti,
    page,
    font,
  });

  drawTrialDogPdfLisatiedotOlosuhteet({
    lisatiedotRows,
    page,
    font,
  });
  drawTrialDogPdfLisatiedotHaku({ lisatiedotRows, page, font });
  drawTrialDogPdfLisatiedotHaukku({ lisatiedotRows, page, font });
  drawTrialDogPdfLisatiedotMetsastysinto({ lisatiedotRows, page, font });
  drawTrialDogPdfLisatiedotAjo({ lisatiedotRows, page, font });
  drawTrialDogPdfLisatiedotMuutOminaisuudet({ lisatiedotRows, page, font });

  drawTrialDogPdfAllekirjoitukset({
    ryhmatuomariNimi: input.ryhmatuomariNimi,
    palkintotuomariNimi: input.palkintotuomariNimi,
    ylituomariNumeroSnapshot: input.ylituomariNumeroSnapshot,
    ylituomariNimiSnapshot: input.ylituomariNimiSnapshot,
    page,
    font,
  });

  return pdfDocument.save();
}
