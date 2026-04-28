// Orchestrates the AJOK 2005-2011 renderer. Sections are enabled one at a time
// while coordinates are tuned against the template.
import type { TrialDogPdfRenderContext } from "../types";
import { drawLegacy2005To2011KoiranTausta } from "./koiran-tausta";
import { drawLegacy2005To2011KoiranTiedot } from "./koiran-tiedot";
import { drawLegacy2005To2011KokeenTiedot } from "./kokeen-tiedot";

export function renderLegacy2005To2011TrialDogPdfFields({
  input,
  page,
  font,
}: TrialDogPdfRenderContext): void {
  drawLegacy2005To2011KokeenTiedot({
    kennelpiiri: input.kennelpiiri,
    kennelpiirinro: input.kennelpiirinro,
    koekunta: input.koekunta,
    koemaasto: input.koemaasto,
    koepaiva: input.koepaiva,
    jarjestaja: input.jarjestaja,
    page,
    font,
  });

  drawLegacy2005To2011KoiranTiedot({
    registrationNo: input.registrationNo,
    dogName: input.dogName,
    dogSex: input.dogSex,
    page,
    font,
  });

  drawLegacy2005To2011KoiranTausta({
    sireName: input.sireName,
    sireRegistrationNo: input.sireRegistrationNo,
    damName: input.damName,
    damRegistrationNo: input.damRegistrationNo,
    omistaja: input.omistaja,
    omistajanKotikunta: input.omistajanKotikunta,
    page,
    font,
  });
}
