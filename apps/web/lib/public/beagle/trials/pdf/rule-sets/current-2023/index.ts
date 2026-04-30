// Renderer for the 2023-> AJOK rule period.
// The permanent 2023 template is not yet available; this renderer uses the
// 2011-2023 PDF template and identical field coordinates as a stand-in.
// When the official template is delivered:
//   1. Replace apps/web/public/templates/ajok-poytakirja-2023.pdf.
//   2. Verify and adjust all coordinate constants in the sibling files.
//   3. Add/update any new lisatieto koodi rows.
//   4. Remove the NOT_FINAL_NOTICE draw call below.
import { rgb } from "pdf-lib";
import { drawTrialDogPdfAjoajanPisteytys } from "./ajoajan-pisteytys";
import { drawTrialDogPdfAllekirjoitukset } from "./allekirjoitukset";
import { drawTrialDogPdfAnsiopisteet } from "./ansiopisteet";
import { drawTrialDogPdfHuomautus } from "./huomautus";
import { drawTrialDogPdfKokeenTiedot } from "./kokeen-tiedot";
import { drawTrialDogPdfKoiranTausta } from "./koiran-tausta";
import { drawTrialDogPdfKoiranTiedot } from "./koiran-tiedot";
import {
  drawTrialDogPdfLisatiedotAjo,
  drawTrialDogPdfLisatiedotHaku,
  drawTrialDogPdfLisatiedotHaukku,
  drawTrialDogPdfLisatiedotMetsastysinto,
  drawTrialDogPdfLisatiedotMuutOminaisuudet,
  drawTrialDogPdfLisatiedotOlosuhteet,
} from "./lisatiedot";
import { drawTrialDogPdfLoppupisteet } from "./loppupisteet";
import { drawTrialDogPdfTappiopisteet } from "./tappiopisteet";
import type { TrialDogPdfRenderContext } from "../types";

// Visible notice stamped on every PDF until the official 2023 template
// replaces the temporary stand-in (see tech-debt.md).
const NOT_FINAL_NOTICE =
  "HUOM: Tämä ei ole lopullinen - väliaikainen PDF-pohja (2023->)";

export function renderCurrent2023TrialDogPdfFields({
  input,
  page,
  font,
}: TrialDogPdfRenderContext): void {
  const lisatiedotRows = input.lisatiedotRows ?? [];

  drawTrialDogPdfKokeenTiedot({
    kennelpiiri: input.kennelpiiri,
    kennelpiirinro: input.kennelpiirinro,
    koekunta: input.koekunta,
    koemaasto: input.koemaasto,
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
    metsastysintoEra1: input.metsastysintoEra1,
    metsastysintoEra2: input.metsastysintoEra2,
    metsastysintoKeskiarvo: input.metsastysintoKeskiarvo,
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

  drawTrialDogPdfLoppupisteet({
    loppupisteet: input.loppupisteet,
    paljasMaaTaiLumi: input.paljasMaaTaiLumi,
    luopui: input.luopui,
    suljettu: input.suljettu,
    keskeytetty: input.keskeytetty,
    koetyyppi: input.koetyyppi,
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

  drawTrialDogPdfLisatiedotOlosuhteet({ lisatiedotRows, page, font });
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

  // Temporary notice until the official 2023 template is available.
  const { height } = page.getSize();
  page.drawText(NOT_FINAL_NOTICE, {
    x: 35,
    y: height - 18,
    size: 8,
    font,
    color: rgb(0.75, 0.1, 0.1),
  });
}
